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
  BufferGeometry,
  Clock,
  CompressedTexture,
  Group,
  InterleavedBufferAttribute,
  Mesh,
  MeshStandardMaterial,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  Vector2
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AudioState } from '../../audio/AudioState'
import { Engine } from '../../ecs/classes/Engine'
import { defineComponent, getMutableComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import {
  AudioFileFormat,
  FORMAT_TO_EXTENSION,
  GeometryFormat,
  PlayerManifest,
  TextureFormat,
  UniformSolveTarget
} from '../constants/UVOLTypes'
import getFirstMesh from '../util/getFirstMesh'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MediaElementComponent } from './MediaComponent'
import { VolumetricComponent, handleAutoplay } from './VolumetricComponent'

// WARN: This file is being migrated. In further commits, it'll be removed.

export const UniformUVOLComponent = defineComponent({
  name: 'UniformUVOL',

  onInit: (entity) => {
    return {
      manifestPath: '',
      data: {} as PlayerManifest,
      hasAudio: false,
      geometryTarget: '',
      textureTarget: '',
      initialGeometryBuffersLoaded: false,
      initialTextureBuffersLoaded: false
    }
  },

  reactor: UniformUVOLReactor
})

const countHashes = (str: string) => {
  let result = 0
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '#') {
      result++
    }
  }
  return result
}

export const resolvePath = (
  path: string,
  manifestPath: string,
  format: AudioFileFormat | GeometryFormat | TextureFormat,
  target?: string,
  index?: number
) => {
  let resolvedPath = path
  resolvedPath = path.replace('[ext]', FORMAT_TO_EXTENSION[format])
  resolvedPath = resolvedPath.replace('[type]', 'baseColor')
  if (target !== undefined) {
    resolvedPath = resolvedPath.replace('[target]', target)
  }
  if (index !== undefined) {
    const padLength = countHashes(resolvedPath)
    const paddedString = '[' + '#'.repeat(padLength) + ']'
    const paddedIndex = index.toString().padStart(padLength, '0')
    resolvedPath = resolvedPath.replace(paddedString, paddedIndex)
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

export const createKey = (target: string, index: number) => {
  return target + index.toString().padStart(7, '0')
}

const vertexShader = `
/**
 * 'vMapUv' is used by fragment shader
 * Hence name of this varying should not be changed
 */
${ShaderChunk.common}
${ShaderChunk.logdepthbuf_pars_vertex}
out vec2 vMapUv;

attribute vec4 keyframeA;
attribute vec4 keyframeB;
uniform float mixRatio;

uniform vec2 repeat;
uniform vec2 offset;


void main() {
  vMapUv = uv * repeat + offset; 

  vec4 localPosition = vec4(position, 1.0);

  localPosition.x += mix(keyframeA.x, keyframeB.x, mixRatio); 
  localPosition.y += mix(keyframeA.y, keyframeB.y, mixRatio);
  localPosition.z += mix(keyframeA.z, keyframeB.z, mixRatio);

  gl_Position = projectionMatrix * modelViewMatrix * localPosition;
  ${ShaderChunk.logdepthbuf_vertex}
}`
const fragmentShader = `
${ShaderChunk.logdepthbuf_pars_fragment}
in vec2 vMapUv;

uniform sampler2D map;

void main() {
  vec4 color = texture2D(map, vMapUv);
  gl_FragColor = color;
  ${ShaderChunk.logdepthbuf_fragment}
}`

type MorphAttribute = {
  position: InterleavedBufferAttribute
  normal?: InterleavedBufferAttribute // required only for PBR/lit materials
}

// TODO: Support PBR materials
function UniformUVOLReactor() {
  const entity = useEntityContext()
  const volumetric = useComponent(entity, VolumetricComponent)
  const component = useComponent(entity, UniformUVOLComponent)
  // This is accessed frequently, so we memoize it
  const manifest = useMemo(() => component.data.get({ noproxy: true }), [])
  const manifestPath = useMemo(() => component.manifestPath.value, [])
  const geometryTargets = useMemo(() => {
    const keys = Object.keys(manifest.geometry.targets)
    keys.sort((a, b) => manifest.geometry.targets[a].priority - manifest.geometry.targets[b].priority)
    return keys
  }, [])

  const textureTargets = useMemo(() => {
    const keys = Object.keys(manifest.texture.baseColor.targets)
    keys.sort((a, b) => manifest.geometry.targets[a].priority - manifest.geometry.targets[b].priority)
    return keys
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
    const _material = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        map: {
          value: null
        },
        repeat: {
          value: new Vector2(1, 1)
        },
        offset: {
          value: new Vector2(0, 0)
        },
        mixRatio: {
          value: 0
        }
      }
    })
    return _material
  }, [])

  const defaultGeometry = useMemo(() => new SphereGeometry(3, 32, 32) as BufferGeometry, [])
  const mesh = useMemo(() => {
    const _mesh = new Mesh(defaultGeometry, new ShaderMaterial())
    _mesh.name = 'default'
    return _mesh
  }, [])
  const group = useMemo(() => {
    const _group = new Group()
    _group.add(mesh)
    return _group
  }, [])

  const pendingGeometryRequests = useRef(0)
  const pendingTextureRequests = useRef(0)

  /**
   * This says until how long can we play geometry buffers without fetching new data.
   * For eg: If it geometryBufferHealth = 25, it implies, we can play upto 00:25 seconds
   */
  const geometryBufferHealth = useRef(0) // in seconds
  const textureBufferHealth = useRef(0) // in seconds
  const currentTime = useRef(0) // in seconds

  useEffect(() => {
    if (manifest.audio) {
      component.hasAudio.set(true)
      audio.src = resolvePath(manifest.audio.path, manifestPath, manifest.audio.formats[0])
      audio.playbackRate = manifest.audio.playbackRate
    }

    component.geometryTarget.set(geometryTargets[0])
    component.textureTarget.set(textureTargets[0])
    const intervalId = setInterval(bufferLoop, 3000)
    bufferLoop()

    return () => {
      console.log('VDEBUG Cleaning up')
      removeObjectFromGroup(entity, mesh)
      mesh.geometry.dispose()
      for (const texture of textureBuffer.values()) {
        texture.dispose()
      }
      textureBuffer.clear()

      for (const attribute of geometryBuffer.values()) {
        // @ts-ignore
        attribute.position.data.array = null
      }

      geometryBuffer.clear()

      mesh.material.dispose()
      audio.src = ''
      clearInterval(intervalId)
    }
  }, [])

  const fetchGeometry = () => {
    const currentBufferLength = geometryBufferHealth.current - currentTime.current
    if (currentBufferLength >= maxBufferHealth || pendingGeometryRequests.current > 0) {
      return
    }
    const target = component.geometryTarget.value
    const targetData = manifest.geometry.targets[target] as UniformSolveTarget
    const frameRate = targetData.frameRate
    const frameCount = targetData.frameCount

    const startFrame = Math.round(geometryBufferHealth.current * frameRate)
    if (startFrame >= frameCount) {
      // fetched all frames
      return
    }

    const framesToFetch = Math.round((maxBufferHealth - currentBufferLength) * frameRate)
    const endFrame = Math.min(startFrame + framesToFetch, frameCount - 1)

    const startSegment = Math.floor(startFrame / targetData.segmentFrameCount)
    const endSegment = Math.floor(endFrame / targetData.segmentFrameCount)

    for (let i = startSegment; i <= endSegment; i++) {
      const segmentURL = resolvePath(manifest.geometry.path, manifestPath, targetData.format, target, i)
      pendingGeometryRequests.current++
      AssetLoader.loadAsync(segmentURL).then(({ scene }: GLTF) => {
        const segmentMesh = getFirstMesh(scene)! as Mesh<BufferGeometry, MeshStandardMaterial>
        pendingGeometryRequests.current--
        segmentMesh.geometry.morphAttributes.position.forEach((attribute, index) => {
          attribute.needsUpdate = true
          const key = createKey(target, i * targetData.segmentFrameCount + index)
          attribute.name = key
          // meshopt attributes are always interleaved
          geometryBuffer.set(key, { position: attribute as InterleavedBufferAttribute })
        })

        // in seconds
        const segmentDuration = segmentMesh.geometry.morphAttributes.position.length / frameRate
        geometryBufferHealth.current += segmentDuration

        if (mesh.name === 'default') {
          // @ts-ignore
          mesh.copy(segmentMesh)
          // @ts-ignore
          material.uniforms.offset.value = (mesh.material as MeshStandardMaterial).map?.offset
          // @ts-ignore
          material.uniforms.repeat.value = (mesh.material as MeshStandardMaterial).map?.repeat
          mesh.material = material
          mesh.name = ''
          addObjectToGroup(entity, group)
          mesh.geometry.morphAttributes = {}
        }

        if (geometryBufferHealth.current >= minBufferToPlay && !component.initialGeometryBuffersLoaded.value) {
          component.initialGeometryBuffersLoaded.set(true)
        }
      })
    }
  }

  const fetchTextures = () => {
    const currentBufferLength = textureBufferHealth.current - currentTime.current
    if (currentBufferLength >= maxBufferHealth || pendingTextureRequests.current > 0) {
      return
    }
    const target = component.textureTarget.value
    const targetData = manifest.texture.baseColor.targets[target]
    const frameRate = targetData.frameRate
    const startFrame = Math.round(textureBufferHealth.current * frameRate)
    if (startFrame >= targetData.frameCount) {
      // fetched all frames
      return
    }

    const framesToFetch = Math.round((maxBufferHealth - currentBufferLength) * frameRate)
    const endFrame = Math.min(startFrame + framesToFetch, targetData.frameCount - 1)

    for (let i = startFrame; i <= endFrame; i++) {
      const textureURL = resolvePath(manifest.texture.baseColor.path, manifestPath, targetData.format, target, i)
      pendingTextureRequests.current++
      if (!Engine.instance.gltfLoader.ktx2Loader) {
        throw new Error('KTX2Loader not initialized')
      }
      Engine.instance.gltfLoader.ktx2Loader.load(textureURL, (texture) => {
        const key = createKey(target, i)
        texture.name = key
        pendingTextureRequests.current--
        texture.needsUpdate = true
        textureBuffer.set(key, texture)
        textureBufferHealth.current += 1 / frameRate
        if (textureBufferHealth.current >= minBufferToPlay && !component.initialTextureBuffersLoaded.value) {
          component.initialTextureBuffersLoaded.set(true)
        }
      })
    }
  }

  useEffect(() => {
    if (component.initialGeometryBuffersLoaded.value && component.initialTextureBuffersLoaded.value) {
      volumetric.initialBuffersLoaded.set(true)
    }
  }, [component.initialGeometryBuffersLoaded, component.initialTextureBuffersLoaded])

  const bufferLoop = () => {
    fetchGeometry()
    fetchTextures()
    const canPlay = geometryBufferHealth.current >= minBufferToPlay && textureBufferHealth.current >= minBufferToPlay
    if (canPlay && !volumetric.initialBuffersLoaded.value) {
      volumetric.initialBuffersLoaded.set(true)
    }
  }

  /**
   * Tries to set keyframe for the given target and frame number.
   * If keyframe is not available, it tries to find equivalent keyframe of another target.
   * If keyframe of another target is not available, false is returned.
   */
  const setAttribute = (attributeName: 'keyframeA' | 'keyframeB', target: string, index: number) => {
    const key = createKey(target, index)
    if (!geometryBuffer.has(key)) {
      // TODO: Not tested
      const targetFrameRate = manifest.geometry.targets[target].frameRate
      const targetSRatio = (manifest.geometry.targets[target] as UniformSolveTarget).settings.simplificationRatio
      const targets = Object.keys(manifest.geometry.targets)
      for (let i = 0; i < targets.length; i++) {
        const altTarget = targets[i]
        const altTargetFrameRate = manifest.geometry.targets[altTarget].frameRate
        const altIndex = Math.round((index * altTargetFrameRate) / targetFrameRate)
        const altSimplificationRatio = (manifest.geometry.targets[altTarget] as UniformSolveTarget).settings
          .simplificationRatio
        if (altSimplificationRatio !== targetSRatio) {
          // Can't blend between two targets with different simplification ratios
          // Because they will have different number of vertices
          continue
        }

        const altKey = createKey(altTarget, altIndex)
        if (geometryBuffer.has(altKey)) {
          const attribute = geometryBuffer.get(altKey)!.position
          if (mesh.geometry.attributes[attributeName] !== attribute) {
            if (mesh.geometry.attributes[attributeName]) {
              const previousAttribute = mesh.geometry.attributes[attributeName]
              geometryBuffer.delete(previousAttribute.name)
            }
            if (mesh.geometry.attributes[attributeName]) {
              ;(mesh.geometry.attributes[attributeName] as InterleavedBufferAttribute).data.array = attribute.data.array
              console.log("VDEBUG updated existing attribute's array")
            } else {
              mesh.geometry.setAttribute(attributeName, attribute)
              console.log('VDEBUG created new attribute')
            }
            mesh.geometry.attributes[attributeName].needsUpdate = true
            return true
          }
        }
      }
    } else {
      const attribute = geometryBuffer.get(key)!.position
      if (mesh.geometry.attributes[attributeName] !== attribute) {
        if (mesh.geometry.attributes[attributeName]) {
          const previousAttribute = mesh.geometry.attributes[attributeName]
          geometryBuffer.delete(previousAttribute.name)
        }
        if (mesh.geometry.attributes[attributeName]) {
          ;(mesh.geometry.attributes[attributeName] as InterleavedBufferAttribute).data.array = attribute.data.array
          console.log("VDEBUG updated existing attribute's array")
        } else {
          mesh.geometry.setAttribute(attributeName, attribute)
          console.log('VDEBUG created new attribute')
        }
        // mesh.geometry.setAttribute(attributeName, attribute)
        mesh.geometry.attributes[attributeName].needsUpdate = true
        return true
      }
    }
    return false
  }

  const setTexture = (target: string, index: number) => {
    const key = createKey(target, index)
    if (!textureBuffer.has(key)) {
      // TODO: Not tested
      const targetFrameRate = manifest.texture.baseColor.targets[target].frameRate
      const targets = Object.keys(manifest.texture.baseColor.targets)
      for (let i = 0; i < targets.length; i++) {
        const altTarget = targets[i]
        const altTargetFrameRate = manifest.texture.baseColor.targets[altTarget].frameRate
        const altIndex = Math.round((index * altTargetFrameRate) / targetFrameRate)
        const altKey = createKey(altTarget, altIndex)
        if (textureBuffer.has(altKey)) {
          const texture = textureBuffer.get(altKey)!
          if (mesh.material.uniforms.map.value !== texture) {
            if (mesh.material.uniforms.map.value) {
              const previousTexture: CompressedTexture = mesh.material.uniforms.map.value
              previousTexture.dispose()
              textureBuffer.delete(previousTexture.name)
            }
            mesh.material.uniforms.map.value = texture
            return true
          }
        }
      }
    } else {
      const texture = textureBuffer.get(key)!
      if (mesh.material.uniforms.map.value !== texture) {
        if (mesh.material.uniforms.map.value) {
          const previousTexture: CompressedTexture = mesh.material.uniforms.map.value
          previousTexture.dispose()
          textureBuffer.delete(previousTexture.name)
        }
        mesh.material.uniforms.map.value = texture
        return true
      }
    }
    return false
  }

  useEffect(() => {
    if (volumetric.paused.value || !volumetric.initialBuffersLoaded.value) {
      if (component.hasAudio.value) {
        audio.pause()
      }
      return
    }

    if (component.hasAudio.value) {
      audio.play().catch((e) => {
        if (e.name === 'NotAllowedError') {
          handleAutoplay(audioContext, audio)
        } else {
          console.error(e)
        }
      })
    }
  }, [volumetric.paused, volumetric.initialBuffersLoaded])

  // TODO: Handle when frames are not available
  const update = () => {
    // bufferLoop()
    if (volumetric.paused.value || !volumetric.initialBuffersLoaded.value) {
      return
    }

    if (component.hasAudio.value) {
      currentTime.current = audio.currentTime
    } else {
      currentTime.current = clock.getElapsedTime()
    }

    const geometryTarget = component.geometryTarget.value
    const geometryFrameIndex = currentTime.current * manifest.geometry.targets[geometryTarget].frameRate

    const textureTarget = component.textureTarget.value
    const textureFrameIndex = Math.round(
      currentTime.current * manifest.texture.baseColor.targets[textureTarget].frameRate
    )

    if (
      audio.ended ||
      Math.ceil(geometryFrameIndex) >= manifest.geometry.targets[geometryTarget].frameCount ||
      textureFrameIndex >= manifest.texture.baseColor.targets[textureTarget].frameCount
    ) {
      if (audio.ended) {
        console.log(`VDEBUG Audio ended. Ending track`)
      } else if (Math.ceil(geometryFrameIndex) >= manifest.geometry.targets[geometryTarget].frameCount) {
        console.log(
          `VDEBUG GeometryFrameIndex (${Math.ceil(geometryFrameIndex)}) >= frameCount (${
            manifest.geometry.targets[geometryTarget].frameCount
          }). Ending track.`
        )
      } else {
        console.log(
          `VDEBUG TextureFrameIndex (${textureFrameIndex}) >= frameCount (${manifest.texture.baseColor.targets[textureTarget].frameCount}). Ending track.`
        )
      }
      volumetric.ended.set(true)
      return
    }

    // TODO: Avoid uploading same attribute twice
    const keyframeAIndex = Math.floor(geometryFrameIndex)
    const keyframeBIndex = Math.ceil(geometryFrameIndex)
    const mixRatio = geometryFrameIndex - keyframeAIndex
    const isASet = setAttribute('keyframeA', geometryTarget, keyframeAIndex)
    const isBSet = setAttribute('keyframeB', geometryTarget, keyframeBIndex)
    if (!isASet && !isBSet) {
      // We can't really do anything if both keyframes of all target's are not available
    } else if (!isASet && isBSet) {
      material.uniforms.mixRatio.value = 1
    } else if (isASet && !isBSet) {
      material.uniforms.mixRatio.value = 0
    } else {
      material.uniforms.mixRatio.value = mixRatio
    }

    const previousKeyframe = keyframeAIndex - 1
    if (previousKeyframe >= 0) {
      geometryBuffer.delete(createKey(geometryTarget, previousKeyframe))
    }

    if (!setTexture(textureTarget, textureFrameIndex)) {
      // Can't do anything, but keep the existing texture
    }
  }

  useExecute(update, {
    with: AnimationSystemGroup
  })

  return null
}
