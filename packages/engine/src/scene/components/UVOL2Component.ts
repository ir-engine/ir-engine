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

import { startTransition, useEffect, useMemo, useRef } from 'react'
import {
  BufferGeometry,
  CompressedTexture,
  Group,
  InterleavedBufferAttribute,
  LinearFilter,
  Material,
  Matrix3,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderLib,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  UniformsLib,
  UniformsUtils,
  Vector2
} from 'three'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { usePrevious } from '@etherealengine/common/src/utils/usePrevious'
import {
  defineComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState, ECSState as EngineState } from '@etherealengine/ecs/src/ECSState'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { useExecute } from '@etherealengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { getState, NO_PROXY_STEALTH, none, State } from '@etherealengine/hyperflux'
import { isIPhone, isMobile } from '@etherealengine/spatial/src/common/functions/isMobile'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { isMobileXRHeadset } from '@etherealengine/spatial/src/xr/XRState'

import { AssetExt } from '@etherealengine/common/src/constants/AssetType'
import { getLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import { AudioState } from '../../audio/AudioState'
import { PlayMode } from '../constants/PlayMode'
import {
  ASTCTextureTarget,
  AudioFileFormat,
  DRACO_Manifest,
  FORMAT_TO_EXTENSION,
  GeometryFormat,
  KTX2TextureTarget,
  PlayerManifest,
  TextureFormat,
  TextureType,
  UniformSolveTarget,
  UVOL_TYPE
} from '../constants/UVOLTypes'
import getFirstMesh from '../util/meshUtils'
import { MediaElementComponent } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'
import { UVOLDissolveComponent } from './UVOLDissolveComponent'
import { handleAutoplay, VolumetricComponent } from './VolumetricComponent'

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
  const textureTargets = {
    baseColor: [] as string[],
    normal: [] as string[],
    metallicRoughness: [] as string[],
    emissive: [] as string[],
    occlusion: [] as string[]
  }

  let useVideoTexture = false

  const textureTypes = Object.keys(manifest.texture)
  for (let i = 0; i < textureTypes.length; i++) {
    const textureType = textureTypes[i] as TextureType
    const currentTextureTargets = Object.keys(manifest.texture[textureType]!.targets)
    const supportedTextures = [] as string[]
    const videoTextures = [] as string[]
    currentTextureTargets.forEach((target) => {
      const targetData = manifest.texture[textureType]!.targets[target]
      if (isMobile || isMobileXRHeadset) {
        if (targetData.format === 'astc/ktx2') {
          supportedTextures.push(target)
        }
      } else {
        // Desktop
        if (targetData.format === 'ktx2') {
          supportedTextures.push(target)
        }
      }
      if (targetData.format === 'video') {
        videoTextures.push(target)
      }
    })
    if (supportedTextures.length === 0) {
      // No supported textures, fallback to all textures
      supportedTextures.push(...currentTextureTargets)
    }

    if (videoTextures.length > 0 && isClient && !isMobile && !isMobileXRHeadset) {
      supportedTextures.length = 0
      useVideoTexture = true
      supportedTextures.push(...videoTextures)
    }

    supportedTextures.sort((a, b) => {
      type TextureTargetType = KTX2TextureTarget | ASTCTextureTarget
      const aData = manifest.texture[textureType]!.targets[a] as TextureTargetType
      const bData = manifest.texture[textureType]!.targets[b] as TextureTargetType
      const aPixelPerSec = aData.frameRate * aData.settings.resolution.width * aData.settings.resolution.height
      const bPixelPerSec = bData.frameRate * bData.settings.resolution.width * bData.settings.resolution.height
      return aPixelPerSec - bPixelPerSec
    })
    supportedTextures.forEach((target, index) => {
      manifest.texture[textureType]!.targets[target].priority = index
    })
    textureTargets[textureType] = supportedTextures
  }

  return [manifest, geometryTargets, textureTargets, useVideoTexture] as [
    PlayerManifest,
    string[],
    typeof textureTargets,
    boolean
  ]
}

const getDefines = (manifest: PlayerManifest) => {
  const DEFINES = {
    baseColor: {
      USE_MAP: '',
      MAP_UV: 'uv'
    },
    normal: {
      USE_NORMALMAP: '',
      NORMALMAP_UV: 'uv'
    },
    metallicRoughness: {
      USE_METALNESSMAP: '',
      METALNESSMAP_UV: 'uv',
      USE_ROUGHNESSMAP: '',
      ROUGHNESSMAP_UV: 'uv'
    },
    emissive: {
      USE_EMISSIVEMAP: '',
      EMISSIVEMAP_UV: 'uv'
    },
    occlusion: {
      USE_AOMAP: '',
      AOMAP_UV: 'uv'
    }
  }
  let requiredDefines = {} as Record<string, string>
  const textureTypes = Object.keys(manifest.texture)
  for (let i = 0; i < textureTypes.length; i++) {
    const textureType = textureTypes[i]
    requiredDefines = { ...requiredDefines, ...DEFINES[textureType] }
  }
  return requiredDefines
}

export type BufferMetadata = {
  start: number
  end: number
  fetchTime: number
}

const MAX_TOLERABLE_GAP = 1 / 30 // a single frame at 30fps
export const confirmBufferedRange = (
  buffered: BufferMetadata[],
  start: number,
  end: number,
  includePending: boolean,
  gapTolerance = MAX_TOLERABLE_GAP
) => {
  let gap = 0,
    previousEnd = -1
  if (!includePending) buffered = buffered.filter((el) => el.fetchTime !== -1)
  if (buffered.length === 0) return false
  if (buffered[0].start > start) return false
  if (buffered[buffered.length - 1].end < end) return false
  for (const el of buffered) {
    if (el.start <= start) {
      if (el.end >= end) {
        return true
      } else {
        previousEnd = el.end
      }
    } else {
      gap = el.start - previousEnd
      if (gap > gapTolerance) return false
      previousEnd = el.end
    }
  }
  return true
}

function sortAndMergeBufferMetadata(rangesState: State<BufferMetadata[]>, gapTolerance: number) {
  const ranges = rangesState.get(NO_PROXY_STEALTH) as BufferMetadata[]

  if (ranges.length === 0) return []

  // Sort ranges by start time
  ranges.sort((a, b) => a.start - b.start)

  const mergedRanges: BufferMetadata[] = []
  let currentRange: BufferMetadata = ranges[0]

  for (let i = 1; i < ranges.length; i++) {
    const nextRange = ranges[i]
    // Check for overlap or within specified distance
    const canMerge =
      nextRange.fetchTime > -1 &&
      currentRange.fetchTime > -1 &&
      (nextRange.start <= currentRange.end || nextRange.start - currentRange.end <= gapTolerance)
    if (canMerge) {
      // Merge ranges
      currentRange.end = Math.max(currentRange.end, nextRange.end)
    } else {
      // Add current range to mergedRanges and move to next
      mergedRanges.push(currentRange)
      currentRange = nextRange
    }
  }

  // Add the last range
  mergedRanges.push(currentRange)

  rangesState.set(mergedRanges)
}

export const UVOL2Component = defineComponent({
  name: 'UVOL2Component',

  onInit: (entity) => {
    return {
      canPlay: false,
      manifestPath: '',
      data: {} as PlayerManifest,
      useVideoTexture: true,
      hasAudio: false,
      bufferedUntil: 0,
      geometryInfo: {
        targets: [] as string[],
        userTarget: -1, // -1 implies 'auto'
        currentTarget: 0,
        buffered: [] as BufferMetadata[]
      },
      textureInfo: {
        textureTypes: [] as TextureType[],
        baseColor: {
          targets: [] as string[],
          userTarget: -1,
          currentTarget: 0,
          buffered: [] as BufferMetadata[]
        },
        normal: {
          targets: [] as string[],
          userTarget: -1,
          currentTarget: 0,
          buffered: [] as BufferMetadata[]
        },
        metallicRoughness: {
          targets: [] as string[],
          userTarget: -1,
          currentTarget: 0,
          buffered: [] as BufferMetadata[]
        },
        emissive: {
          targets: [] as string[],
          userTarget: -1,
          currentTarget: 0,
          buffered: [] as BufferMetadata[]
        },
        occlusion: {
          targets: [] as string[],
          userTarget: -1,
          currentTarget: 0,
          buffered: [] as BufferMetadata[]
        }
      },
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

  setStartAndPlaybackTime: (entity: Entity, newMediaStartTime: number, newPlaybackStartDate: number) => {
    const volumetric = getMutableComponent(entity, VolumetricComponent)

    volumetric.currentTrackInfo.merge({
      playbackStartDate: newPlaybackStartDate,
      mediaStartTime: newMediaStartTime
    })
  },

  canPlayThrough: (entity: Entity, start: number, end: number) => {
    const component = getOptionalComponent(entity, UVOL2Component)
    if (!component) return false
    end = Math.min(end, component.data.duration)

    if (!confirmBufferedRange(component.geometryInfo.buffered, start, end, false, MAX_TOLERABLE_GAP)) return false

    if (!component.useVideoTexture) {
      for (const textureType of component.textureInfo.textureTypes)
        if (!confirmBufferedRange(component.textureInfo[textureType].buffered, start, end, false, MAX_TOLERABLE_GAP))
          return false
    }

    return true
  },

  reactor: UVOL2Reactor
})

const loadDraco = (url: string) => {
  return new Promise<{ geometry: BufferGeometry; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    getState(AssetLoaderState).gltfLoader.dracoLoader?.load(url, (geometry: BufferGeometry) => {
      resolve({ geometry, fetchTime: performance.now() - startTime })
    })
  })
}

const loadGLB = (url: string) => {
  return new Promise<{ mesh: Mesh; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    getState(AssetLoaderState).gltfLoader.load(
      url,
      ({ scene }: GLTF) => {
        const mesh = getFirstMesh(scene)!
        resolve({ mesh, fetchTime: performance.now() - startTime })
      },
      undefined,
      (err) => {
        console.error('Error loading geometry: ', url, err)
        reject(err)
      }
    )
  })
}

const loadTexture = (url: string, repeat: Vector2, offset: Vector2) => {
  return new Promise<{ texture: CompressedTexture; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    getLoader(AssetExt.KTX2).load(
      url,
      (texture: CompressedTexture) => {
        texture.repeat.copy(repeat)
        texture.offset.copy(offset)
        texture.updateMatrix()
        resolve({ texture, fetchTime: performance.now() - startTime })
      },
      undefined,
      (err) => {
        console.error('Error loading texture: ', url, err)
        reject(err)
      }
    )
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

const resolvePath = (
  path: string,
  manifestPath: string,
  format: AudioFileFormat | GeometryFormat | TextureFormat,
  target?: string,
  index?: number,
  textureType?: TextureType
) => {
  let resolvedPath = path
  resolvedPath = path.replace('[ext]', FORMAT_TO_EXTENSION[format])
  if (textureType) {
    resolvedPath = resolvedPath.replace('[type]', textureType)
  }
  if (target !== undefined) {
    resolvedPath = resolvedPath.replace('[target]', target)
  }
  index = index ?? 0
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

const createKey = (target: string, index: number, textureType?: TextureType) => {
  let key = target
  if (textureType) {
    key += '_' + textureType + '_'
  }
  key += index.toString().padStart(KEY_PADDING, '0')
  return key
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
  const shadow = useOptionalComponent(entity, ShadowComponent)

  const ecsState = getState(ECSState)

  const mediaElement = getMutableComponent(entity, MediaElementComponent).value
  const audioContext = getState(AudioState).audioContext
  const media = mediaElement.element

  const videoTexture = useMemo(() => {
    const texture = new Texture(media)
    texture.generateMipmaps = false
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    ;(texture as any).isVideoTexture = true
    ;(texture as any).update = () => {}
    texture.colorSpace = SRGBColorSpace
    texture.flipY = false
    return texture
  }, [])

  const geometryBuffer = useMemo(
    () => new Map<string, (Mesh<BufferGeometry, Material> | BufferGeometry | KeyframeAttribute)[]>(),
    []
  )
  const textureBuffer = useMemo(() => new Map<string, Map<string, CompressedTexture[]>>(), [])

  let maxBufferHealth = 14 // seconds
  let minBufferToStart = 4 // seconds
  const minBufferToPlay = 2 // seconds. This is used when enableBuffering is true
  let bufferThreshold = 13 // seconds. If buffer health is less than this, fetch new data
  const repeat = useMemo(() => new Vector2(1, 1), [])
  const offset = useMemo(() => new Vector2(0, 0), [])
  const previousStartTime = usePrevious(volumetric.currentTrackInfo.mediaStartTime)

  const material = useMemo(() => {
    const manifest = component.data.value
    let _material: ShaderMaterial | MeshBasicMaterial = new MeshBasicMaterial({ color: 0xffffff })
    if (manifest.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      const firstTarget = Object.keys(manifest.geometry.targets)[0]
      const hasNormals = !manifest.geometry.targets[firstTarget].settings.excludeNormals
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
      const defines = getDefines(manifest as PlayerManifest)
      if (manifest.materialProperties) {
        const keys = Object.keys(manifest.materialProperties)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          if (key !== 'normalScale') {
            allUniforms[key].value = manifest.materialProperties[key]
          } else {
            allUniforms[key].value = new Vector2(
              manifest.materialProperties[key]![0],
              manifest.materialProperties[key]![1]
            )
          }
        }
      }
      _material = new ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: allUniforms,
        defines: defines,
        lights: true
      })
    }
    return _material
  }, [])

  const defaultGeometry = useMemo(() => new SphereGeometry(3, 32, 32) as BufferGeometry, [])
  const mesh = useMemo(() => new Mesh(defaultGeometry, material), [])
  const group = useMemo(() => {
    const _group = new Group()
    _group.add(mesh)
    return _group
  }, [])

  useEffect(() => {
    if (volumetric.useLoadingEffect.value) {
      setComponent(entity, UVOLDissolveComponent)
    }

    const [sortedManifest, sortedGeometryTargets, sortedTextureTargets, useVideoTexture] = calculatePriority(
      component.data.get({ noproxy: true }) as DRACO_Manifest
    )
    component.data.set(sortedManifest)
    component.geometryInfo.targets.set(sortedGeometryTargets)
    component.useVideoTexture.set(useVideoTexture)
    if (useVideoTexture) {
      volumetric.useLoadingEffect.set(false)
    } else {
      volumetric.useLoadingEffect.set(true)
    }

    const textureTypes = Object.keys(sortedManifest.texture) as TextureType[]
    component.textureInfo.textureTypes.set(textureTypes)

    textureTypes.forEach((textureType) => {
      component.textureInfo[textureType].targets.set(sortedTextureTargets[textureType])
    })

    if (component.data.geometry.targets[sortedGeometryTargets[0]].totalSize) {
      const geometryBitrate =
        component.data.geometry.targets[sortedGeometryTargets[0]].totalSize.value / component.data.duration.value
      const textureBitrate = textureTypes.reduce((prev, textureType) => {
        const target = sortedTextureTargets[textureType][0]
        const targetData = component.data.value.texture[textureType]!.targets[target]
        return prev + targetData.totalSize / component.data.duration.value
      }, 0)
      const totalBitrate = geometryBitrate + textureBitrate
      if (totalBitrate <= 5 * 1024 * 1024) {
        // 5MB
        maxBufferHealth = 15 // seconds
        minBufferToStart = 5 // seconds
        bufferThreshold = 14 // seconds.
      } else if (totalBitrate <= 10 * 1024 * 1024) {
        // 5-10MB
        maxBufferHealth = 10 // seconds
        minBufferToStart = 2 // seconds
        bufferThreshold = 9 // seconds.
      }
      if (isIPhone) {
        maxBufferHealth = 5 // seconds
        minBufferToStart = 2 // seconds
        bufferThreshold = 4 // seconds.
      }
    }

    const shadow = getMutableComponent(entity, ShadowComponent)
    if (sortedManifest.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      // TODO: Cast shadows properly with uniform solve
      shadow.cast.set(false)
      shadow.receive.set(false)
    } else {
      shadow.cast.set(true)
      shadow.receive.set(true)
    }

    const mediaValue = media as HTMLMediaElement

    if (sortedManifest.audio) {
      component.hasAudio.set(true)
      mediaValue.src = resolvePath(
        sortedManifest.audio.path,
        component.manifestPath.value,
        sortedManifest.audio.formats[0]
      )
      mediaValue.playbackRate = sortedManifest.audio.playbackRate
    }

    if (useVideoTexture) {
      const target = sortedTextureTargets.baseColor[0]
      mediaValue.src = resolvePath(
        component.data.texture.baseColor.value.path,
        component.manifestPath.value,
        'video',
        target,
        undefined,
        'baseColor'
      )
      mediaValue.preload = 'auto'
      media.addEventListener('loadeddata', () => {
        component.firstTextureFrameLoaded.set(true)
      })
      media.addEventListener('canplaythrough', () => {
        component.initialTextureBuffersLoaded.set(true)
      })
      ;(material as ShaderMaterial).uniforms.map.value = videoTexture

      // @ts-ignore
      ;(material as ShaderMaterial).map = videoTexture
      ;(material as ShaderMaterial).needsUpdate = true
    }

    volumetric.currentTrackInfo.currentTime.set(volumetric.currentTrackInfo.mediaStartTime.value)
    volumetric.currentTrackInfo.duration.set(sortedManifest.duration)

    // if (isClient && !isMobile && !isMobileXRHeadset) {
    //   // Client's device is desktop.
    //   // Fetch the highest quality textures & geometry

    //   const targetsCount = component.geometryInfo.targets.value.length
    //   component.geometryInfo.merge({
    //     userTarget: targetsCount - 1,
    //     currentTarget: targetsCount - 1
    //   })

    //   component.textureInfo.textureTypes.value.forEach((textureType) => {
    //     const targetsCount = component.textureInfo[textureType].targets.value.length
    //     component.textureInfo[textureType].merge({
    //       currentTarget: targetsCount - 1,
    //       userTarget: targetsCount - 1
    //     })
    //   })
    // }

    const intervalId = setInterval(bufferLoop, 500)
    bufferLoop() // calling now because setInterval will call after 1 second

    return () => {
      removeObjectFromGroup(entity, group)
      media.pause()
      clearInterval(intervalId)
      for (const textureType in textureBuffer) {
        const currentTextureBuffer = textureBuffer.get(textureType)
        if (currentTextureBuffer) {
          for (const target in currentTextureBuffer) {
            const frameData = currentTextureBuffer.get(target)
            if (frameData) {
              for (const frameNo in frameData) {
                const texture = frameData[frameNo]
                texture.dispose()
                delete frameData[frameNo]
              }
            }
          }
        }
      }
      for (const target in geometryBuffer) {
        const frameData = geometryBuffer.get(target)
        if (frameData) {
          for (const frameNo in frameData) {
            const value = frameData[frameNo]
            if (value instanceof Mesh) {
              value.geometry.dispose()
              value.material.dispose()
            } else if (value instanceof BufferGeometry) {
              value.dispose()
            } else if (value instanceof InterleavedBufferAttribute) {
              mesh.geometry.setAttribute(value.name, value)
            }
            delete frameData[frameNo]
          }
        }
      }
      mesh.geometry.dispose()
      mediaValue.src = ''
    }
  }, [])

  const engineState = getState(EngineState)

  useEffect(() => {
    if (component.useVideoTexture.value || volumetric.hasAudio.value) {
      ;(media as HTMLMediaElement).playbackRate = volumetric.currentTrackInfo.playbackRate.value
    }
  }, [volumetric.currentTrackInfo.playbackRate])

  useEffect(() => {
    if (!shadow) return
    if (component.data.value.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      // TODO: Cast shadows properly with uniform solve
      shadow.cast.set(false)
      shadow.receive.set(false)
    } else {
      shadow.cast.set(true)
      shadow.receive.set(true)
    }
  }, [shadow])

  // const fetchNonUniformSolveGeometry = (startFrame: number, endFrame: number, target: string) => {
  //   // TODO: Needs thorough testing
  //   const targetData = component.data.value.geometry.targets[target]
  //   const executionStartTime = performance.now()

  //   for (let i = startFrame; i <= endFrame; i++) {
  //     const frameURL = resolvePath(
  //       component.data.value.geometry.path,
  //       component.manifestPath.value,
  //       targetData.format,
  //       target,
  //       i
  //     )

  //     const currentFrame = i

  //     component.geometryInfo.pendingRequests.set((p) => p + 1)

  //     const start = currentFrame / targetData.frameRate
  //     const end = (currentFrame + 1) / targetData.frameRate
  //     const metadata = {start,end, fetchTime:-1, pending:true}

  //     component.geometryInfo.buffered.merge([metadata])

  //     loadDraco(frameURL).then(({geometry, fetchTime}) => {
  //       if (!hasComponent(entity, UVOL2Component)) return // Component might have been removed
  //       if (!geometryBuffer.has(target)) geometryBuffer.set(target, [])

  //       const frameData = geometryBuffer.get(target)!
  //       frameData[currentFrame] = geometry as BufferGeometry | Mesh<BufferGeometry, Material>

  //       const playTime = end - start

  //       metadata.pending = false
  //       component.geometryInfo.pendingRequests.set((p) => p - 1)
  //       component.firstGeometryFrameLoaded.set(true)

  //       if (!component.initialGeometryBuffersLoaded.value && (i + 1) / targetData.frameRate >= minBufferToStart) {
  //         component.initialGeometryBuffersLoaded.set(true)
  //       }

  //       const metric = fetchTime / playTime
  //       adjustGeometryTarget(metric)
  //     }).finally(() => {
  //       component.geometryInfo.pendingRequests.set((p) => p - 1)
  //     })
  //   }
  // }

  const fetchUniformSolveGeometry = (startTime: number, endTime: number, target: string) => {
    const targetData = component.data.value.geometry.targets[target] as UniformSolveTarget
    const segmentFrameCount = targetData.segmentFrameCount
    const startSegment = Math.floor((startTime * targetData.frameRate) / segmentFrameCount)
    const endSegment = Math.floor((endTime * targetData.frameRate) / segmentFrameCount)

    for (let i = startSegment; i <= endSegment; i++) {
      const segmentURL = resolvePath(
        component.data.value.geometry.path,
        component.manifestPath.value,
        targetData.format,
        target,
        i
      )

      const segmentOffset = i * targetData.segmentFrameCount
      const start = segmentOffset / targetData.frameRate
      const end = start + targetData.settings.segmentSize

      if (
        confirmBufferedRange(
          component.geometryInfo.buffered.value as BufferMetadata[],
          start,
          end,
          true,
          MAX_TOLERABLE_GAP
        )
      )
        continue

      const metadata = { start, end, fetchTime: -1 } as BufferMetadata
      ;(component.geometryInfo.buffered.get(NO_PROXY_STEALTH) as BufferMetadata[]).push(metadata)

      loadGLB(segmentURL)
        .then(({ mesh: segmentMesh, fetchTime }) => {
          if (!hasComponent(entity, UVOL2Component)) return // Component might have been removed
          if (!geometryBuffer.has(target)) geometryBuffer.set(target, [])

          metadata.fetchTime = fetchTime
          const frameData = geometryBuffer.get(target)!
          const positionMorphAttributes = segmentMesh.geometry.morphAttributes.position as InterleavedBufferAttribute[]
          const normalMorphAttributes = segmentMesh.geometry.morphAttributes.normal as InterleavedBufferAttribute[]

          positionMorphAttributes.forEach((attr, index) => {
            const key = createKey(target, segmentOffset + index)
            attr.name = key
            if (normalMorphAttributes) {
              const normalAttr = normalMorphAttributes[index]
              normalAttr.name = key
              frameData[segmentOffset + index] = { position: attr, normal: normalAttr }
            } else {
              frameData[segmentOffset + index] = { position: attr }
            }
          })

          if (
            !mesh.geometry.attributes.position ||
            !segmentMesh.geometry.attributes.position ||
            mesh.geometry.attributes.position.array.length !== segmentMesh.geometry.attributes.position.array.length
          ) {
            for (const attr of Object.keys(segmentMesh.geometry.attributes)) {
              mesh.geometry.attributes[attr] = segmentMesh.geometry.attributes[attr]
              mesh.geometry.attributes[attr].needsUpdate = true
            }
          }

          segmentMesh.geometry.morphAttributes = {}
          if (!component.firstGeometryFrameLoaded.value) {
            // @ts-ignore
            mesh.copy(segmentMesh)
            repeat.copy((segmentMesh.material as MeshStandardMaterial).map?.repeat ?? repeat)
            offset.copy((segmentMesh.material as MeshStandardMaterial).map?.offset ?? offset)
            mesh.material = material
            component.firstGeometryFrameLoaded.set(true)
          }

          if (
            confirmBufferedRange(
              component.geometryInfo.buffered.value as BufferMetadata[],
              startTime,
              startTime + minBufferToPlay,
              false
            )
          ) {
            component.initialGeometryBuffersLoaded.set(true)
          }

          sortAndMergeBufferMetadata(component.geometryInfo.buffered, MAX_TOLERABLE_GAP)
          adjustGeometryTarget()
        })
        .catch(() => {
          const idx = component.geometryInfo.buffered.get(NO_PROXY_STEALTH).indexOf(metadata)
          if (idx !== -1) {
            component.geometryInfo.buffered[idx].set(none)
          }
        })
    }
  }

  const adjustGeometryTarget = () => {
    const userChoice = component.geometryInfo.userTarget.value
    if (userChoice !== -1) {
      component.geometryInfo.currentTarget.set(userChoice)
      return
    }

    const totalFetchTime = component.geometryInfo.buffered.value.reduce((acc, curr) => acc + curr.fetchTime, 0)
    const totalBufferedTime = component.geometryInfo.buffered.value.reduce(
      (acc, curr) => (acc + curr.fetchTime > -1 ? curr.end - curr.start : 0),
      0
    )
    const ratio = totalFetchTime / totalBufferedTime

    const currentTarget = component.geometryInfo.currentTarget.value
    const targetsCount = component.geometryInfo.targets.value.length
    if (ratio >= 0.3) {
      if (currentTarget > 0) {
        component.geometryInfo.currentTarget.set(currentTarget - 1)
      }
    } else if (ratio < 0.2) {
      if (currentTarget < targetsCount - 1) {
        component.geometryInfo.currentTarget.set(currentTarget + 1)
      }
    }
  }

  const adjustTextureTarget = (type: TextureType) => {
    const userChoice = component.textureInfo[type].userTarget.value
    if (userChoice !== -1) {
      component.textureInfo[type].currentTarget.set(userChoice)
      return
    }

    const currentTarget = component.textureInfo[type].currentTarget.value
    const targetsCount = component.textureInfo[type].targets.value.length

    const totalFetchTime = component.textureInfo[type].buffered.value.reduce((acc, curr) => acc + curr.fetchTime, 0)
    const totalBufferedTime = component.textureInfo[type].buffered.value.reduce(
      (acc, curr) => acc + (curr.end - curr.start),
      0
    )
    const ratio = totalFetchTime / totalBufferedTime

    if (ratio >= 0.3) {
      if (currentTarget > 0) {
        component.textureInfo[type].currentTarget.set(currentTarget - 1)
      }
    } else if (ratio < 0.2) {
      if (currentTarget < targetsCount - 1) {
        component.textureInfo[type].currentTarget.set(currentTarget + 1)
      }
    }
  }

  const fetchGeometry = () => {
    const fetchStartTime = volumetric.currentTrackInfo.currentTime.value
    const fetchEndTime = Math.min(fetchStartTime + maxBufferHealth, component.data.duration.value)
    const target = component.geometryInfo.targets.value[component.geometryInfo.currentTarget.value]
    const targetData = component.data.value.geometry.targets[target]
    if (targetData.format === 'uniform-solve') {
      fetchUniformSolveGeometry(fetchStartTime, fetchEndTime, target)
    } else {
      // fetchNonUniformSolveGeometry(startFrame, endFrame, target)
    }
  }

  const fetchTextures = (textureType: TextureType) => {
    const fetchStartTime = volumetric.currentTrackInfo.currentTime.value
    const fetchEndTime = Math.min(fetchStartTime + maxBufferHealth, component.data.duration.value)
    const targetIndex = component.textureInfo[textureType].currentTarget.value
    const target = component.textureInfo[textureType].targets[targetIndex].value
    const targetData = component.data.texture[textureType].value?.targets[target]

    if (!targetData) return

    const startFrame = Math.floor(fetchStartTime * targetData.frameRate)
    const endFrame = Math.floor(fetchEndTime * targetData.frameRate)

    for (let i = startFrame; i <= endFrame; i++) {
      const textureURL = resolvePath(
        component.data.value.texture.baseColor.path,
        component.manifestPath.value,
        targetData.format,
        target,
        i,
        textureType
      )

      if (!textureBuffer.has(textureType)) {
        textureBuffer.set(textureType, new Map<string, CompressedTexture[]>())
      }
      const currentTextureBuffer = textureBuffer.get(textureType)!
      if (!currentTextureBuffer.has(target)) {
        currentTextureBuffer.set(target, [])
      }
      const frameData = currentTextureBuffer.get(target)!

      const start = i / targetData.frameRate
      const end = (i + 1) / targetData.frameRate

      const bufferMetadata = component.textureInfo[textureType].buffered

      if (confirmBufferedRange(bufferMetadata.value as BufferMetadata[], start, end, true, MAX_TOLERABLE_GAP)) continue

      const metadata = { start, end, fetchTime: -1 } as BufferMetadata
      ;(bufferMetadata.get(NO_PROXY_STEALTH) as BufferMetadata[]).push(metadata)

      loadTexture(textureURL, repeat, offset)
        .then((data) => {
          if (!hasComponent(entity, UVOL2Component)) return // Component might have been removed
          frameData[i] = data.texture
          metadata.fetchTime = data.fetchTime

          sortAndMergeBufferMetadata(bufferMetadata, MAX_TOLERABLE_GAP)
          adjustTextureTarget(textureType)

          if (!component.firstTextureFrameLoaded.value) {
            component.firstTextureFrameLoaded.set(true)
          }

          if (
            confirmBufferedRange(
              bufferMetadata.value as BufferMetadata[],
              fetchStartTime,
              fetchStartTime + minBufferToPlay,
              false
            )
          ) {
            component.initialTextureBuffersLoaded.set(true)
          }
        })
        .catch(() => {})
    }
  }

  const bufferLoop = () => {
    fetchGeometry()
    if (!component.useVideoTexture.value) {
      for (let i = 0; i < component.textureInfo.textureTypes.value.length; i++) {
        fetchTextures(component.textureInfo.textureTypes[i].value)
      }
    }
  }

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
    updateGeometry(volumetric.currentTrackInfo.currentTime.value)
    if (!component.useVideoTexture.value) {
      updateAllTextures(volumetric.currentTrackInfo.currentTime.value)
    }

    if (volumetric.useLoadingEffect.value) {
      component.loadingEffectStarted.set(true)
    }

    addObjectToGroup(entity, group)
  }, [component.firstGeometryFrameLoaded, component.firstTextureFrameLoaded])

  useEffect(() => {
    if (component.loadingEffectStarted.value && !component.loadingEffectEnded.value) {
      let headerTemplate: RegExp | undefined = /\/\/\sHEADER_REPLACE_START([\s\S]*?)\/\/\sHEADER_REPLACE_END/
      let mainTemplate: RegExp | undefined = /\/\/\sMAIN_REPLACE_START([\s\S]*?)\/\/\sMAIN_REPLACE_END/

      if (component.data.value.type !== UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE || 1 == 1) {
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
      // Loading effect in progress. Let it finish
      return
    }
    // If autoplay is enabled, play the audio irrespective of paused state
    if (volumetric.autoplay.value && volumetric.initialBuffersLoaded.value) {
      // Reset the loading effect's material
      mesh.material = material
      mesh.material.needsUpdate = true
      if (component.hasAudio.value || component.useVideoTexture.value) {
        handleAutoplay(audioContext, media as HTMLMediaElement, volumetric)
      } else {
        volumetric.paused.set(false)
      }
    }
  }, [
    volumetric.autoplay,
    volumetric.initialBuffersLoaded,
    component.loadingEffectStarted,
    component.loadingEffectEnded
  ])

  useEffect(() => {
    if (volumetric.paused.value) {
      component.canPlay.set(false)
      if (component.hasAudio.value || component.useVideoTexture.value) {
        media.pause()
      }
      return
    }
    UVOL2Component.setStartAndPlaybackTime(
      entity,
      volumetric.currentTrackInfo.currentTime.value,
      ecsState.elapsedSeconds
    )

    if (mesh.material !== material) {
      mesh.material = material
      mesh.material.needsUpdate = true
    }
    if (component.hasAudio.value || component.useVideoTexture.value) {
      handleAutoplay(audioContext, media as HTMLMediaElement, volumetric)
    }
    component.canPlay.set(true)
  }, [volumetric.paused])

  const getFrame = (currentTime: number, frameRate: number, integer = true) => {
    const frame = currentTime * frameRate
    return integer ? Math.round(frame) : frame
  }

  const getAttribute = (name: KeyframeName, currentTime: number) => {
    const currentGeometryTarget = component.geometryInfo.targets[component.geometryInfo.currentTarget.value].value
    let index = getFrame(currentTime, component.data.value.geometry.targets[currentGeometryTarget].frameRate, false)
    if (name === 'keyframeA') {
      index = Math.floor(index)
    } else {
      index = Math.ceil(index)
    }
    const frameData = geometryBuffer.get(currentGeometryTarget)!
    if (!frameData || !frameData[index]) {
      const targets = component.geometryInfo.targets.value

      for (let i = 0; i < targets.length; i++) {
        const _target = targets[i]
        const _targetData = component.data.value.geometry.targets[_target]
        let _index = getFrame(currentTime, _targetData.frameRate, false)
        if (name === 'keyframeA') {
          _index = Math.floor(_index)
        } else {
          _index = Math.ceil(_index)
        }

        const _frameData = geometryBuffer.get(_target)!
        if (_frameData && _frameData[_index]) {
          return _frameData[_index] as KeyframeAttribute
        }
      }
    } else {
      return frameData[index] as KeyframeAttribute
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
    } else if (
      (name === 'keyframeA' || name === 'keyframeANormal') &&
      component.data.deletePreviousBuffers.value === false
    ) {
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
    const frameData = geometryBuffer.get(target)!
    const targetData = component.data.value.geometry.targets[target]

    if (!frameData || !frameData[index]) {
      const frameRate = targetData.frameRate
      const targets = component.geometryInfo.targets.value
      for (let i = 0; i < targets.length; i++) {
        const _target = targets[i]
        const _frameRate = component.data.value.geometry.targets[_target].frameRate
        const _index = Math.round((index * _frameRate) / frameRate)
        const _frameData = geometryBuffer.get(_target)!
        if (_frameData && _frameData[_index]) {
          setGeometry(_target, _index)
          return
        }
      }
    } else {
      if (targetData.format === 'draco') {
        const geometry = frameData[index] as BufferGeometry
        if (mesh.geometry !== geometry) {
          mesh.geometry = geometry
          mesh.geometry.attributes.position.needsUpdate = true
          return
        }
      } else if (targetData.format === 'glb') {
        const model = frameData[index] as Mesh
        const geometry = model.geometry
        if (mesh.geometry !== geometry) {
          mesh.geometry = geometry
          mesh.geometry.attributes.position.needsUpdate = true
        }
        if (model.material instanceof MeshStandardMaterial && model.material.map) {
          if (model.material.map.repeat) {
            repeat.copy(model.material.map.repeat)
          }
          if (model.material.map.offset) {
            offset.copy(model.material.map.offset)
          }
        }
        return
      }
    }
  }

  const setMap = (textureType: TextureType, texture: CompressedTexture) => {
    let oldTextureKey = ''
    if (!texture.repeat.equals(repeat) || !texture.offset.equals(offset)) {
      texture.repeat.copy(repeat)
      texture.offset.copy(offset)
      texture.updateMatrix()
    }

    if (mesh.material instanceof ShaderMaterial) {
      const material = mesh.material as ShaderMaterial
      if (textureType === 'baseColor' && material.uniforms.map.value !== texture) {
        oldTextureKey = material.uniforms.map.value?.name ?? ''
        material.uniforms.map.value = texture
        material.uniforms.mapTransform.value.copy(texture.matrix)
      } else if (textureType === 'emissive' && material.uniforms.emissiveMap.value !== texture) {
        oldTextureKey = material.uniforms.emissiveMap.value?.name ?? ''
        material.uniforms.emissiveMap.value = texture
        material.uniforms.emissiveMapTransform.value.copy(texture.matrix)
      } else if (textureType === 'normal' && material.uniforms.normalMap.value !== texture) {
        oldTextureKey = material.uniforms.normalMap.value?.name ?? ''
        material.uniforms.normalMap.value = texture
        material.uniforms.normalMapTransform.value.copy(texture.matrix)
      } else if (textureType === 'metallicRoughness' && material.uniforms.roughnessMap.value !== texture) {
        oldTextureKey = material.uniforms.roughnessMap.value?.name ?? ''
        material.uniforms.roughnessMap.value = texture
        material.uniforms.roughnessMapTransform.value.copy(texture.matrix)

        material.uniforms.metalnessMap.value = texture
        material.uniforms.metalnessMapTransform.value.copy(texture.matrix)
      } else if (textureType === 'occlusion' && material.uniforms.aoMap.value !== texture) {
        oldTextureKey = material.uniforms.aoMap.value?.name ?? ''
        material.uniforms.aoMap.value = texture
        material.uniforms.aoMapTransform.value.copy(texture.matrix)
      }
    } else {
      const material = mesh.material as MeshBasicMaterial
      if (textureType === 'baseColor') {
        oldTextureKey = material.map?.name ?? ''
        material.map = texture
        material.map.needsUpdate = true
      }
    }
  }

  const setTexture = (textureType: TextureType, target: string, index: number, currentTime: number) => {
    const currentTextureBuffer = textureBuffer.get(textureType)
    if (!currentTextureBuffer) {
      console.error('Texture frames not found for time: ', currentTime)
      return
    }
    const frameData = currentTextureBuffer.get(target)!
    if (!frameData || !frameData[index]) {
      const targets = component.textureInfo[textureType].targets.value
      for (let i = 0; i < targets.length; i++) {
        const _frameRate = component.data.value.texture[textureType]!.targets[targets[i]].frameRate
        const _index = getFrame(currentTime, _frameRate)
        const _currentTextureBuffer = textureBuffer.get(textureType)!
        const _frameData = _currentTextureBuffer.get(targets[i])!

        if (_frameData && _frameData[_index]) {
          setTexture(textureType, targets[i], _index, currentTime)
          return
        }
      }
      console.error('Texture frames not found for time: ', currentTime)
    } else {
      const texture = frameData[index] as CompressedTexture
      setMap(textureType, texture)
    }
  }

  const updateUniformSolve = (currentTime: number) => {
    const keyframeA = getAttribute('keyframeA', currentTime)
    const keyframeB = getAttribute('keyframeB', currentTime)
    if (!keyframeA && !keyframeB) {
      console.error('Geometry frames not found for time: ', currentTime)
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
      const keyframeATime = keyframeAIndex / component.data.value.geometry.targets[keyframeATarget].frameRate

      const keyframeBIndex = parseInt(keyframeB.position.name.slice(-KEY_PADDING))
      const keyframeBTarget = keyframeB.position.name.slice(0, -KEY_PADDING)
      const keyframeBTime = keyframeBIndex / component.data.value.geometry.targets[keyframeBTarget].frameRate

      const d1 = Math.abs(currentTime - keyframeATime)
      const d2 = Math.abs(currentTime - keyframeBTime)
      const mixRatio = d1 + d2 > 0 ? d1 / (d1 + d2) : 0.5
      setPositionAndNormal('keyframeA', keyframeA)
      setPositionAndNormal('keyframeB', keyframeB)
      ;(mesh.material as ShaderMaterial).uniforms.mixRatio.value = mixRatio
    }

    const index = mesh.geometry.index
    const newGeometry = new BufferGeometry()
    const oldGeometry = mesh.geometry

    newGeometry.setIndex(index)
    for (const key in mesh.geometry.attributes) {
      newGeometry.setAttribute(key, mesh.geometry.attributes[key])
      oldGeometry.deleteAttribute(key)
    }
    newGeometry.boundingSphere = mesh.geometry.boundingSphere
    newGeometry.boundingBox = mesh.geometry.boundingBox

    let relevantBufferIndex = -1
    for (const target in component.data.value.geometry.targets) {
      const frameData = geometryBuffer.get(target)
      const frameRate = component.data.value.geometry.targets[target].frameRate
      if (frameData && frameData.length > 0) {
        for (const frameNo in frameData) {
          const frameTime = parseInt(frameNo) / frameRate
          if (frameTime < currentTime - 0.5) {
            const attribute = frameData[frameNo] as KeyframeAttribute
            oldGeometry.setAttribute(attribute.position.name + '.position', attribute.position)
            if (attribute.normal) {
              oldGeometry.setAttribute(attribute.normal.name + '.normal', attribute.normal)
            }
            delete frameData[frameNo]

            relevantBufferIndex = component.geometryInfo.buffered.findIndex((tr) => {
              if (tr.start.value <= frameTime && tr.end.value >= frameTime && tr.fetchTime.value > -1) {
                return true
              }
            })
            if (relevantBufferIndex !== -1) {
              component.geometryInfo.buffered[relevantBufferIndex].start.set((parseInt(frameNo) + 1) / frameRate)
            }
            //

            // const isInIndex =
            //   relevantBufferIndex !== -1 &&
            //   component.geometryInfo.buffered[relevantBufferIndex].start.value <= frameTime &&
            //   component.geometryInfo.buffered[relevantBufferIndex].end.value >= frameTime

            // if (!isInIndex) {
            //   relevantBufferIndex = component.geometryInfo.buffered.findIndex((tr) => {
            //     if (tr.start.value <= frameTime && tr.end.value >= frameTime) {
            //       return true
            //     }
            //   })
            // }

            // if (relevantBufferIndex !== -1) {
            //   component.geometryInfo.buffered[relevantBufferIndex].start.set((parseInt(frameNo) + 1) / frameRate)
            // }
          } else {
            break
          }
        }
      }
    }
    mesh.geometry = newGeometry
    oldGeometry.dispose()
  }

  const updateNonUniformSolve = (currentTime: number) => {
    const geometryTarget = component.geometryInfo.targets[component.geometryInfo.currentTarget.value].value
    const targetData = component.data.value.geometry.targets[geometryTarget]
    const geometryFrame = Math.round(currentTime * component.data.value.geometry.targets[geometryTarget].frameRate)
    setGeometry(geometryTarget, geometryFrame)

    for (const target in component.data.value.geometry.targets) {
      const frameData = geometryBuffer.get(target)
      const frameRate = component.data.value.geometry.targets[target].frameRate
      if (frameData && frameData.length > 0) {
        for (const frameNo in frameData) {
          const frameTime = parseInt(frameNo) / frameRate
          if (frameTime < currentTime - 0.5) {
            if (targetData.format === 'draco') {
              const geometry = frameData[frameNo] as BufferGeometry
              geometry.dispose()
            } else if (targetData.format === 'glb') {
              const oldMesh = frameData[frameNo] as Mesh<BufferGeometry, Material>
              oldMesh.geometry.dispose()
              if (oldMesh.material['map']) {
                oldMesh.material['map'].dispose()
              }
              oldMesh.material.dispose()
            }
            delete frameData[frameNo]
          } else {
            break
          }
        }
      }
    }
  }

  const updateGeometry = (currentTime: number) => {
    if (component.data.value.type === UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE) {
      updateUniformSolve(currentTime)
    } else {
      updateNonUniformSolve(currentTime)
    }
    for (const attr in mesh.geometry.attributes) {
      mesh.geometry.attributes[attr].needsUpdate = true
    }
  }

  const updateAllTextures = (currentTime: number) => {
    component.textureInfo.textureTypes.value.forEach((textureType) => {
      updateTexture(textureType, currentTime)
    })
  }

  const updateTexture = (textureType: TextureType, currentTime: number) => {
    const textureTarget =
      component.textureInfo[textureType].targets[component.textureInfo[textureType].currentTarget.value].value
    const textureFrame = Math.round(
      currentTime * component.data.value.texture[textureType]!.targets[textureTarget].frameRate
    )
    setTexture(textureType, textureTarget, textureFrame, currentTime)
    const currentTextureBuffer = textureBuffer.get(textureType)
    if (!currentTextureBuffer) {
      console.error('Texture frames not found for time: ', currentTime)
      return
    }

    let relevantBufferIndex = -1
    for (const target in component.data.value.texture[textureType]?.targets) {
      const frameData = currentTextureBuffer.get(target)
      if (!frameData || frameData.length === 0) continue
      const frameRate = component.data.value.texture[textureType]?.targets[target].frameRate as number
      if (frameData && frameData.length > 0) {
        for (const frameNo in frameData) {
          const frameTime = parseInt(frameNo) / frameRate
          if (frameTime < currentTime - 0.5) {
            const texture = frameData[frameNo]
            texture.dispose()
            delete frameData[frameNo]

            // const isInIndex =
            //   relevantBufferIndex !== -1 &&
            //   component.textureInfo[textureType].buffered[relevantBufferIndex].start.value <= frameTime &&
            //   component.textureInfo[textureType].buffered[relevantBufferIndex].end.value >= frameTime
            // if (!isInIndex) {
            //   relevantBufferIndex = component.textureInfo[textureType].buffered.findIndex((tr) => {
            //     if (tr.start.value <= frameTime && tr.end.value >= frameTime) {
            //       return true
            //     }
            //   })
            // }
            // if (relevantBufferIndex !== -1) {
            //   component.textureInfo[textureType].buffered[relevantBufferIndex].start.set(
            //     (parseInt(frameNo) + 1) / frameRate
            //   )
            // }

            relevantBufferIndex = component.textureInfo[textureType].buffered.findIndex((tr) => {
              if (tr.start.value <= frameTime && tr.end.value >= frameTime && tr.fetchTime.value > -1) {
                return true
              }
            })
            if (relevantBufferIndex !== -1) {
              component.textureInfo[textureType].buffered[relevantBufferIndex].start.set(
                (parseInt(frameNo) + 1) / frameRate
              )
            }
          } else {
            break
          }
        }
      }
    }
  }

  const isWaiting = useRef(false)

  const update = () => {
    mesh.updateMatrixWorld(true)

    const delta = getState(ECSState).deltaSeconds
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

    if (volumetric.autoPauseWhenBuffering.value) {
      let isWaitingNow = false

      if (
        !UVOL2Component.canPlayThrough(
          entity,
          volumetric.currentTrackInfo.currentTime.value,
          volumetric.currentTrackInfo.currentTime.value + minBufferToPlay
        )
      ) {
        isWaitingNow = true
      }
      if ((component.useVideoTexture.value || volumetric.hasAudio.value) && media.readyState < 3) {
        isWaitingNow = true
      }

      if (!isWaiting.current && !isWaitingNow) {
        // Continue
      } else if (!isWaiting.current && isWaitingNow) {
        isWaiting.current = true
        return
      } else if (isWaiting.current && !isWaitingNow) {
        UVOL2Component.setStartAndPlaybackTime(
          entity,
          volumetric.currentTrackInfo.currentTime.value,
          ecsState.elapsedSeconds
        )
        isWaiting.current = false
      } else if (isWaiting.current && isWaitingNow) {
        return
      }
    }

    let _currentTime = -1
    if (component.data.value.audio || component.useVideoTexture.value) {
      _currentTime = media.currentTime
    } else {
      _currentTime =
        volumetric.currentTrackInfo.mediaStartTime.value +
        (ecsState.elapsedSeconds - volumetric.currentTrackInfo.playbackStartDate.value)
      _currentTime *= volumetric.currentTrackInfo.playbackRate.value
    }

    startTransition(() => {
      volumetric.currentTrackInfo.currentTime.set(_currentTime)
      let _bufferedUntil = volumetric.currentTrackInfo.duration.value
      let _relevantBufferIndex = -1
      _relevantBufferIndex = component.geometryInfo.buffered.findIndex((tr) => {
        if (tr.start.value <= _currentTime && tr.end.value >= _currentTime) {
          return true
        }
      })

      if (_relevantBufferIndex !== -1) {
        _bufferedUntil = Math.min(_bufferedUntil, component.geometryInfo.buffered[_relevantBufferIndex].end.value)
      }
      for (const textureType of component.textureInfo.textureTypes.value) {
        _relevantBufferIndex = component.textureInfo[textureType as TextureType].buffered.findIndex((tr) => {
          if (tr.start.value <= _currentTime && tr.end.value >= _currentTime) {
            return true
          }
        })
        if (_relevantBufferIndex !== -1) {
          _bufferedUntil = Math.min(
            _bufferedUntil,
            component.textureInfo[textureType].buffered[_relevantBufferIndex].end.value
          )
        }
      }
      component.bufferedUntil.set(_bufferedUntil)
    })

    if (volumetric.currentTrackInfo.currentTime.value > component.data.value.duration || media.ended) {
      if (component.data.deletePreviousBuffers.value === false && volumetric.playMode.value === PlayMode.loop) {
        volumetric.currentTrackInfo.currentTime.set(0)
        volumetric.currentTrackInfo.playbackStartDate.set(ecsState.elapsedSeconds)
      } else {
        volumetric.ended.set(true)
        return
      }
    }

    updateGeometry(volumetric.currentTrackInfo.currentTime.value)

    if (!component.useVideoTexture.value) {
      updateAllTextures(volumetric.currentTrackInfo.currentTime.value)
    } else {
      videoTexture.colorSpace = SRGBColorSpace
      if (!videoTexture.repeat.equals(repeat) || !videoTexture.offset.equals(offset)) {
        videoTexture.repeat.copy(repeat)
        videoTexture.offset.copy(offset)
        videoTexture.updateMatrix()
        ;(mesh.material as ShaderMaterial).uniforms.mapTransform.value.copy(videoTexture.matrix)
      }
    }

    videoTexture.needsUpdate = true
  }

  useExecute(update, {
    with: AnimationSystemGroup
  })

  return null
}
