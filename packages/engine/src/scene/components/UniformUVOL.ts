/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { getState } from '@etherealengine/hyperflux'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Clock,
  CompressedTexture,
  InterleavedBufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry
} from 'three'
import { AudioState } from '../../audio/AudioState'
import { Engine } from '../../ecs/classes/Engine'
import { defineComponent, getMutableComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import {
  AudioFileFormat,
  FORMAT_TO_EXTENSION,
  GeometryFormat,
  PlayerManifest,
  TextureFormat,
  TextureType,
  UniformSolveTarget
} from '../constants/UVOLTypes'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MediaElementComponent } from './MediaComponent'
import { VolumetricComponent } from './VolumetricComponent'

export const UniformUVOL = defineComponent({
  name: 'UniformUVOL',

  onInit: (entity) => {
    return {
      manifestPath: '',
      data: {} as PlayerManifest,
      hasAudio: false,
      geometryTarget: '',
      textureTarget: {} as Partial<Record<TextureType, string>>
    }
  },

  reactor: UniformUVOLReactor
})

const getMeshFromGLTF = (url: string) => {
  return new Promise<Mesh>((res, rej) => {
    Engine.instance.gltfLoader.load(url, (gltf) => {
      gltf.scene.traverse((node) => {
        if ('isMesh' in node) {
          res(node as Mesh)
        }
      })
    })
  })
}

const countHashes = (str: string) => {
  let result = 0
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '#') {
      result++
    }
  }
  return result
}

type MorphAttribute = {
  position: BufferAttribute | InterleavedBufferAttribute
  normal?: BufferAttribute | InterleavedBufferAttribute
}

function UniformUVOLReactor() {
  const entity = useEntityContext()
  const volumetric = useComponent(entity, VolumetricComponent)
  const component = useComponent(entity, UniformUVOL)

  // This is accessed frequently, so we memoize it
  const manifest = useMemo(() => component.data.get({ noproxy: true }), [])
  const manifestPath = useMemo(() => component.manifestPath.value, [])
  const geometryTargets = useMemo(() => {
    const keys = Object.keys(manifest.geometry.targets)
    keys.sort((a, b) => manifest.geometry.targets[a].priority - manifest.geometry.targets[b].priority)
    return keys
  }, [])
  const textureTypes = useMemo(() => {
    const _types = [] as TextureType[]
    for (const type in manifest.texture) {
      _types.push(type as TextureType)
    }
    return _types
  }, [])
  const textureTargets = useMemo(() => {
    const targets: Partial<Record<TextureType, string[]>> = {}
    textureTypes.forEach((textureType) => {
      const keys = Object.keys(manifest.texture[textureType]!.targets)
      keys.sort(
        (a, b) =>
          manifest.texture[textureType]!.targets[a].priority - manifest.texture[textureType]!.targets[b].priority
      )
      targets[textureType] = keys
    })
    return targets
  }, [])

  const mediaElement = getMutableComponent(entity, MediaElementComponent).value
  const audioContext = getState(AudioState).audioContext
  const audio = mediaElement.element

  const clock = useMemo(() => new Clock(), [])
  const geometryBuffer = useMemo(() => new Map<string, MorphAttribute>(), [])
  const textureBuffer = useMemo(() => new Map<string, CompressedTexture>(), [])
  const maxBufferHealth = 10 // seconds
  const minBufferToPlay = 2 // seconds

  const material = useMemo(() => {
    const _material = new MeshBasicMaterial({ color: 0xffffff })
    return _material
  }, [])

  const defaultGeometry = useMemo(() => new PlaneGeometry(0.001, 0.001) as BufferGeometry, [])
  const mesh = useRef<Mesh | null>(null)
  if (mesh.current === null) {
    const initialMesh = new Mesh(defaultGeometry, material)
    initialMesh.name = 'default'
    mesh.current = initialMesh
  }

  const pendingRequests = useRef(0)

  /**
   * This says until how long can we play geometry buffers without fetching new data.
   * For eg: If it geometryBufferHealth = 25, it implies, we can play upto 00:25 seconds
   */
  const geometryBufferHealth = useRef(0) // in seconds
  const textureBufferHealth = useRef(0) // in seconds
  const currentTime = useRef(0) // in seconds

  const resolvePath = (
    path: string,
    format: AudioFileFormat | GeometryFormat | TextureFormat,
    textureType?: TextureType,
    target?: string,
    index?: number
  ) => {
    let resolvedPath = path
    resolvedPath = path.replace('[ext]', FORMAT_TO_EXTENSION[format])
    if (textureType) {
      resolvedPath = resolvedPath.replace('[type]', textureType)
    }
    if (target) {
      resolvedPath = resolvedPath.replace('[target]', target)
    }
    if (index) {
      // TODO: Store the padding somewhere
      const padLength = countHashes(resolvedPath)
      const paddedString = '[' + '0'.repeat(padLength) + ']'
      resolvedPath = resolvedPath.replace(paddedString, index.toString().padStart(padLength, '0'))
    }

    if (!resolvedPath.startsWith('http')) {
      // This is a relative path, resolve it w.r.t to manifestPath
      const manifestPathSegments = manifestPath.split('/')
      manifestPathSegments.pop()
      manifestPathSegments.push(resolvedPath)
      resolvedPath = manifestPathSegments.join('/')
    }

    return resolvedPath
  }

  const createKey = (target: string, index: number, textureType?: TextureType) => {
    let key = target + index.toString().padStart(7, '0')
    if (textureType) {
      key += textureType
    }
    return key
  }

  useEffect(() => {
    addObjectToGroup(entity, mesh.current!)
    if (manifest.audio) {
      component.hasAudio.set(true)
      audio.src = resolvePath(manifest.audio.path, manifest.audio.formats[0])
      audio.playbackRate = manifest.audio.playbackRate
    }

    component.geometryTarget.set(geometryTargets[0])
    textureTypes.forEach((textureType) => {
      component.textureTarget[textureType].set(textureTargets[textureType]![0])
    })

    return () => {
      removeObjectFromGroup(entity, mesh.current!)
      // TODO: remove played buffer
      audio.src = ''
    }
  })

  const fetchGeometry = () => {
    const currentBufferLength = geometryBufferHealth.current - currentTime.current
    if (currentBufferLength >= maxBufferHealth) {
      return
    }
    const target = component.geometryTarget.value
    const targetData = manifest.geometry.targets[target] as UniformSolveTarget
    const frameRate = targetData.frameRate
    const segmentCount = targetData.segmentCount

    const startFrame = Math.round(geometryBufferHealth.current * frameRate)
    const framesToFetch = Math.round((maxBufferHealth - currentBufferLength) * frameRate)
    const endFrame = Math.min(startFrame + framesToFetch, segmentCount - 1)

    const startSegment = Math.floor(startFrame / targetData.segmentFrameCount)
    const endSegment = Math.floor(endFrame / targetData.segmentFrameCount)

    for (let i = startSegment; i <= endSegment; i++) {
      const segmentURL = resolvePath(manifest.geometry.path, targetData.format, undefined, target, i)
      pendingRequests.current++
      getMeshFromGLTF(segmentURL).then((segmentMesh) => {
        pendingRequests.current--
        segmentMesh.geometry.morphAttributes.position.forEach((attribute, index) => {
          const key = createKey(target, i * targetData.segmentFrameCount + index)
          geometryBuffer.set(key, { position: attribute })
        })
        if (segmentMesh.geometry.morphAttributes.normal) {
          segmentMesh.geometry.morphAttributes.normal.forEach((attribute, index) => {
            const key = createKey(target, i * targetData.segmentFrameCount + index)
            geometryBuffer.get(key)!.normal = attribute
          })
        }
        segmentMesh.geometry.morphAttributes = {}
        if (mesh.current?.name === 'default') {
          // This is the first segment, replace the default mesh
          mesh.current = segmentMesh
        }
      })
    }
  }

  const bufferLoop = () => {}

  return null
}
