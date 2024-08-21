/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Engine, getComponent } from '@ir-engine/ecs'
import { ImmutableArray, State, getState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import {
  BufferGeometry,
  CompressedTexture,
  Material,
  Mesh,
  MeshStandardMaterialParameters,
  ShaderLib,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector2
} from 'three'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import {
  ASTCTextureTarget,
  AudioFileFormat,
  DRACOTarget,
  FORMAT_TO_EXTENSION,
  GeometryFormat,
  GeometryType,
  KTX2TextureTarget,
  KeyframeAttribute,
  TextureFormat,
  TextureTarget,
  TextureType,
  UniformSolveTarget
} from '../constants/NewUVOLTypes'
import getFirstMesh from './meshUtils'

export const getBufferGeometrySize = (geometry: BufferGeometry) => {
  const attributes = geometry.attributes
  let size = 0
  for (const key in attributes) {
    const attribute = attributes[key]
    size += attribute.array.byteLength
  }
  return size
}

export const getGLTFGeometrySize = (mesh: Mesh) => {
  let size = getBufferGeometrySize(mesh.geometry)

  if (mesh.geometry.morphAttributes) {
    for (const key in mesh.geometry.morphAttributes) {
      mesh.geometry.morphAttributes[key].map((attribute) => {
        size += attribute.array.byteLength
      })
    }
  }
  return size
}

export const getKTX2TextureSize = (texture: CompressedTexture) => {
  let size = 0
  if (texture.image) {
    texture.mipmaps.map((mipmap) => {
      size += mipmap.data.byteLength
    })
  }
  return size
}

const cortoQueue = [] as {
  url: string
  byteStart: number
  byteEnd: number
  resolve: ({ geometry, memoryOccupied }: { geometry: BufferGeometry; memoryOccupied: number }) => void
  reject: (error: string) => void
}[]
let pendingRequests = 0
const MAX_CORTO_REQUESTS_AT_A_TIME = 6

const processCortoQueue = () => {
  if (pendingRequests >= MAX_CORTO_REQUESTS_AT_A_TIME || cortoQueue.length === 0) {
    return
  }

  const front = cortoQueue.shift()
  if (front) {
    pendingRequests++
    loadCorto(front.url, front.byteStart, front.byteEnd)
      .then((data) => {
        front.resolve(data)
      })
      .catch((err) => {
        front.reject(err)
      })
      .finally(() => {
        pendingRequests--
        if (pendingRequests === 0 && cortoQueue.length > 0) {
          processCortoQueue()
        }
      })
  }
}

export const rateLimitedCortoLoader = (url: string, byteStart: number, byteEnd: number) => {
  return new Promise<{
    geometry: BufferGeometry
    memoryOccupied: number
  }>((resolve, reject) => {
    cortoQueue.push({
      url,
      byteStart,
      byteEnd,
      resolve,
      reject
    })
    processCortoQueue()
  })
}

export const loadCorto = (url: string, byteStart: number, byteEnd: number) => {
  if (!getState(AssetLoaderState).cortoLoader) {
    throw new Error('loadCorto:CORTOLoader is not available')
  }
  return new Promise<{
    geometry: BufferGeometry
    memoryOccupied: number
  }>((res, rej) => {
    getState(AssetLoaderState).cortoLoader.load(url, byteStart, byteEnd, (geometry) => {
      if (geometry === null) {
        rej(`loadCorto:Failed to load Corto geometry frame from ${url} at bytes ${byteStart} to ${byteEnd}`)
      } else {
        res({
          geometry,
          memoryOccupied: getBufferGeometrySize(geometry)
        })
      }
    })
  })
}

export const loadDraco = (url: string) => {
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  if (!gltfLoader) {
    throw new Error('loadDraco:GLTFLoader is not available')
  }
  const dracoLoader = gltfLoader.dracoLoader
  if (!dracoLoader) {
    throw new Error('loadDraco:DracoLoader is not available')
  }

  return new Promise<{ geometry: BufferGeometry; fetchTime: number; memoryOccupied: number }>((resolve, reject) => {
    const startTime = performance.now()
    dracoLoader.load(
      url,
      (geometry: BufferGeometry) => {
        resolve({
          geometry,
          fetchTime: performance.now() - startTime,
          memoryOccupied: getBufferGeometrySize(geometry)
        })
      },
      undefined,
      (error) => {
        reject(`loadDraco:Error loading draco geometry from ${url}: ${error.message}`)
      }
    )
  })
}

export const loadGLTF = (url: string) => {
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  if (!gltfLoader) {
    throw new Error('loadDraco:GLTFLoader is not available')
  }

  return new Promise<{ mesh: Mesh<BufferGeometry, Material>; fetchTime: number; memoryOccupied: number }>(
    (resolve, reject) => {
      const startTime = performance.now()
      gltfLoader.load(
        url,
        ({ scene }: GLTF) => {
          const mesh = getFirstMesh(scene)!
          resolve({
            mesh: mesh as Mesh<BufferGeometry, Material>,
            fetchTime: performance.now() - startTime,
            memoryOccupied: getGLTFGeometrySize(mesh)
          })
        },
        undefined,
        (err) => {
          console.error('Error loading geometry: ', url, err)
          reject(`loadGLTF:Error loading geometry from ${url}: ${err.message}`)
        }
      )
    }
  )
}

export const loadKTX2 = (url: string, _repeat?: Vector2, _offset?: Vector2) => {
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  if (!gltfLoader) {
    throw new Error('loadKTX2:GLTFLoader is not available')
  }
  const ktx2Loader = gltfLoader.ktx2Loader
  if (!ktx2Loader) {
    throw new Error('loadKTX2:KTX2Loader is not available')
  }

  const repeat = _repeat || new Vector2(1, 1)
  const offset = _offset || new Vector2(0, 0)

  return new Promise<{ texture: CompressedTexture; fetchTime: number; memoryOccupied: number }>((resolve, reject) => {
    const startTime = performance.now()
    ktx2Loader.load(
      url,
      (texture: CompressedTexture) => {
        texture.repeat.copy(repeat)
        texture.offset.copy(offset)
        texture.updateMatrix()
        resolve({ texture, fetchTime: performance.now() - startTime, memoryOccupied: getKTX2TextureSize(texture) })
      },
      undefined,
      (err) => {
        reject(`loadKTX2:Error loading KTX2 Texture from ${url}: ${err.message}`)
      }
    )
  })
}

const replaceSubstrings = (originalString: string, replacements: Record<string, string>) => {
  let newString = originalString
  for (const key in replacements) {
    newString = newString.replace(key, replacements[key])
  }
  return newString
}

export const createMaterial = (
  geometryType: GeometryType,
  useVideoTexture: boolean,
  hasNormals: boolean,
  textureTypes: ImmutableArray<TextureType>,
  overrideMaterialProperties?: MeshStandardMaterialParameters
) => {
  const DEFINES: Record<TextureType, object> = {
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

  const getShaderDefines = (textureTypes: ImmutableArray<TextureType>, useVideoTexture: boolean) => {
    const defines = {}
    textureTypes.forEach((type) => {
      if (DEFINES[type]) {
        Object.assign(defines, DEFINES[type])
      }
    })

    if (useVideoTexture) {
      defines['DECODE_VIDEO_TEXTURE'] = ''
    }

    return defines
  }

  const defines = getShaderDefines(textureTypes, useVideoTexture)
  const customUniforms = {
    mixRatio: {
      value: 0
    }
  }

  if (overrideMaterialProperties) {
    for (const key in overrideMaterialProperties) {
      const propertyValue = overrideMaterialProperties[key]
      if (typeof propertyValue === 'number' || typeof propertyValue === 'boolean') {
        customUniforms[key] = {
          value: propertyValue
        }
      } else if (typeof propertyValue === 'object') {
        if (propertyValue.x !== undefined && propertyValue.y !== undefined) {
          customUniforms[key] = {
            value: new Vector2(propertyValue.x, propertyValue.y)
          }
        } else if (Array.isArray(propertyValue) && propertyValue.length === 2) {
          customUniforms[key] = {
            value: new Vector2(propertyValue[0], propertyValue[1])
          }
        }
      }
    }
  }

  const shaderName = hasNormals ? 'physical' : 'basic'
  let vertexShader = ShaderLib[shaderName].vertexShader

  const allUniforms = UniformsUtils.merge([ShaderLib[shaderName].uniforms, UniformsLib.lights, customUniforms])

  if (geometryType === GeometryType.Unify) {
    vertexShader = replaceSubstrings(ShaderLib[shaderName].vertexShader, {
      '#include <clipping_planes_pars_vertex>': `#include <clipping_planes_pars_vertex>
attribute vec3 keyframeAPosition;
attribute vec3 keyframeBPosition;
attribute vec3 keyframeANormal;
attribute vec3 keyframeBNormal;
uniform float mixRatio;
uniform vec2 repeat;
uniform vec2 offset;
out vec2 custom_vUv;`,

      '#include <begin_vertex>': `
      vec3 transformed = vec3(position);
      transformed.x += mix(keyframeAPosition.x, keyframeBPosition.x, mixRatio); 
      transformed.y += mix(keyframeAPosition.y, keyframeBPosition.y, mixRatio);
      transformed.z += mix(keyframeAPosition.z, keyframeBPosition.z, mixRatio);
      
      #ifdef USE_ALPHAHASH
      
        vPosition = vec3( transformed );
      
      #endif`,

      '#include <beginnormal_vertex>': `
      vec3 objectNormal = vec3( normal );
      objectNormal.x += mix(keyframeANormal.x, keyframeBNormal.x, mixRatio);
      objectNormal.y += mix(keyframeANormal.y, keyframeBNormal.y, mixRatio);
      objectNormal.z += mix(keyframeANormal.z, keyframeBNormal.z, mixRatio);

      #ifdef USE_TANGENT

        vec3 objectTangent = vec3( tangent.xyz );

      #endif`
    })
  }

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader: ShaderLib[shaderName].fragmentShader,
    uniforms: allUniforms,
    defines,
    lights: true
  })

  return material
}

export const getSortedSupportedTargets = (targets: Record<string, TextureTarget>) => {
  const supportedTargets = [] as string[]

  for (const key in targets) {
    const targetData = targets[key]

    if (targetData.format === 'astc/ktx2') {
      if (isMobile || isMobileXRHeadset) {
        supportedTargets.push(key)
      }
    } else {
      supportedTargets.push(key)
    }
  }

  supportedTargets.sort((a, b) => {
    type TextureTargetType = KTX2TextureTarget | ASTCTextureTarget
    const targetA = targets[a] as TextureTargetType
    const targetB = targets[b] as TextureTargetType

    const aPixelPerSec = targetA.frameRate * targetA.settings.resolution.width * targetA.settings.resolution.height
    const bPixelPerSec = targetB.frameRate * targetB.settings.resolution.width * targetB.settings.resolution.height
    return aPixelPerSec - bPixelPerSec
  })

  return supportedTargets
}

interface GetResourceURLBasicProps {
  manifestPath: string
  type: 'geometry' | 'texture' | 'audio'
}

interface GetResourceURLCortoGeometryProps extends GetResourceURLBasicProps {
  type: 'geometry'
  geometryType: GeometryType.Corto
}

interface GetResourceURLNewGeometryProps extends GetResourceURLBasicProps {
  type: 'geometry'
  geometryType: GeometryType.Draco | GeometryType.Unify
  path: string
  target: string
  index: number
  format: GeometryFormat
}

type GetResourceURLGeometryProps = GetResourceURLCortoGeometryProps | GetResourceURLNewGeometryProps

interface GetResourceURLTextureProps extends GetResourceURLBasicProps {
  type: 'texture'
  path: string
  target: string
  index: number
  format: TextureFormat
  textureType: TextureType
}

interface GetResourceURLAudioProps extends GetResourceURLBasicProps {
  type: 'audio'
  path: string
  format: AudioFileFormat
}

type GetResourceURLProps = GetResourceURLGeometryProps | GetResourceURLTextureProps | GetResourceURLAudioProps

const combineURLs = (baseURL: string, relativeURL: string) => {
  if (relativeURL.startsWith('https://') || relativeURL.startsWith('http://')) {
    return relativeURL
  }
  const baseURLWithoutLastPart = baseURL.substring(0, baseURL.lastIndexOf('/') + 1)
  return baseURLWithoutLastPart + relativeURL
}

const countHashes = (str: string) => {
  let count = 0
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '#') {
      count++
    }
  }
  return count
}

export const getResourceURL = (props: GetResourceURLProps) => {
  if (props.type === 'geometry') {
    if (props.geometryType === GeometryType.Corto) {
      if (props.manifestPath.endsWith('.manifest')) {
        return props.manifestPath.replace('.manifest', '.drcs')
      } else if (props.manifestPath.endsWith('.mp4')) {
        return props.manifestPath.replace('.mp4', '.drcs')
      } else {
        throw new Error('getResourceURL:Invalid manifest path for Corto geometry')
      }
    } else {
      const absolutePlaceholderPath = combineURLs(props.manifestPath, props.path)
      const padLength = countHashes(absolutePlaceholderPath)
      const paddedString = '[' + '#'.repeat(padLength) + ']'
      const paddedIndex = props.index.toString().padStart(padLength, '0')

      const absolutePath = replaceSubstrings(absolutePlaceholderPath, {
        '[ext]': FORMAT_TO_EXTENSION[props.format],
        '[target]': props.target,
        [paddedString]: paddedIndex
      })

      return absolutePath
    }
  } else if (props.type === 'texture') {
    const absolutePlaceholderPath = combineURLs(props.manifestPath, props.path)
    const padLength = countHashes(absolutePlaceholderPath)
    const paddedString = '[' + '#'.repeat(padLength) + ']'
    const paddedIndex = props.index.toString().padStart(padLength, '0')

    const absolutePath = replaceSubstrings(absolutePlaceholderPath, {
      '[ext]': FORMAT_TO_EXTENSION[props.format],
      '[target]': props.target,
      '[type]': props.textureType,
      [paddedString]: paddedIndex
    })

    return absolutePath
  } else if (props.type === 'audio') {
    const absolutePlaceholderPath = combineURLs(props.manifestPath, props.path)
    const absolutePath = replaceSubstrings(absolutePlaceholderPath, {
      '[ext]': FORMAT_TO_EXTENSION[props.format]
    })
    return absolutePath
  } else {
    throw new Error('getResourceURL:Invalid type. Must be either "geometry" or "texture"')
  }
}

interface GetGeometryBaseProps {
  geometryBuffer: Map<string, (Mesh<BufferGeometry, Material> | BufferGeometry | KeyframeAttribute)[]>
  currentTimeInMS: number
  preferredTarget: string
  targets: string[]
  geometryType: GeometryType
}

interface GetGeometryModernProps extends GetGeometryBaseProps {
  targetData: Record<string, DRACOTarget | UniformSolveTarget>
}

interface GetGeometryUnifyProps extends GetGeometryModernProps {
  geometryType: GeometryType.Unify
  keyframeName: 'keyframeA' | 'keyframeB'
}

interface GetGeometryNonUnifyProps extends GetGeometryModernProps {
  geometryType: GeometryType.Draco
}

interface GetGeometryCortoProps extends GetGeometryBaseProps {
  geometryType: GeometryType.Corto
  frameRate: number
}

export type GetGeometryProps = GetGeometryUnifyProps | GetGeometryNonUnifyProps | GetGeometryCortoProps

export const getGeometry = ({
  geometryBuffer,
  currentTimeInMS,
  preferredTarget,
  geometryType,
  targets,
  ...props
}: GetGeometryProps) => {
  const keyframeName = (props as GetGeometryUnifyProps).keyframeName

  if (geometryBuffer.has(preferredTarget)) {
    const frameRate =
      geometryType === GeometryType.Corto
        ? (props as GetGeometryCortoProps).frameRate
        : (props as GetGeometryModernProps).targetData[preferredTarget].frameRate
    let preferredTargetIndex = (currentTimeInMS * frameRate) / 1000
    if (geometryType === GeometryType.Unify) {
      preferredTargetIndex =
        keyframeName === 'keyframeA' ? Math.floor(preferredTargetIndex) : Math.ceil(preferredTargetIndex)
    } else {
      preferredTargetIndex = Math.round(preferredTargetIndex)
    }

    const collection = geometryBuffer.get(preferredTarget)!
    const geometry = collection[preferredTargetIndex]
    if (geometry) {
      return {
        geometry,
        target: preferredTarget,
        index: preferredTargetIndex
      }
    }
  }

  if (geometryType === GeometryType.Corto) {
    // Corto Volumetrics does not have multiple targets (legacy)
    return false
  }

  for (const target of targets) {
    if (geometryBuffer.has(target)) {
      let index = (currentTimeInMS * (props as GetGeometryModernProps).targetData[target].frameRate) / 1000
      if (geometryType === GeometryType.Unify) {
        index = keyframeName === 'keyframeA' ? Math.floor(index) : Math.ceil(index)
      } else {
        index = Math.round(index)
      }

      const collection = geometryBuffer.get(target)!
      const geometry = collection[index]
      if (geometry) {
        return {
          geometry,
          target,
          index
        }
      }
    }
  }

  return false
}

interface GetTextureProps {
  textureBuffer: Map<string, CompressedTexture[]>
  currentTimeInMS: number
  preferredTarget: string
  targets: ImmutableArray<string>
  targetData: Record<string, KTX2TextureTarget | ASTCTextureTarget>
  textureType: TextureType
}

export const getTexture = ({
  textureBuffer,
  currentTimeInMS,
  preferredTarget,
  targets,
  targetData
}: GetTextureProps) => {
  if (textureBuffer.has(preferredTarget)) {
    const preferredTargetIndex = Math.round((currentTimeInMS * targetData[preferredTarget].frameRate) / 1000)
    const collection = textureBuffer.get(preferredTarget)!
    const texture = collection[preferredTargetIndex]
    if (texture) {
      return {
        texture,
        target: preferredTarget,
        index: preferredTargetIndex
      }
    }
  }

  for (const target of targets) {
    if (textureBuffer.has(target)) {
      const index = Math.round((currentTimeInMS * targetData[target].frameRate) / 1000)
      const collection = textureBuffer.get(target)!
      const texture = collection[index]
      if (texture) {
        return {
          texture,
          target,
          index
        }
      }
    }
  }

  return false
}

interface handleAutoplayProps {
  audioContext: AudioContext
  media: HTMLMediaElement
  paused: State<boolean>
}

export const handleMediaAutoplay = ({ audioContext, media, paused }: handleAutoplayProps) => {
  const attachEventListeners = () => {
    const canvas = getComponent(Engine.instance.viewerEntity, RendererComponent).canvas!
    const playMedia = () => {
      media.play()
      audioContext.resume()
      paused.set(false)
      window.removeEventListener('pointerdown', playMedia)
      window.removeEventListener('keypress', playMedia)
      window.removeEventListener('touchstart', playMedia)
      canvas.removeEventListener('pointerdown', playMedia)
      canvas.removeEventListener('touchstart', playMedia)
    }
    window.addEventListener('pointerdown', playMedia)
    window.addEventListener('keypress', playMedia)
    window.addEventListener('touchstart', playMedia)
    canvas.addEventListener('pointerdown', playMedia)
    canvas.addEventListener('touchstart', playMedia)
  }

  // Try to play. If it fails, attach event listeners to play on user interaction
  media
    .play()
    .catch((e) => {
      if (e.name === 'NotAllowedError') {
        attachEventListeners()
        console.log('Ready to play Sir!')
      }
    })
    .then(() => {
      console.log('Media playback started by handleAutoplay')
      paused.set(false)
    })
}
