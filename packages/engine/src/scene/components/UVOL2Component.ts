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
  CompressedTexture,
  Group,
  InterleavedBufferAttribute,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  SphereGeometry,
  Vector2
} from 'three'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import { AudioState } from '../../audio/AudioState'
import { EngineState } from '../../ecs/classes/EngineState'
import {
  defineComponent,
  getMutableComponent,
  removeComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { AnimationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import {
  AudioFileFormat,
  DRACOTarget,
  FORMAT_TO_EXTENSION,
  GLBTarget,
  GeometryFormat,
  PlayerManifest,
  TextureFormat,
  UVOL_TYPE,
  UniformSolveTarget
} from '../constants/UVOLTypes'
import getFirstMesh from '../util/getFirstMesh'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MediaElementComponent } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'
import { UVOLDissolveComponent } from './UVOLDissolveComponent'
import { VolumetricComponent, handleAutoplay } from './VolumetricComponent'

export const calculatePriority = (manifest: PlayerManifest) => {
  const geometryTargets = Object.keys(manifest.geometry.targets)
  geometryTargets.sort((a, b) => {
    const aData = manifest.geometry.targets[a]
    const bData = manifest.geometry.targets[b]

    // @ts-ignore
    const aSimplificationRatio = aData.settings.simplificationRatio ?? 1

    // @ts-ignore
    const bSimplificationRatio = bData.settings.simplificationRatio ?? 1

    const aMetric = aData.frameRate * aSimplificationRatio
    const bMetric = bData.frameRate * bSimplificationRatio
    return aMetric - bMetric
  })
  geometryTargets.forEach((target, index) => {
    manifest.geometry.targets[target].priority = index
  })

  const textureTargets = Object.keys(manifest.texture.baseColor.targets)
  textureTargets.sort((a, b) => {
    const aData = manifest.texture.baseColor.targets[a]
    const bData = manifest.texture.baseColor.targets[b]
    const aPixelPerSec = aData.frameRate * aData.settings.resolution.width * aData.settings.resolution.height
    const bPixelPerSec = bData.frameRate * bData.settings.resolution.width * bData.settings.resolution.height
    return aPixelPerSec - bPixelPerSec
  })
  textureTargets.forEach((target, index) => {
    manifest.texture.baseColor.targets[target].priority = index
  })
  return manifest
}

export const UVOL2Component = defineComponent({
  name: 'UVOL2Component',

  onInit: (entity) => {
    return {
      manifestPath: '',
      data: {} as PlayerManifest,
      hasAudio: false,
      geometryTarget: '',
      textureTarget: '',
      initialGeometryBuffersLoaded: false,
      initialTextureBuffersLoaded: false,
      firstGeometryFrameLoaded: false,
      firstTextureFrameLoaded: false,
      loadingEffectStarted: false,
      loadingEffectEnded: false
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.manifestPath) {
      component.manifestPath.set(json.manifestPath)
    }
    if (json.data) {
      component.data.set(json.data)
    }
  },

  reactor: UVOL2Reactor
})

const loadGeometryAsync = (url: string, targetData: DRACOTarget | GLBTarget | UniformSolveTarget) => {
  return new Promise<BufferGeometry | Mesh>((resolve, reject) => {
    const format = targetData.format
    if (format === 'draco') {
      getState(AssetLoaderState).gltfLoader.dracoLoader?.load(url, (geometry: BufferGeometry) => {
        resolve(geometry)
      })
    } else if (format === 'glb' || format === 'uniform-solve') {
      getState(AssetLoaderState).gltfLoader.load(url, ({ scene }: GLTF) => {
        const mesh = getFirstMesh(scene)!
        resolve(mesh)
      })
    } else {
      reject('Invalid format')
    }
  })
}

const loadTextureAsync = (url: string) => {
  return new Promise<CompressedTexture>((resolve, reject) => {
    getState(AssetLoaderState).gltfLoader.ktx2Loader!.load(url, (texture) => {
      resolve(texture)
    })
  })
}

const uniformSolveVertexShader = `
#include <common>
#include <logdepthbuf_pars_vertex>
out vec2 vMapUv;

attribute vec4 keyframeA;
attribute vec4 keyframeB;
uniform float mixRatio;

uniform vec2 repeat;
uniform vec2 offset;

// HEADER_REPLACE_START
// HEADER_REPLACE_END


void main() {
  // MAIN_REPLACE_START
  // MAIN_REPLACE_END

   vMapUv = uv * repeat + offset;

   vec4 localPosition = vec4(position, 1.0);

   localPosition.x += mix(keyframeA.x, keyframeB.x, mixRatio); 
   localPosition.y += mix(keyframeA.y, keyframeB.y, mixRatio);
   localPosition.z += mix(keyframeA.z, keyframeB.z, mixRatio);

   gl_Position = projectionMatrix * modelViewMatrix * localPosition;
   #include <logdepthbuf_vertex>
}`

const uniformSolveFragmentShader = `
#include <common>
#include <logdepthbuf_pars_fragment>

in vec2 vMapUv;
uniform sampler2D map;

// HEADER_REPLACE_START
// HEADER_REPLACE_END

void main() {
  vec4 color = texture2D(map, vMapUv);
  gl_FragColor = color;

  // MAIN_REPLACE_START
  // MAIN_REPLACE_END

  #include <logdepthbuf_fragment>
}`

const countHashes = (str: string) => {
  let result = 0
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '#') {
      result++
    }
  }
  return result
}

const resolvePath = (
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

const createKey = (target: string, index: number) => {
  return target + index.toString().padStart(7, '0')
}

function UVOL2Reactor() {
  const entity = useEntityContext()
  const volumetric = useComponent(entity, VolumetricComponent)
  const component = useComponent(entity, UVOL2Component)

  // These are accessed very frequently, Better not to fetch from state everytime
  const manifest = useRef(component.data.value)
  const manifestPath = useMemo(() => component.manifestPath.value, [])
  const geometryTargets = useRef(Object.keys(manifest.current.geometry.targets))
  const textureTargets = useRef(Object.keys(manifest.current.texture.baseColor.targets))

  const mediaElement = getMutableComponent(entity, MediaElementComponent).value
  const audioContext = getState(AudioState).audioContext
  const audio = mediaElement.element

  const geometryBuffer = useMemo(() => new Map<string, Mesh | BufferGeometry | InterleavedBufferAttribute>(), [])
  const textureBuffer = useMemo(() => new Map<string, CompressedTexture>(), [])
  const maxBufferHealth = 10 // seconds
  const minBufferToPlay = 2 // seconds
  const bufferThreshold = 5 // seconds. If buffer health is less than this, fetch new data
  const repeat = useMemo(() => new Vector2(1, 1), [])
  const offset = useMemo(() => new Vector2(0, 0), [])

  const material = useMemo(() => {
    if (manifest.current.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      return new ShaderMaterial({
        vertexShader: uniformSolveVertexShader,
        fragmentShader: uniformSolveFragmentShader,
        uniforms: {
          repeat: {
            value: new Vector2(1, 1)
          },
          offset: {
            value: new Vector2(0, 0)
          },
          mixRatio: {
            value: 0
          },
          map: {
            value: null
          }
        }
      })
    }
    return new MeshBasicMaterial({ color: 0xffffff })
  }, [])

  const defaultGeometry = useMemo(() => new SphereGeometry(3, 32, 32) as BufferGeometry, [])
  const mesh = useMemo(() => new Mesh(defaultGeometry, material), [])
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
    if (volumetric.useLoadingEffect.value) {
      setComponent(entity, UVOLDissolveComponent)
    }

    manifest.current = calculatePriority(component.data.get({ noproxy: true }))
    component.data.set(manifest.current)
    const shadow = getMutableComponent(entity, ShadowComponent)
    if (manifest.current.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      // TODO: Cast shadows properly with uniform solve
      shadow.cast.set(false)
      shadow.receive.set(false)
    } else {
      shadow.cast.set(true)
      shadow.receive.set(true)
    }

    geometryTargets.current = Object.keys(manifest.current.geometry.targets)
    geometryTargets.current.sort((a, b) => {
      return manifest.current.geometry.targets[a].priority - manifest.current.geometry.targets[b].priority
    })

    textureTargets.current = Object.keys(manifest.current.texture.baseColor.targets)
    textureTargets.current.sort((a, b) => {
      return (
        manifest.current.texture.baseColor.targets[a].priority - manifest.current.texture.baseColor.targets[b].priority
      )
    })

    if (manifest.current.audio) {
      component.hasAudio.set(true)
      audio.src = resolvePath(manifest.current.audio.path, manifestPath, manifest.current.audio.formats[0])
      audio.playbackRate = manifest.current.audio.playbackRate
    }
    component.geometryTarget.set(geometryTargets.current[0])
    component.textureTarget.set(textureTargets.current[0])
    const intervalId = setInterval(bufferLoop, 3000)
    bufferLoop() // calling now because setInterval will call after 3 seconds

    return () => {
      removeObjectFromGroup(entity, group)
      clearInterval(intervalId)
      mesh.geometry.dispose()
      for (const texture of textureBuffer.values()) {
        texture.dispose()
      }
      textureBuffer.clear()

      for (const value of geometryBuffer.values()) {
        if (value instanceof Mesh) {
          value.geometry.dispose()
        } else if (value instanceof BufferGeometry) {
          value.dispose()
        }
      }

      geometryBuffer.clear()
      mesh.material.dispose()
      audio.src = ''
    }
  }, [])

  const fetchNonUniformSolveGeometry = (startFrame: number, endFrame: number, target: string) => {
    const targetData = manifest.current.geometry.targets[target]
    const promises: Promise<Mesh | BufferGeometry>[] = []

    const oldBufferHealth = geometryBufferHealth.current
    const startTime = Date.now()

    for (let i = startFrame; i <= endFrame; i++) {
      const frameURL = resolvePath(manifest.current.geometry.path, manifestPath, targetData.format, target, i)
      pendingGeometryRequests.current++
      promises.push(loadGeometryAsync(frameURL, targetData))
    }

    Promise.allSettled(promises).then((values) => {
      values.forEach((result, j) => {
        const model = result.status === 'fulfilled' ? (result.value as Mesh) : null
        if (!model) {
          return
        }
        const i = j + startFrame
        const key = createKey(target, i)
        model.name = key
        geometryBuffer.set(createKey(target, i), model)
        geometryBufferHealth.current += 1 / targetData.frameRate
        pendingGeometryRequests.current--
        if (i === 0) {
          component.firstGeometryFrameLoaded.set(true)
        }
      })

      const playTime = geometryBufferHealth.current - oldBufferHealth
      const fetchTime = (Date.now() - startTime) / 1000
      const metric = fetchTime / playTime
      adjustGeometryTarget(metric)
    })
  }

  const fetchUniformSolveGeometry = (startSegment: number, endSegment: number, target: string) => {
    const targetData = manifest.current.geometry.targets[target] as UniformSolveTarget
    const promises: Promise<Mesh | BufferGeometry>[] = []

    const oldBufferHealth = geometryBufferHealth.current
    const startTime = Date.now()

    for (let i = startSegment; i <= endSegment; i++) {
      const segmentURL = resolvePath(manifest.current.geometry.path, manifestPath, targetData.format, target, i)
      pendingGeometryRequests.current++
      promises.push(loadGeometryAsync(segmentURL, targetData))
    }

    Promise.allSettled(promises).then((values) => {
      values.forEach((result, j) => {
        const model = result.status === 'fulfilled' ? (result.value as Mesh) : null
        if (!model) {
          return
        }
        const i = j + startSegment
        const positionMorphAttributes = model.geometry.morphAttributes.position as InterleavedBufferAttribute[]
        const segmentDuration = positionMorphAttributes.length / targetData.frameRate
        const segmentOffset = i * targetData.segmentFrameCount

        positionMorphAttributes.forEach((attr, index) => {
          const key = createKey(target, segmentOffset + index)
          attr.name = key
          geometryBuffer.set(key, attr)
        })

        model.geometry.morphAttributes = {}
        if (i === 0) {
          // @ts-ignore
          mesh.copy(model)
          repeat.copy((model.material as MeshStandardMaterial).map?.repeat ?? repeat)
          offset.copy((model.material as MeshStandardMaterial).map?.offset ?? offset)
          mesh.material = material
          component.firstGeometryFrameLoaded.set(true)
        }

        geometryBufferHealth.current += segmentDuration
        pendingGeometryRequests.current--
      })

      const playTime = geometryBufferHealth.current - oldBufferHealth
      const fetchTime = (Date.now() - startTime) / 1000
      const metric = fetchTime / playTime
      adjustGeometryTarget(metric)
    })
  }

  const adjustGeometryTarget = (metric: number) => {
    if (metric > 0.3) {
      const currentTargetIndex = geometryTargets.current.indexOf(component.geometryTarget.value)
      if (currentTargetIndex > 0) {
        component.geometryTarget.set(geometryTargets.current[currentTargetIndex - 1])
      }
    } else if (0.1 <= metric && metric <= 0.3) {
      return
    } else {
      const currentTargetIndex = geometryTargets.current.indexOf(component.geometryTarget.value)
      if (currentTargetIndex < geometryTargets.current.length - 1) {
        component.geometryTarget.set(geometryTargets.current[currentTargetIndex + 1])
      }
    }
  }

  const adjustTextureTarget = (metric: number) => {
    if (metric > 0.3) {
      const currentTargetIndex = textureTargets.current.indexOf(component.textureTarget.value)
      if (currentTargetIndex > 0) {
        component.textureTarget.set(textureTargets.current[currentTargetIndex - 1])
      }
    } else if (0.1 <= metric && metric <= 0.3) {
      return
    } else {
      const currentTargetIndex = textureTargets.current.indexOf(component.textureTarget.value)
      if (currentTargetIndex < textureTargets.current.length - 1) {
        component.textureTarget.set(textureTargets.current[currentTargetIndex + 1])
      }
    }
  }

  const fetchGeometry = () => {
    const currentBufferLength = geometryBufferHealth.current - currentTime.current
    if (currentBufferLength >= Math.min(bufferThreshold, maxBufferHealth) || pendingGeometryRequests.current > 0) {
      return
    }
    const target = component.geometryTarget.value

    const targetData = manifest.current.geometry.targets[target]
    const frameRate = targetData.frameRate
    const frameCount = targetData.frameCount

    const startFrame = Math.round(geometryBufferHealth.current * frameRate)
    if (startFrame >= frameCount) {
      // fetched all frames
      return
    }

    const framesToFetch = Math.round((maxBufferHealth - currentBufferLength) * frameRate)
    const endFrame = Math.min(startFrame + framesToFetch, frameCount - 1)

    if (targetData.format === 'uniform-solve') {
      const segmentFrameCount = targetData.segmentFrameCount
      const startSegment = Math.floor(startFrame / segmentFrameCount)
      const endSegment = Math.floor(endFrame / segmentFrameCount)
      fetchUniformSolveGeometry(startSegment, endSegment, target)
    } else {
      fetchNonUniformSolveGeometry(startFrame, endFrame, target)
    }

    if (geometryBufferHealth.current >= minBufferToPlay && !component.initialGeometryBuffersLoaded.value) {
      component.initialGeometryBuffersLoaded.set(true)
    }
  }

  const fetchTextures = () => {
    const currentBufferLength = textureBufferHealth.current - currentTime.current
    if (currentBufferLength >= Math.min(bufferThreshold, maxBufferHealth) || pendingTextureRequests.current > 0) {
      return
    }
    const target = component.textureTarget.value
    const targetData = manifest.current.texture.baseColor.targets[target]
    const frameRate = targetData.frameRate
    const startFrame = Math.round(textureBufferHealth.current * frameRate)
    if (startFrame >= targetData.frameCount) {
      // fetched all frames
      return
    }

    const framesToFetch = Math.round((maxBufferHealth - currentBufferLength) * frameRate)
    const endFrame = Math.min(startFrame + framesToFetch, targetData.frameCount - 1)

    if (!getState(AssetLoaderState).gltfLoader.ktx2Loader) {
      throw new Error('KTX2Loader not initialized')
    }

    const oldBufferHealth = geometryBufferHealth.current
    const startTime = Date.now()
    const promises: Promise<CompressedTexture>[] = []

    for (let i = startFrame; i <= endFrame; i++) {
      const textureURL = resolvePath(
        manifest.current.texture.baseColor.path,
        manifestPath,
        targetData.format,
        target,
        i
      )
      pendingTextureRequests.current++
      promises.push(loadTextureAsync(textureURL))
    }

    Promise.allSettled(promises).then((values) => {
      values.forEach((result, j) => {
        const texture = result.status === 'fulfilled' ? (result.value as CompressedTexture) : null
        if (!texture) {
          return
        }
        const i = j + startFrame
        const key = createKey(target, i)
        texture.name = key
        pendingTextureRequests.current--
        texture.needsUpdate = true
        textureBuffer.set(key, texture)
        textureBufferHealth.current += 1 / frameRate
        if (textureBufferHealth.current >= minBufferToPlay && !component.initialTextureBuffersLoaded.value) {
          component.initialTextureBuffersLoaded.set(true)
        }
        if (i === 0) {
          component.firstTextureFrameLoaded.set(true)
        }
      })

      const playTime = textureBufferHealth.current - oldBufferHealth
      const fetchTime = (Date.now() - startTime) / 1000
      const metric = fetchTime / playTime
      adjustTextureTarget(metric)
    })
  }

  const bufferLoop = () => {
    fetchGeometry()
    fetchTextures()
    const canPlay = geometryBufferHealth.current >= minBufferToPlay && textureBufferHealth.current >= minBufferToPlay
    if (canPlay && !volumetric.initialBuffersLoaded.value) {
      volumetric.initialBuffersLoaded.set(true)
    }
  }

  useEffect(() => {
    if (!component.firstGeometryFrameLoaded.value || !component.firstTextureFrameLoaded.value) {
      return
    }
    setGeometry(component.geometryTarget.value, 0)
    setTexture(component.textureTarget.value, 0)

    if (volumetric.useLoadingEffect.value) {
      let headerTemplate: RegExp | undefined = /\/\/\sHEADER_REPLACE_START([\s\S]*?)\/\/\sHEADER_REPLACE_END/
      let mainTemplate: RegExp | undefined = /\/\/\sMAIN_REPLACE_START([\s\S]*?)\/\/\sMAIN_REPLACE_END/

      if (manifest.current.type !== UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
        headerTemplate = undefined
        mainTemplate = undefined
      }

      mesh.material = UVOLDissolveComponent.createDissolveMaterial(
        mesh,
        headerTemplate,
        mainTemplate,
        headerTemplate,
        mainTemplate
      )
      mesh.material.needsUpdate = true
      component.loadingEffectStarted.set(true)
    }

    addObjectToGroup(entity, group)
  }, [component.firstGeometryFrameLoaded, component.firstTextureFrameLoaded])

  useEffect(() => {
    if (component.loadingEffectStarted.value && !component.loadingEffectEnded.value) {
      // Loading effect in progress. Let it finish
      return
    }
    // If autoplay is enabled, play the audio irrespective of paused state
    if (volumetric.autoplay.value && volumetric.initialBuffersLoaded.value) {
      // Reset the loading effect's material
      mesh.material = material
      mesh.material.needsUpdate = true

      if (component.hasAudio.value) {
        handleAutoplay(audioContext, audio, volumetric)
      } else {
        volumetric.paused.set(false)
      }
    }
  }, [volumetric.autoplay, volumetric.initialBuffersLoaded, component.loadingEffectEnded])

  useEffect(() => {
    if (volumetric.paused.value || !volumetric.initialBuffersLoaded.value) {
      if (component.hasAudio.value) {
        audio.pause()
      }
    }
    if (mesh.material !== material) {
      mesh.material = material
      mesh.material.needsUpdate = true
    }
    if (component.hasAudio.value) {
      handleAutoplay(audioContext, audio, volumetric)
    }
  }, [volumetric.paused])

  const getAttribute = (name: string, target: string, index: number) => {
    const key = createKey(target, index)
    if (!geometryBuffer.has(key)) {
      const frameRate = manifest.current.geometry.targets[target].frameRate
      const targets = Object.keys(manifest.current.geometry.targets)

      for (let i = 0; i < targets.length; i++) {
        const _target = targets[i]
        const _targetData = manifest.current.geometry.targets[_target]
        const _frameRate = _targetData.frameRate
        const _index = Math.round((index * _frameRate) / frameRate)
        if (geometryBuffer.has(createKey(_target, _index))) {
          const attribute = geometryBuffer.get(createKey(_target, _index))! as InterleavedBufferAttribute
          return attribute
        }
      }
    } else {
      const attribute = geometryBuffer.get(key)! as InterleavedBufferAttribute
      return attribute
    }

    return false
  }

  /**
   * Sets the attribute on the mesh's geometry
   * And disposes the old attribute. Since that's not supported by three.js natively,
   * we transfer the old attibute to a new geometry and dispose it.
   */
  const setAttribute = (name: string, attribute: InterleavedBufferAttribute) => {
    if (mesh.geometry.attributes[name] === attribute) return

    const index = mesh.geometry.index
    const geometry = new BufferGeometry()
    geometry.setIndex(index)

    for (const key in mesh.geometry.attributes) {
      if (key !== name) {
        geometry.setAttribute(key, mesh.geometry.attributes[key])
      }
    }
    geometry.setAttribute(name, attribute)
    geometry.boundingSphere = mesh.geometry.boundingSphere
    geometry.boundingBox = mesh.geometry.boundingBox
    const oldGeometry = mesh.geometry
    mesh.geometry = geometry

    oldGeometry.index = null
    for (const key in oldGeometry.attributes) {
      if (key !== name) {
        oldGeometry.deleteAttribute(key)
      }
    }
    oldGeometry.dispose()

    const oldAttributeKey = oldGeometry.attributes[name]?.name
    geometryBuffer.delete(oldAttributeKey)
  }

  const setGeometry = (target: string, index: number) => {
    const key = createKey(target, index)
    const targetData = manifest.current.geometry.targets[target]

    if (!geometryBuffer.has(key)) {
      const frameRate = targetData.frameRate
      const targets = Object.keys(manifest.current.geometry.targets)
      targets.forEach((_target) => {
        const _frameRate = manifest.current.geometry.targets[_target].frameRate
        const _index = Math.round((index * _frameRate) / frameRate)
        if (geometryBuffer.has(createKey(_target, _index))) {
          setGeometry(_target, _index)
        }
      })
    } else {
      if (targetData.format === 'draco') {
        const geometry = geometryBuffer.get(key)! as BufferGeometry
        if (mesh.geometry !== geometry) {
          const oldGeometry = mesh.geometry
          mesh.geometry = geometry
          mesh.geometry.attributes.position.needsUpdate = true
          oldGeometry.dispose()
          const oldGeometryKey = oldGeometry.name
          geometryBuffer.delete(oldGeometryKey)
          return
        }
      } else if (targetData.format === 'glb') {
        const model = geometryBuffer.get(key)! as Mesh
        const geometry = model.geometry
        if (mesh.geometry !== geometry) {
          const oldGeometry = mesh.geometry
          mesh.geometry = geometry
          mesh.geometry.attributes.position.needsUpdate = true
          oldGeometry.dispose()
        }
        if (model.material instanceof MeshStandardMaterial && model.material.map) {
          if (model.material.map.repeat) {
            repeat.copy(model.material.map.repeat)
          }
          if (model.material.map.offset) {
            offset.copy(model.material.map.offset)
          }
        }
        const oldModelKey = model.name
        geometryBuffer.delete(oldModelKey)
        return
      }
    }
  }

  const setTexture = (target: string, index: number) => {
    const key = createKey(target, index)
    if (!textureBuffer.has(key)) {
      const targets = Object.keys(manifest.current.texture.baseColor.targets)
      const frameRate = manifest.current.texture.baseColor.targets[target].frameRate
      targets.forEach((_target) => {
        const _frameRate = manifest.current.texture.baseColor.targets[_target].frameRate
        const _index = Math.round((index * _frameRate) / frameRate)
        if (textureBuffer.has(createKey(_target, _index))) {
          setTexture(_target, _index)
        }
      })
    } else {
      const texture = textureBuffer.get(key)!
      if (mesh.material instanceof ShaderMaterial) {
        const oldTextureKey = mesh.material.uniforms.map.value?.name ?? ''
        if (mesh.material.uniforms.map.value !== texture) {
          mesh.material.uniforms.map.value = texture
          mesh.material.uniforms.map.value.needsUpdate = true
          texture.repeat.copy(repeat)
          texture.offset.copy(offset)
          mesh.material.uniforms.repeat.value = repeat
          mesh.material.uniforms.offset.value = offset
          textureBuffer.delete(oldTextureKey)
        }
      } else {
        const oldTextureKey = mesh.material.map?.name ?? ''
        if (mesh.material.map !== texture) {
          texture.repeat.copy(repeat)
          texture.offset.copy(offset)
          mesh.material.map = texture
          mesh.material.map.needsUpdate = true
          textureBuffer.delete(oldTextureKey)
        }
      }
    }
  }

  const updateUniformSolve = (currentTime: number) => {
    const geometryTarget = component.geometryTarget.value
    const geometryFrame = currentTime * manifest.current.geometry.targets[geometryTarget].frameRate
    const keyframeAIndex = Math.floor(geometryFrame)
    const keyframeBIndex = Math.ceil(geometryFrame)
    const mixRatio = geometryFrame - keyframeAIndex

    const keyframeA = getAttribute('position', geometryTarget, keyframeAIndex)
    const keyframeB = getAttribute('position', geometryTarget, keyframeBIndex)

    if (!keyframeA && !keyframeB) {
      return
    } else if (!keyframeA && keyframeB) {
      setAttribute('keyframeB', keyframeB)
      ;(mesh.material as ShaderMaterial).uniforms.mixRatio.value = 1
      return
    } else if (keyframeA && !keyframeB) {
      setAttribute('keyframeA', keyframeA)
      ;(mesh.material as ShaderMaterial).uniforms.mixRatio.value = 0
      return
    } else if (keyframeA && keyframeB) {
      setAttribute('keyframeA', keyframeA)
      setAttribute('keyframeB', keyframeB)
      ;(mesh.material as ShaderMaterial).uniforms.mixRatio.value = mixRatio
    }
  }

  const updateNonUniformSolve = (currentTime: number) => {
    const geometryTarget = component.geometryTarget.value
    const geometryFrame = Math.round(currentTime * manifest.current.geometry.targets[geometryTarget].frameRate)
    setGeometry(geometryTarget, geometryFrame)
  }

  const update = () => {
    const delta = getState(EngineState).deltaSeconds

    if (
      component.loadingEffectStarted.value &&
      !component.loadingEffectEnded.value &&
      // @ts-ignore
      UVOLDissolveComponent.updateDissolveEffect(entity, mesh, delta)
    ) {
      removeComponent(entity, UVOLDissolveComponent)
      component.loadingEffectEnded.set(true)
      mesh.material = material
      mesh.material.needsUpdate = true
      return
    }

    if (volumetric.paused.value || !volumetric.initialBuffersLoaded.value) {
      return
    }
    if (manifest.current.audio) {
      currentTime.current = audio.currentTime
    } else {
      currentTime.current += delta
    }
    if (currentTime.current > manifest.current.duration || audio.ended) {
      volumetric.ended.set(true)
      return
    }

    if (manifest.current.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      updateUniformSolve(currentTime.current)
    } else {
      updateNonUniformSolve(currentTime.current)
    }
    const textureTarget = component.textureTarget.value
    const textureFrame = Math.round(
      currentTime.current * manifest.current.texture.baseColor.targets[textureTarget].frameRate
    )
    setTexture(textureTarget, textureFrame)
  }

  useExecute(update, {
    with: AnimationSystemGroup
  })

  return null
}
