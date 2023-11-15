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
  Matrix3,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderLib,
  ShaderMaterial,
  SphereGeometry,
  UniformsLib,
  UniformsUtils,
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
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
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
import getFirstMesh from '../util/meshUtils'
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
      canPlay: false,
      playbackStartTime: 0,
      manifestPath: '',
      isBuffering: false,
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
      EngineRenderer.instance.renderer.initTexture(texture)
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

const KEY_PADDING = 7
const EPSILON = 0.00001 // For float comparison

const createKey = (target: string, index: number) => {
  return target + index.toString().padStart(KEY_PADDING, '0')
}

type KeyframeAttribute = {
  position: InterleavedBufferAttribute
  normal?: InterleavedBufferAttribute
}
type KeyframePositionName = 'keyframeA' | 'keyframeB'
type KeyframeNormalName = 'keyframeANormal' | 'keyframeBNormal'
type KeyframeName = KeyframePositionName | KeyframeNormalName

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

  const geometryBuffer = useMemo(() => new Map<string, Mesh | BufferGeometry | KeyframeAttribute>(), [])
  const textureBuffer = useMemo(() => new Map<string, CompressedTexture>(), [])
  const maxBufferHealth = 10 // seconds
  const minBufferToPlay = 2 // seconds
  const bufferThreshold = 5 // seconds. If buffer health is less than this, fetch new data
  const repeat = useMemo(() => new Vector2(1, 1), [])
  const offset = useMemo(() => new Vector2(0, 0), [])

  const material = useMemo(() => {
    if (manifest.current.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      const firstTarget = Object.keys(component.data.value.geometry.targets)[0]
      const hasNormals = !manifest.current.geometry.targets[firstTarget].settings.excludeNormals
      const shaderType = hasNormals ? 'physical' : 'basic'

      let vertexShader = ShaderLib[shaderType].vertexShader.replace(
        '#include <clipping_planes_pars_vertex>',
        `#include <clipping_planes_pars_vertex>
attribute vec3 keyframeA;
attribute vec3 keyframeB;
attribute vec3 keyframeANormal;
attribute vec3 keyframeBNormal;
uniform float mixRatio;
uniform vec2 repeat;
uniform vec2 offset;
out vec2 custom_vUv;`
      )
      vertexShader = vertexShader.replace(
        '#include <begin_vertex>',
        `
vec3 transformed = vec3(position);
transformed.x += mix(keyframeA.x, keyframeB.x, mixRatio); 
transformed.y += mix(keyframeA.y, keyframeB.y, mixRatio);
transformed.z += mix(keyframeA.z, keyframeB.z, mixRatio);

#ifdef USE_ALPHAHASH

  vPosition = vec3( transformed );

#endif`
      )
      vertexShader = vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
      vec3 objectNormal = vec3( normal );
      objectNormal.x += mix(keyframeANormal.x, keyframeBNormal.x, mixRatio);
      objectNormal.y += mix(keyframeANormal.y, keyframeBNormal.y, mixRatio);
      objectNormal.z += mix(keyframeANormal.z, keyframeBNormal.z, mixRatio);

      #ifdef USE_TANGENT

        vec3 objectTangent = vec3( tangent.xyz );

      #endif`
      )
      const fragmentShader = ShaderLib[shaderType].fragmentShader
      const uniforms = {
        mixRatio: {
          value: 0
        },
        map: {
          value: null
        },
        mapTransform: {
          value: new Matrix3()
        }
      }
      const allUniforms = UniformsUtils.merge([ShaderLib.physical.uniforms, UniformsLib.lights, uniforms])
      const _material = new ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: allUniforms,
        defines: {
          USE_MAP: '',
          MAP_UV: 'uv'
        },
        lights: true
      })
      return _material
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
    currentTime.current = volumetric.startTime.value
    const intervalId = setInterval(bufferLoop, 3000)
    bufferLoop() // calling now because setInterval will call after 3 seconds

    return () => {
      removeObjectFromGroup(entity, group)
      clearInterval(intervalId)
      for (const texture of textureBuffer.values()) {
        texture.dispose()
      }
      textureBuffer.clear()

      for (const value of geometryBuffer.values()) {
        if (value instanceof Mesh) {
          value.geometry.dispose()
        } else if (value instanceof BufferGeometry) {
          value.dispose()
        } else if (value instanceof InterleavedBufferAttribute) {
          mesh.geometry.setAttribute(value.name, value)
        }
      }

      mesh.geometry.dispose()
      geometryBuffer.clear()
      mesh.material.dispose()
      audio.src = ''
    }
  }, [])

  const fetchNonUniformSolveGeometry = (startFrame: number, endFrame: number, target: string) => {
    // TODO: Needs thorough testing
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
        if (!component.firstGeometryFrameLoaded.value) {
          component.firstGeometryFrameLoaded.set(true)
        }
        if (geometryBufferHealth.current >= minBufferToPlay && !component.initialGeometryBuffersLoaded.value) {
          component.initialGeometryBuffersLoaded.set(true)
        }
      })

      const playTime = geometryBufferHealth.current - oldBufferHealth
      const fetchTime = (Date.now() - startTime) / 1000
      const metric = fetchTime / playTime
      adjustGeometryTarget(metric)
    })
  }

  const fetchUniformSolveGeometry = (startSegment: number, endSegment: number, target: string, extraTime: number) => {
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
        const normalMorphAttributes = model.geometry.morphAttributes.normal as InterleavedBufferAttribute[]
        const segmentDuration = positionMorphAttributes.length / targetData.frameRate
        const segmentOffset = i * targetData.segmentFrameCount

        positionMorphAttributes.forEach((attr, index) => {
          const key = createKey(target, segmentOffset + index)
          attr.name = key
          if (normalMorphAttributes) {
            const normalAttr = normalMorphAttributes[index]
            normalAttr.name = key
            geometryBuffer.set(key, { position: attr, normal: normalAttr })
          } else {
            geometryBuffer.set(key, { position: attr })
          }
        })

        model.geometry.morphAttributes = {}
        if (!component.firstGeometryFrameLoaded.value) {
          // @ts-ignore
          mesh.copy(model)
          repeat.copy((model.material as MeshStandardMaterial).map?.repeat ?? repeat)
          offset.copy((model.material as MeshStandardMaterial).map?.offset ?? offset)
          mesh.material = material
          component.firstGeometryFrameLoaded.set(true)
        }

        geometryBufferHealth.current += segmentDuration
        pendingGeometryRequests.current--

        if (geometryBufferHealth.current >= minBufferToPlay && !component.initialGeometryBuffersLoaded.value) {
          component.initialGeometryBuffersLoaded.set(true)
        }
      })

      const playTime = geometryBufferHealth.current - oldBufferHealth
      const fetchTime = (Date.now() - startTime) / 1000
      const metric = fetchTime / playTime
      adjustGeometryTarget(metric)
      if (extraTime >= 0) {
        geometryBufferHealth.current -= extraTime
      }
    })
  }

  const adjustGeometryTarget = (metric: number) => {
    if (metric >= 0.25) {
      const currentTargetIndex = geometryTargets.current.indexOf(component.geometryTarget.value)
      if (currentTargetIndex > 0) {
        component.geometryTarget.set(geometryTargets.current[currentTargetIndex - 1])
      }
    } else if (metric < 0.1) {
      const currentTargetIndex = geometryTargets.current.indexOf(component.geometryTarget.value)
      if (currentTargetIndex < geometryTargets.current.length - 1) {
        component.geometryTarget.set(geometryTargets.current[currentTargetIndex + 1])
      }
    }
  }

  const adjustTextureTarget = (metric: number) => {
    if (metric >= 0.25) {
      const currentTargetIndex = textureTargets.current.indexOf(component.textureTarget.value)
      if (currentTargetIndex > 0) {
        component.textureTarget.set(textureTargets.current[currentTargetIndex - 1])
      }
    } else if (metric < 0.1) {
      const currentTargetIndex = textureTargets.current.indexOf(component.textureTarget.value)
      if (currentTargetIndex < textureTargets.current.length - 1) {
        component.textureTarget.set(textureTargets.current[currentTargetIndex + 1])
      }
    }
  }

  const fetchGeometry = () => {
    const currentBufferLength = geometryBufferHealth.current - (currentTime.current - volumetric.startTime.value)
    if (currentBufferLength >= Math.min(bufferThreshold, maxBufferHealth) || pendingGeometryRequests.current > 0) {
      return
    }
    const target = component.geometryTarget.value ? component.geometryTarget.value : geometryTargets.current[0]

    const targetData = manifest.current.geometry.targets[target]
    const frameRate = targetData.frameRate
    const frameCount = targetData.frameCount

    const startFrame = Math.round((geometryBufferHealth.current + volumetric.startTime.value) * frameRate)
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
      const startFrameTime = startFrame / frameRate
      const startSegmentTime = startSegment * targetData.settings.segmentSize

      /**
       * 'extraTime' worth buffers are fetched again, possibly with different target
       * this happens when there is a change in segment size
       * to avoid adding this part to bufferHealth again, subtract it.
       */
      const extraTime = startFrameTime - startSegmentTime
      fetchUniformSolveGeometry(startSegment, endSegment, target, extraTime)
    } else {
      fetchNonUniformSolveGeometry(startFrame, endFrame, target)
    }
  }

  const fetchTextures = () => {
    const currentBufferLength = textureBufferHealth.current - (currentTime.current - volumetric.startTime.value)
    if (currentBufferLength >= Math.min(bufferThreshold, maxBufferHealth) || pendingTextureRequests.current > 0) {
      return
    }
    const target = component.textureTarget.value ? component.textureTarget.value : textureTargets.current[0]
    const targetData = manifest.current.texture.baseColor.targets[target]
    const frameRate = targetData.frameRate
    const startFrame = Math.round((textureBufferHealth.current + volumetric.startTime.value) * frameRate)
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
        textureBuffer.set(key, texture)
        textureBufferHealth.current += 1 / frameRate
        if (textureBufferHealth.current >= minBufferToPlay && !component.initialTextureBuffersLoaded.value) {
          component.initialTextureBuffersLoaded.set(true)
        }
        if (!component.firstTextureFrameLoaded.value) {
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
  }

  useEffect(() => {
    if (component.isBuffering.value) {
      component.geometryTarget.set(geometryTargets.current[0])
      component.textureTarget.set(textureTargets.current[0])
    }
  }, [component.isBuffering])

  useEffect(() => {
    if (!component.initialGeometryBuffersLoaded.value || !component.initialTextureBuffersLoaded.value) {
      return
    }
    volumetric.initialBuffersLoaded.set(true)
  }, [component.initialGeometryBuffersLoaded, component.initialTextureBuffersLoaded])

  useEffect(() => {
    if (!component.firstGeometryFrameLoaded.value || !component.firstTextureFrameLoaded.value) {
      return
    }
    updateGeometry(currentTime.current)
    updateTexture(currentTime.current)

    if (volumetric.useLoadingEffect.value) {
      let headerTemplate: RegExp | undefined = /\/\/\sHEADER_REPLACE_START([\s\S]*?)\/\/\sHEADER_REPLACE_END/
      let mainTemplate: RegExp | undefined = /\/\/\sMAIN_REPLACE_START([\s\S]*?)\/\/\sMAIN_REPLACE_END/

      if (manifest.current.type !== UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE || 1 == 1) {
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
    if (volumetric.paused.value) {
      component.canPlay.set(false)
      if (component.hasAudio.value) {
        audio.pause()
      }
      return
    }
    component.playbackStartTime.set(Date.now())
    volumetric.startTime.set(currentTime.current)
    geometryBufferHealth.current -= currentTime.current
    textureBufferHealth.current -= currentTime.current

    if (mesh.material !== material) {
      mesh.material = material
      mesh.material.needsUpdate = true
    }
    if (component.hasAudio.value) {
      handleAutoplay(audioContext, audio, volumetric)
    }
    component.canPlay.set(true)
  }, [volumetric.paused])

  const getFrame = (currentTime: number, frameRate: number, integer = true) => {
    const frame = currentTime * frameRate
    return integer ? Math.round(frame) : frame
  }

  const getAttribute = (name: KeyframeName, currentTime: number) => {
    const currentGeometryTarget = component.geometryTarget.value
    let index = getFrame(currentTime, manifest.current.geometry.targets[currentGeometryTarget].frameRate, false)
    if (name === 'keyframeA') {
      index = Math.floor(index)
    } else {
      index = Math.ceil(index)
    }
    const key = createKey(currentGeometryTarget, index)
    if (!geometryBuffer.has(key)) {
      const targets = Object.keys(manifest.current.geometry.targets)

      for (let i = 0; i < targets.length; i++) {
        const _target = targets[i]
        const _targetData = manifest.current.geometry.targets[_target]
        let _index = getFrame(currentTime, _targetData.frameRate, false)
        if (name === 'keyframeA') {
          _index = Math.floor(_index)
        } else {
          _index = Math.ceil(_index)
        }

        if (geometryBuffer.has(createKey(_target, _index))) {
          return geometryBuffer.get(createKey(_target, _index)) as KeyframeAttribute
        }
      }
    } else {
      return geometryBuffer.get(key) as KeyframeAttribute
    }

    return false
  }

  const setPositionAndNormal = (name: KeyframePositionName, attr: KeyframeAttribute) => {
    setAttribute(name, attr.position)
    if (attr.normal) {
      setAttribute((name + 'Normal') as KeyframeNormalName, attr.normal)
    }
  }

  /**
   * Sets the attribute on the mesh's geometry
   * And disposes the old attribute. Since that's not supported by three.js natively,
   * we transfer the old attibute to a new geometry and dispose it.
   */
  const setAttribute = (name: KeyframeName, attribute: InterleavedBufferAttribute) => {
    if (mesh.geometry.attributes[name] === attribute) {
      return
    }

    if (name === 'keyframeB' || name === 'keyframeBNormal') {
      /**
       * Disposing should be done only on keyframeA
       * Because, keyframeA will use the previous buffer of keyframeB in the next frame.
       */
      mesh.geometry.attributes[name] = attribute
      mesh.geometry.attributes[name].needsUpdate = true
      return
    }

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

    // Dispose method exists only on rendered geometries
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
      for (let i = 0; i < targets.length; i++) {
        const _target = targets[i]
        const _frameRate = manifest.current.geometry.targets[_target].frameRate
        const _index = Math.round((index * _frameRate) / frameRate)
        if (geometryBuffer.has(createKey(_target, _index))) {
          setGeometry(_target, _index)
          return
        }
      }
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

  const setTexture = (target: string, index: number, currentTime: number) => {
    const key = createKey(target, index)
    if (!textureBuffer.has(key)) {
      const targets = Object.keys(manifest.current.texture.baseColor.targets)
      for (let i = 0; i < targets.length; i++) {
        const _frameRate = manifest.current.texture.baseColor.targets[targets[i]].frameRate
        const _index = getFrame(currentTime, _frameRate)
        if (textureBuffer.has(createKey(targets[i], _index))) {
          setTexture(targets[i], _index, currentTime)
          return
        }
      }
    } else {
      const texture = textureBuffer.get(key)!
      if (mesh.material instanceof ShaderMaterial) {
        const oldTextureKey = mesh.material.uniforms.map.value?.name ?? ''
        if (mesh.material.uniforms.map.value !== texture) {
          mesh.material.uniforms.map.value = texture
          mesh.material.uniforms.map.value.needsUpdate = true
          texture.repeat.copy(repeat)
          texture.offset.copy(offset)
          texture.updateMatrix()
          mesh.material.uniforms.mapTransform.value.copy(texture.matrix)
          const oldTexture = textureBuffer.get(oldTextureKey)
          if (oldTexture) {
            oldTexture.dispose()
          }
          textureBuffer.delete(oldTextureKey)
        }
      } else {
        const material = mesh.material as MeshBasicMaterial
        const oldTextureKey = material.map?.name ?? ''
        if (material.map !== texture) {
          texture.repeat.copy(repeat)
          texture.offset.copy(offset)
          material.map = texture
          material.map.needsUpdate = true
          const oldTexture = textureBuffer.get(oldTextureKey)
          if (oldTexture) {
            oldTexture.dispose()
          }
          textureBuffer.delete(oldTextureKey)
        }
      }
    }
  }

  const updateUniformSolve = (currentTime: number) => {
    const keyframeA = getAttribute('keyframeA', currentTime)
    const keyframeB = getAttribute('keyframeB', currentTime)

    if (!keyframeA && !keyframeB) {
      return
    } else if (!keyframeA && keyframeB) {
      setPositionAndNormal('keyframeB', keyframeB)
      ;(mesh.material as ShaderMaterial).uniforms.mixRatio.value = 1
      return
    } else if (keyframeA && !keyframeB) {
      setPositionAndNormal('keyframeA', keyframeA)
      ;(mesh.material as ShaderMaterial).uniforms.mixRatio.value = 0
      return
    } else if (keyframeA && keyframeB) {
      const keyframeAIndex = parseInt(keyframeA.position.name.slice(-KEY_PADDING))
      const keyframeATarget = keyframeA.position.name.slice(0, -KEY_PADDING)
      const keyframeATime = keyframeAIndex / manifest.current.geometry.targets[keyframeATarget].frameRate

      const keyframeBIndex = parseInt(keyframeB.position.name.slice(-KEY_PADDING))
      const keyframeBTarget = keyframeB.position.name.slice(0, -KEY_PADDING)
      const keyframeBTime = keyframeBIndex / manifest.current.geometry.targets[keyframeBTarget].frameRate

      const d1 = Math.abs(currentTime - keyframeATime)
      const d2 = Math.abs(currentTime - keyframeBTime)
      const mixRatio = d1 + d2 > 0 ? d1 / (d1 + d2) : 0.5
      setPositionAndNormal('keyframeA', keyframeA)
      setPositionAndNormal('keyframeB', keyframeB)
      ;(mesh.material as ShaderMaterial).uniforms.mixRatio.value = mixRatio
    }
  }

  const updateNonUniformSolve = (currentTime: number) => {
    const geometryTarget = component.geometryTarget.value
    const geometryFrame = Math.round(currentTime * manifest.current.geometry.targets[geometryTarget].frameRate)
    setGeometry(geometryTarget, geometryFrame)
  }

  const updateGeometry = (currentTime: number) => {
    if (manifest.current.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      updateUniformSolve(currentTime)
    } else {
      updateNonUniformSolve(currentTime)
    }
  }

  const updateTexture = (currentTime: number) => {
    const textureTarget = component.textureTarget.value
    const textureFrame = Math.round(currentTime * manifest.current.texture.baseColor.targets[textureTarget].frameRate)
    setTexture(textureTarget, textureFrame, currentTime)
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

    if (!component.canPlay.value || !volumetric.initialBuffersLoaded.value) {
      return
    }
    if (manifest.current.audio) {
      currentTime.current = audio.currentTime
    } else {
      currentTime.current = volumetric.startTime.value + (Date.now() - component.playbackStartTime.value) / 1000
    }
    if (currentTime.current > manifest.current.duration || audio.ended) {
      volumetric.ended.set(true)
      return
    }

    updateGeometry(currentTime.current)
    updateTexture(currentTime.current)
  }

  useExecute(update, {
    with: AnimationSystemGroup
  })

  return null
}
