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
import {
  BufferGeometry,
  CompressedTexture,
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
import { GeometryType, TextureType } from '../constants/NewUVOLTypes'
import getFirstMesh from './meshUtils'

export const loadCorto = (url: string, byteStart: number, byteEnd: number) => {
  if (!getState(AssetLoaderState).cortoLoader) {
    throw new Error('loadCorto:CORTOLoader is not available')
  }

  return new Promise<BufferGeometry>((res, rej) => {
    getState(AssetLoaderState).cortoLoader.load(url, byteStart, byteEnd, (geometry) => {
      if (geometry === null) {
        rej(`loadCorto:Failed to load Corto geometry frame from ${url} at bytes ${byteStart} to ${byteEnd}`)
      } else {
        res(geometry)
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

  return new Promise<{ geometry: BufferGeometry; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    dracoLoader.load(
      url,
      (geometry: BufferGeometry) => {
        resolve({ geometry, fetchTime: performance.now() - startTime })
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

  return new Promise<{ mesh: Mesh; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    gltfLoader.load(
      url,
      ({ scene }: GLTF) => {
        const mesh = getFirstMesh(scene)!
        resolve({ mesh, fetchTime: performance.now() - startTime })
      },
      undefined,
      (err) => {
        console.error('Error loading geometry: ', url, err)
        reject(`loadGLTF:Error loading geometry from ${url}: ${err.message}`)
      }
    )
  })
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

  return new Promise<{ texture: CompressedTexture; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    ktx2Loader.load(
      url,
      (texture: CompressedTexture) => {
        texture.repeat.copy(repeat)
        texture.offset.copy(offset)
        texture.updateMatrix()
        resolve({ texture, fetchTime: performance.now() - startTime })
      },
      undefined,
      (err) => {
        reject(`loadKTX2:Error loading KTX2 Texture from ${url}: ${err.message}`)
      }
    )
  })
}

export const createMaterial = (
  geometryType: GeometryType,
  useVideoTexture: boolean,
  hasNormals: boolean,
  textureTypes: TextureType[],
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

  const getShaderDefines = (textureTypes: TextureType[], useVideoTexture: boolean) => {
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

  const replaceSubstrings = (originalString: string, replacements: Record<string, string>) => {
    let newString = originalString
    for (const key in replacements) {
      newString = newString.replace(key, replacements[key])
    }
    return newString
  }

  const defines = getShaderDefines(textureTypes, useVideoTexture)
  const customUniforms = {}

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
      attribute vec3 keyframeA;
      attribute vec3 keyframeB;
      attribute vec3 keyframeANormal;
      attribute vec3 keyframeBNormal;
      uniform float mixRatio;
      uniform vec2 repeat;
      uniform vec2 offset;
      out vec2 custom_vUv;`,

      '#include <begin_vertex>': `
      vec3 transformed = vec3(position);
      transformed.x += mix(keyframeA.x, keyframeB.x, mixRatio); 
      transformed.y += mix(keyframeA.y, keyframeB.y, mixRatio);
      transformed.z += mix(keyframeA.z, keyframeB.z, mixRatio);
      
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
