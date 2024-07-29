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

import { GLTF } from '@gltf-transform/core'
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  ImageBitmapLoader,
  ImageLoader,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearSRGBColorSpace,
  LoaderUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Sphere,
  Texture,
  TextureLoader,
  Vector2,
  Vector3
} from 'three'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import {
  ALPHA_MODES,
  WEBGL_COMPONENT_TYPES,
  WEBGL_FILTERS,
  WEBGL_TYPE_SIZES,
  WEBGL_WRAPPINGS
} from '../assets/loaders/gltf/GLTFConstants'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import {
  addUnknownExtensionsToUserData,
  assignExtrasToUserData,
  getNormalizedComponentScale
} from '../assets/loaders/gltf/GLTFLoaderFunctions'
import { GLTFParserOptions, GLTFRegistry, getImageURIMimeType } from '../assets/loaders/gltf/GLTFParser'
import { GLTFExtensions } from './GLTFExtensions'

// todo make this a state
const cache = new GLTFRegistry()

const loadAccessor = (options: GLTFParserOptions, json: GLTF.IGLTF, accessorIndex: number) => {
  const accessorDef = json.accessors![accessorIndex]

  if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
    const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
    const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]
    const normalized = accessorDef.normalized === true

    const array = new TypedArray(accessorDef.count * itemSize)
    return Promise.resolve(new BufferAttribute(array, itemSize, normalized))
  }

  const pendingBufferViews = [] as Array<Promise<ArrayBuffer> | null>

  if (accessorDef.bufferView !== undefined) {
    pendingBufferViews.push(GLTFLoaderFunctions.loadBufferView(options, json, accessorDef.bufferView))
  } else {
    pendingBufferViews.push(null)
  }

  if (accessorDef.sparse !== undefined) {
    pendingBufferViews.push(GLTFLoaderFunctions.loadBufferView(options, json, accessorDef.sparse.indices.bufferView))
    pendingBufferViews.push(GLTFLoaderFunctions.loadBufferView(options, json, accessorDef.sparse.values.bufferView))
  }

  return Promise.all(pendingBufferViews).then(function (bufferViews) {
    const bufferView = bufferViews[0]

    const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
    const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

    // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
    const elementBytes = TypedArray.BYTES_PER_ELEMENT
    const itemBytes = elementBytes * itemSize
    const byteOffset = accessorDef.byteOffset || 0
    const byteStride =
      accessorDef.bufferView !== undefined ? json.bufferViews![accessorDef.bufferView].byteStride : undefined
    const normalized = accessorDef.normalized === true
    let array, bufferAttribute

    // The buffer is not interleaved if the stride is the item size in bytes.
    if (byteStride && byteStride !== itemBytes) {
      // Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
      // This makes sure that IBA.count reflects accessor.count properly
      const ibSlice = Math.floor(byteOffset / byteStride)
      const ibCacheKey =
        'InterleavedBuffer:' +
        accessorDef.bufferView +
        ':' +
        accessorDef.componentType +
        ':' +
        ibSlice +
        ':' +
        accessorDef.count
      let ib = cache.get(ibCacheKey)

      if (!ib) {
        array = new TypedArray(bufferView!, ibSlice * byteStride, (accessorDef.count * byteStride) / elementBytes)

        // Integer parameters to IB/IBA are in array elements, not bytes.
        ib = new InterleavedBuffer(array, byteStride / elementBytes)

        cache.add(ibCacheKey, ib)
      }

      bufferAttribute = new InterleavedBufferAttribute(
        ib,
        itemSize,
        (byteOffset % byteStride) / elementBytes,
        normalized
      )
    } else {
      if (bufferView === null) {
        array = new TypedArray(accessorDef.count * itemSize)
      } else {
        array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize)
      }

      bufferAttribute = new BufferAttribute(array, itemSize, normalized)
    }

    // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
    if (accessorDef.sparse !== undefined) {
      const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR
      const TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType]

      const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0
      const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0

      const sparseIndices = new TypedArrayIndices(
        bufferViews[1]!,
        byteOffsetIndices,
        accessorDef.sparse.count * itemSizeIndices
      )
      const sparseValues = new TypedArray(bufferViews[2]!, byteOffsetValues, accessorDef.sparse.count * itemSize)

      if (bufferView !== null) {
        // Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
        bufferAttribute = new BufferAttribute(
          bufferAttribute.array.slice(),
          bufferAttribute.itemSize,
          bufferAttribute.normalized
        )
      }

      for (let i = 0, il = sparseIndices.length; i < il; i++) {
        const index = sparseIndices[i]

        bufferAttribute.setX(index, sparseValues[i * itemSize])
        if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1])
        if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2])
        if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3])
        if (itemSize >= 5) throw new Error('THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.')
      }
    }

    return bufferAttribute
  })
}

const loadBufferView = async (options: GLTFParserOptions, json: GLTF.IGLTF, bufferViewIndex: number) => {
  const bufferViewDef = json.bufferViews![bufferViewIndex]

  const buffer = await GLTFLoaderFunctions.loadBuffer(options, json, bufferViewDef.buffer)

  const byteLength = bufferViewDef.byteLength || 0
  const byteOffset = bufferViewDef.byteOffset || 0

  return buffer.slice(byteOffset, byteOffset + byteLength)
}

const loadBuffer = async (options: GLTFParserOptions, json: GLTF.IGLTF, bufferIndex: number) => {
  const bufferDef = json.buffers![bufferIndex]

  if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
    throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.')
  }

  // If present, GLB container is required to be the first buffer.
  if (bufferDef.uri === undefined && bufferIndex === 0) {
    return Promise.resolve(options.body!)
  }

  /** @todo use a global file loader */
  const fileLoader = new FileLoader(options.manager)
  fileLoader.setResponseType('arraybuffer')
  if (options.crossOrigin === 'use-credentials') {
    fileLoader.setWithCredentials(true)
  }

  return new Promise<ArrayBuffer>(function (resolve, reject) {
    fileLoader.load(LoaderUtils.resolveURL(bufferDef.uri!, options.path), resolve as any, undefined, function () {
      reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'))
    })
  })
}

export function computeBounds(json: GLTF.IGLTF, geometry: BufferGeometry, primitiveDef: GLTF.IMeshPrimitive) {
  const attributes = primitiveDef.attributes

  const box = new Box3()

  if (attributes.POSITION !== undefined) {
    const accessor = json.accessors![attributes.POSITION]

    const min = accessor.min
    const max = accessor.max

    // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

    if (min !== undefined && max !== undefined) {
      box.set(new Vector3(min[0], min[1], min[2]), new Vector3(max[0], max[1], max[2]))

      if (accessor.normalized) {
        const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType])
        box.min.multiplyScalar(boxScale)
        box.max.multiplyScalar(boxScale)
      }
    } else {
      console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.')

      return
    }
  } else {
    return
  }

  const targets = primitiveDef.targets

  if (targets !== undefined) {
    const maxDisplacement = new Vector3()
    const vector = new Vector3()

    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i]

      if (target.POSITION !== undefined) {
        const accessor = json.accessors![target.POSITION]
        const min = accessor.min
        const max = accessor.max

        // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

        if (min !== undefined && max !== undefined) {
          // we need to get max of absolute components because target weight is [-1,1]
          vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])))
          vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])))
          vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])))

          if (accessor.normalized) {
            const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType])
            vector.multiplyScalar(boxScale)
          }

          // Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
          // to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
          // are used to implement key-frame animations and as such only two are active at a time - this results in very large
          // boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
          maxDisplacement.max(vector)
        } else {
          console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.')
        }
      }
    }

    // As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
    box.expandByVector(maxDisplacement)
  }

  geometry.boundingBox = box

  const sphere = new Sphere()

  box.getCenter(sphere.center)
  sphere.radius = box.min.distanceTo(box.max) / 2

  geometry.boundingSphere = sphere
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
 * @param {number} materialIndex
 * @return {Promise<Material>}
 */
const loadMaterial = (options: GLTFParserOptions, json: GLTF.IGLTF, materialIndex: number) => {
  const materialDef = json.materials![materialIndex]

  let materialType
  const materialParams = {} as any // todo
  const materialExtensions = materialDef.extensions || {}

  const pending = [] as Array<Promise<any>>

  if (!materialExtensions[EXTENSIONS.EE_MATERIAL] && materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
    const kmuExtension = GLTFExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]
    materialType = kmuExtension.getMaterialType()
    pending.push(kmuExtension.extendParams(options, json, materialParams, materialDef))
  } else {
    // Specification:
    // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

    /** @todo move this to a base plugin */
    const metallicRoughness = materialDef.pbrMetallicRoughness || {}

    materialParams.color = new Color(1.0, 1.0, 1.0)
    materialParams.opacity = 1.0

    if (Array.isArray(metallicRoughness.baseColorFactor)) {
      const array = metallicRoughness.baseColorFactor

      materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace)
      materialParams.opacity = array[3]
    }

    if (metallicRoughness.baseColorTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(
          options,
          json,
          materialParams,
          'map',
          metallicRoughness.baseColorTexture,
          SRGBColorSpace
        )
      )
    }

    materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0
    materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0

    if (metallicRoughness.metallicRoughnessTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(
          options,
          json,
          materialParams,
          'metalnessMap',
          metallicRoughness.metallicRoughnessTexture
        )
      )
      pending.push(
        GLTFLoaderFunctions.assignTexture(
          options,
          json,
          materialParams,
          'roughnessMap',
          metallicRoughness.metallicRoughnessTexture
        )
      )
    }

    /** @todo expose 'getMaterialType' API */
    materialType = MeshStandardMaterial

    // materialType = this._invokeOne(function (ext) {
    //   return ext.getMaterialType && ext.getMaterialType(materialIndex)
    // })

    /** @todo expose API */
    // pending.push(
    //   Promise.all(
    //     this._invokeAll(function (ext) {
    //       return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams)
    //     })
    //   )
    // )
  }

  if (materialDef.doubleSided === true) {
    materialParams.side = DoubleSide
  }

  const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE

  if (alphaMode === ALPHA_MODES.BLEND) {
    materialParams.transparent = true

    // See: https://github.com/mrdoob/three.js/issues/17706
    if (materialParams.depthWrite === undefined) {
      materialParams.depthWrite = false
    }
  } else {
    materialParams.transparent = false

    if (alphaMode === ALPHA_MODES.MASK) {
      materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5
    }
  }

  if (materialDef.normalTexture !== undefined && materialType !== MeshBasicMaterial) {
    pending.push(
      GLTFLoaderFunctions.assignTexture(options, json, materialParams, 'normalMap', materialDef.normalTexture)
    )

    materialParams.normalScale = new Vector2(1, 1)

    if (materialDef.normalTexture.scale !== undefined) {
      const scale = materialDef.normalTexture.scale

      materialParams.normalScale.set(scale, scale)
    }
  }

  if (materialDef.occlusionTexture !== undefined && materialType !== MeshBasicMaterial) {
    pending.push(
      GLTFLoaderFunctions.assignTexture(options, json, materialParams, 'aoMap', materialDef.occlusionTexture)
    )

    if (materialDef.occlusionTexture.strength !== undefined) {
      materialParams.aoMapIntensity = materialDef.occlusionTexture.strength
    }
  }

  if (materialDef.emissiveFactor !== undefined && materialType !== MeshBasicMaterial) {
    const emissiveFactor = materialDef.emissiveFactor
    materialParams.emissive = new Color().setRGB(
      emissiveFactor[0],
      emissiveFactor[1],
      emissiveFactor[2],
      LinearSRGBColorSpace
    )
  }

  if (materialDef.emissiveTexture !== undefined && materialType !== MeshBasicMaterial) {
    pending.push(
      GLTFLoaderFunctions.assignTexture(
        options,
        json,
        materialParams,
        'emissiveMap',
        materialDef.emissiveTexture,
        SRGBColorSpace
      )
    )
  }

  return Promise.all(pending).then(function () {
    const material = new materialType(materialParams)

    if (materialDef.name) material.name = materialDef.name

    assignExtrasToUserData(material, materialDef)

    /** @todo */
    // parser.associations.set(material, { materials: materialIndex })

    if (materialDef.extensions) addUnknownExtensionsToUserData(GLTFExtensions, material, materialDef)

    return material
  })
}

/**
 * Asynchronously assigns a texture to the given material parameters.
 * @param {Object} materialParams
 * @param {string} mapName
 * @param {Object} mapDef
 * @return {Promise<Texture>}
 */
const assignTexture = (options: GLTFParserOptions, json: GLTF.IGLTF, materialParams, mapName, mapDef, colorSpace?) => {
  // eslint-disable-next-line @typescript-eslint/no-this-alias

  return GLTFLoaderFunctions.loadTexture(options, json, mapDef.index).then(function (texture) {
    if (!texture) return null

    if (mapDef.texCoord !== undefined && mapDef.texCoord > 0) {
      texture = texture.clone()
      texture.channel = mapDef.texCoord
    }

    if (GLTFExtensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
      const transform =
        mapDef.extensions !== undefined ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : undefined

      if (transform) {
        /** @todo */
        // const gltfReference = parser.associations.get(texture)
        // texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform)
        // parser.associations.set(texture, gltfReference)
      }
    }

    if (colorSpace !== undefined) {
      texture.colorSpace = colorSpace
    }

    materialParams[mapName] = texture

    return texture
  })
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
 * @param {number} textureIndex
 * @return {Promise<THREE.Texture|null>}
 */
const loadTexture = (options: GLTFParserOptions, json: GLTF.IGLTF, textureIndex: number) => {
  const textureDef = json.textures![textureIndex]
  const sourceIndex = textureDef.source!
  const sourceDef = json.images![sourceIndex]

  let isSafari = false
  let isFirefox = false
  let firefoxVersion = -1 as any // ???

  if (typeof navigator !== 'undefined') {
    isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) === true
    isFirefox = navigator.userAgent.indexOf('Firefox') > -1
    firefoxVersion = isFirefox ? navigator.userAgent.match(/Firefox\/([0-9]+)\./)![1] : -1
  }

  let textureLoader

  /** @todo make global loader */
  if (typeof createImageBitmap === 'undefined' || isSafari || (isFirefox && firefoxVersion < 98)) {
    textureLoader = new TextureLoader(options.manager)
  } else {
    textureLoader = new ImageBitmapLoader(options.manager)
  }

  textureLoader.setCrossOrigin(options.crossOrigin)
  textureLoader.setRequestHeader(options.requestHeader)

  let loader = textureLoader

  if (sourceDef.uri) {
    const handler = options.manager.getHandler(sourceDef.uri)
    if (handler !== null) loader = handler
  }

  return GLTFLoaderFunctions.loadTextureImage(options, json, textureIndex, sourceIndex, loader)
}

const textureCache = {} as any // todo

const loadTextureImage = (
  options: GLTFParserOptions,
  json: GLTF.IGLTF,
  textureIndex: number,
  sourceIndex: number,
  loader
) => {
  // eslint-disable-next-line @typescript-eslint/no-this-alias

  const textureDef = json.textures![textureIndex]
  const sourceDef = json.images![sourceIndex]

  const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ':' + textureDef.sampler

  if (textureCache[cacheKey]) {
    // See https://github.com/mrdoob/three.js/issues/21559.
    return textureCache[cacheKey]
  }

  const promise = GLTFLoaderFunctions.loadImageSource(options, json, sourceIndex, loader)
    .then(function (texture) {
      texture.flipY = false

      texture.name = textureDef.name || sourceDef.name || ''

      if (
        texture.name === '' &&
        typeof sourceDef.uri === 'string' &&
        sourceDef.uri.startsWith('data:image/') === false
      ) {
        texture.name = sourceDef.uri
      }

      const samplers = json.samplers || {}
      const sampler = samplers[textureDef.sampler!] || {}

      texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || LinearFilter
      texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || LinearMipmapLinearFilter
      texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || RepeatWrapping
      texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || RepeatWrapping

      /** @todo */
      // parser.associations.set(texture, { textures: textureIndex })

      return texture
    })
    .catch(function (error) {
      console.error('THREE.GLTFLoader: Error in texture onLoad for texture', sourceDef)
      console.error(error)
      throw error
      return null
    })

  textureCache[cacheKey] = promise

  return promise
}

const sourceCache = {} as any // todo

const loadImageSource = (
  options: GLTFParserOptions,
  json: GLTF.IGLTF,
  sourceIndex: number,
  loader: ImageLoader | ImageBitmapLoader
) => {
  // eslint-disable-next-line @typescript-eslint/no-this-alias

  if (sourceCache[sourceIndex] !== undefined) {
    return sourceCache[sourceIndex].then((texture) => texture.clone())
  }

  const sourceDef = json.images![sourceIndex]

  const URL = self.URL || self.webkitURL

  let sourceURI = sourceDef.uri || ('' as string | Promise<string>)
  let isObjectURL = false

  if (sourceDef.bufferView !== undefined) {
    // Load binary image data from bufferView, if provided.

    sourceURI = GLTFLoaderFunctions.loadBufferView(options, json, sourceDef.bufferView).then(function (bufferView) {
      isObjectURL = true
      const blob = new Blob([bufferView], { type: sourceDef.mimeType })
      sourceURI = URL.createObjectURL(blob)
      return sourceURI
    })
  } else if (sourceDef.uri === undefined) {
    throw new Error('THREE.GLTFLoader: Image ' + sourceIndex + ' is missing URI and bufferView')
  }

  const promise = Promise.resolve(sourceURI)
    .then(function (sourceURI) {
      return new Promise<any>(function (resolve, reject) {
        let onLoad = resolve

        if ((loader as ImageBitmapLoader).isImageBitmapLoader === true) {
          onLoad = function (imageBitmap) {
            const texture = new Texture(imageBitmap)
            texture.needsUpdate = true

            resolve(texture)
          }
        }

        loader.load(LoaderUtils.resolveURL(sourceURI, options.path), onLoad, undefined, reject)
      })
    })
    .then(function (texture: Texture) {
      // Clean up resources and configure Texture.

      if (isObjectURL === true) {
        URL.revokeObjectURL(sourceURI as string)
      } else {
        texture.userData.src = sourceURI
      }

      texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri)

      return texture
    })
    .catch(function (error) {
      console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI)
      throw error
    })

  sourceCache[sourceIndex] = promise
  return promise
}

export const GLTFLoaderFunctions = {
  loadAccessor,
  loadBufferView,
  loadBuffer,
  computeBounds,
  loadMaterial,
  assignTexture,
  loadTexture,
  loadImageSource,
  loadTextureImage
}
