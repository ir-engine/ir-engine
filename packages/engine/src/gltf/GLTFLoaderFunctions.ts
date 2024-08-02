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

import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { GLTF } from '@gltf-transform/core'
import { useEffect } from 'react'
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  FrontSide,
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

const useLoadAccessor = (options: GLTFParserOptions, json: GLTF.IGLTF, accessorIndex?: number) => {
  const result = useHookstate<BufferAttribute | null>(null)

  const accessorDef = typeof accessorIndex === 'number' ? json.accessors![accessorIndex] : null

  const bufferView = GLTFLoaderFunctions.useLoadBufferView(options, json, accessorDef?.bufferView)

  const sparseBufferViewIndices = GLTFLoaderFunctions.useLoadBufferView(
    options,
    json,
    accessorDef?.sparse?.indices?.bufferView
  )
  const sparseBufferViewValues = GLTFLoaderFunctions.useLoadBufferView(
    options,
    json,
    accessorDef?.sparse?.values?.bufferView
  )

  useEffect(() => {
    if (!accessorDef) return

    if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
      const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
      const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]
      const normalized = accessorDef.normalized === true

      const array = new TypedArray(accessorDef.count * itemSize)
      result.set(new BufferAttribute(array, itemSize, normalized))
      return
    }

    if (accessorDef.bufferView && !bufferView) return
    if (accessorDef.sparse && !sparseBufferViewIndices && !sparseBufferViewValues) return

    const bufferViews = accessorDef.bufferView ? [bufferView, null] : [sparseBufferViewIndices, sparseBufferViewValues]

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

    result.set(bufferAttribute)
  }, [bufferView, sparseBufferViewIndices, sparseBufferViewValues])

  return result.value
}

const useLoadBufferView = (options: GLTFParserOptions, json: GLTF.IGLTF, bufferViewIndex?: number) => {
  const result = useHookstate<ArrayBuffer | null>(null)

  const bufferViewDef = typeof bufferViewIndex === 'number' ? json.bufferViews![bufferViewIndex] : null
  const buffer = GLTFLoaderFunctions.useLoadBuffer(options, json, bufferViewDef?.buffer)

  useEffect(() => {
    if (!bufferViewDef || !buffer) return

    const byteLength = bufferViewDef.byteLength || 0
    const byteOffset = bufferViewDef.byteOffset || 0

    result.set(buffer.slice(byteOffset, byteOffset + byteLength))
  }, [buffer])

  return result.value
}

const useLoadBuffer = (options: GLTFParserOptions, json: GLTF.IGLTF, bufferIndex?: number) => {
  const result = useHookstate<ArrayBuffer | null>(null)

  const bufferDef = typeof bufferIndex === 'number' ? json.buffers![bufferIndex] : null

  useEffect(() => {
    if (!bufferDef) return

    if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
      console.warn('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.')
    }
  }, [bufferDef?.type])

  useEffect(() => {
    if (!bufferDef) return

    // If present, GLB container is required to be the first buffer.
    if (bufferDef.uri === undefined && bufferIndex === 0) {
      result.set(options.body!)
      return
    }

    /** @todo use a global file loader */
    const fileLoader = new FileLoader(options.manager)
    fileLoader.setResponseType('arraybuffer')
    if (options.crossOrigin === 'use-credentials') {
      fileLoader.setWithCredentials(true)
    }

    fileLoader.load(
      LoaderUtils.resolveURL(bufferDef.uri!, options.path),
      (val: ArrayBuffer) => {
        result.set(val)
      },
      undefined,
      function () {
        result.set(null)
        console.error(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'))
      }
    )
  }, [bufferDef?.uri])

  return result.value
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
const useLoadMaterial = (options: GLTFParserOptions, json: GLTF.IGLTF, materialIndex: number) => {
  const materialType = useHookstate<'standard' | 'basic'>('standard')

  const result = useHookstate(null as null | MeshStandardMaterial | MeshBasicMaterial)

  useEffect(() => {
    const materialTypeValue = materialType.get(NO_PROXY) === 'standard' ? MeshStandardMaterial : MeshBasicMaterial
    const material = new materialTypeValue()

    result.set(material)

    assignExtrasToUserData(material, materialDef)

    /** @todo */
    // parser.associations.set(material, { materials: materialIndex })

    if (materialDef.extensions) addUnknownExtensionsToUserData(GLTFExtensions, material, materialDef)

    result.set(material)
  }, [materialType])

  const material = result.get(NO_PROXY) as MeshStandardMaterial | MeshBasicMaterial

  const materialDef = json.materials![materialIndex]

  const materialExtensions = materialDef.extensions || {}

  /** @todo expose 'getMaterialType' API */

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
  // }

  // if (!materialExtensions[EXTENSIONS.EE_MATERIAL] && materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
  //   const kmuExtension = GLTFExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]
  //   materialType = kmuExtension.getMaterialType()
  //   pending.push(kmuExtension.extendParams(options, json, materialParams, materialDef))
  // } else {
  // Specification:
  // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

  const map = GLTFLoaderFunctions.useAssignTexture(options, json, materialDef.pbrMetallicRoughness?.baseColorTexture)

  useEffect(() => {
    if (!map) return
    map.colorSpace = SRGBColorSpace
    result.value?.setValues({ map })
    material.needsUpdate = true
  }, [map])

  useEffect(() => {
    if (Array.isArray(materialDef.pbrMetallicRoughness?.baseColorFactor)) {
      const array = materialDef.pbrMetallicRoughness.baseColorFactor
      result.value?.setValues({
        color: new Color().setRGB(array[0], array[1], array[2], LinearSRGBColorSpace),
        opacity: array[3]
      })
      material.needsUpdate = true
    }
  }, [materialDef.pbrMetallicRoughness?.baseColorFactor])

  useEffect(() => {
    result.value?.setValues({
      metalness:
        materialDef.pbrMetallicRoughness?.metallicFactor !== undefined
          ? materialDef.pbrMetallicRoughness.metallicFactor
          : 1.0
    })
    material.needsUpdate = true
  }, [materialDef.pbrMetallicRoughness?.metallicFactor])

  useEffect(() => {
    result.value?.setValues({
      roughness:
        materialDef.pbrMetallicRoughness?.roughnessFactor !== undefined
          ? materialDef.pbrMetallicRoughness.roughnessFactor
          : 1.0
    })
    material.needsUpdate = true
  }, [materialDef.pbrMetallicRoughness?.roughnessFactor])

  const metalnessMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    json,
    materialType.value === 'basic' ? undefined : materialDef.pbrMetallicRoughness?.metallicRoughnessTexture
  )

  useEffect(() => {
    if (!metalnessMap) return
    result.value?.setValues({ metalnessMap })
    material.needsUpdate = true
  }, [metalnessMap])

  const roughnessMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    json,
    materialType.value === 'basic' ? undefined : materialDef.pbrMetallicRoughness?.metallicRoughnessTexture
  )

  useEffect(() => {
    if (!roughnessMap) return
    result.value?.setValues({ roughnessMap })
    material.needsUpdate = true
  }, [roughnessMap])

  useEffect(() => {
    result.value?.setValues({ side: materialDef.doubleSided === true ? DoubleSide : FrontSide })
    material.needsUpdate = true
  }, [materialDef.doubleSided])

  useEffect(() => {
    const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE
    result.value?.setValues({ transparent: alphaMode !== ALPHA_MODES.OPAQUE })

    // See: https://github.com/mrdoob/three.js/issues/17706
    if (alphaMode !== ALPHA_MODES.OPAQUE) {
      result.value?.setValues({ depthWrite: false })
    }
    material.needsUpdate = true
  }, [materialDef.alphaMode])

  useEffect(() => {
    if (materialDef.alphaMode === ALPHA_MODES.MASK) {
      result.value?.setValues({ alphaTest: materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5 })
    } else {
      result.value?.setValues({ alphaTest: 0 })
    }
    material.needsUpdate = true
  }, [materialDef.alphaCutoff])

  const normalMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    json,
    materialType.value === 'basic' ? undefined : materialDef.normalTexture
  )

  useEffect(() => {
    if (!normalMap) return
    result.value?.setValues({ normalMap })
    material.needsUpdate = true
  }, [normalMap])

  // useEffect(() => {
  // materialParams.normalScale = new Vector2(1, 1)

  // if (materialDef.normalTexture.scale !== undefined) {
  //   const scale = materialDef.normalTexture.scale

  //   materialParams.normalScale.set(scale, scale)
  // }
  // }, [])

  const aoMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    json,
    materialType.value === 'basic' ? undefined : materialDef.occlusionTexture
  )

  useEffect(() => {
    if (!aoMap) return
    result.value?.setValues({ aoMap })
    material.needsUpdate = true
  }, [aoMap])

  useEffect(() => {
    result.value?.setValues({ aoMapIntensity: materialDef.occlusionTexture?.strength ?? 1.0 })
    material.needsUpdate = true
  }, [materialDef.occlusionTexture?.strength])

  useEffect(() => {
    const emissiveFactor = materialDef.emissiveFactor
    if (!emissiveFactor) return

    result.value?.setValues({
      emissive: new Color().setRGB(emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], LinearSRGBColorSpace)
    })
    material.needsUpdate = true
  }, [materialDef.emissiveFactor])

  const emissiveMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    json,
    materialType.value === 'basic' ? undefined : materialDef.emissiveTexture
  )

  useEffect(() => {
    if (!emissiveMap) return
    emissiveMap.colorSpace = SRGBColorSpace
    result.value?.setValues({ emissiveMap })
    material.needsUpdate = true
  }, [emissiveMap])

  return result.value as MeshStandardMaterial | null
}

/**
 * Asynchronously assigns a texture to the given material parameters.
 * @param {Object} materialParams
 * @param {string} mapName
 * @param {Object} mapDef
 * @return {Promise<Texture>}
 */
const useAssignTexture = (options: GLTFParserOptions, json: GLTF.IGLTF, mapDef?: GLTF.ITextureInfo) => {
  const result = useHookstate<Texture | null>(null)

  const texture = GLTFLoaderFunctions.useLoadTexture(options, json, mapDef?.index)

  useEffect(() => {
    if (!texture) {
      result.set(null)
      return
    }

    if (!mapDef) return

    if (mapDef.texCoord !== undefined && mapDef.texCoord > 0) {
      const textureClone = texture.clone()
      textureClone.channel = mapDef.texCoord
      result.set(textureClone)
    }

    result.set(texture)

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
  }, [texture, mapDef])

  return result.value as Texture | null
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
 * @param {number} textureIndex
 * @return {Promise<THREE.Texture|null>}
 */
const useLoadTexture = (options: GLTFParserOptions, json: GLTF.IGLTF, textureIndex?: number) => {
  const result = useHookstate<Texture | null>(null)

  const textureDef = typeof textureIndex === 'number' ? json.textures![textureIndex] : null
  const sourceIndex = textureDef?.source!
  const sourceDef = typeof sourceIndex === 'number' ? json.images![sourceIndex] : null

  const textureLoader = useHookstate(() => {
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

    return textureLoader
  })

  /** @todo clean all this up */

  textureLoader.value.setCrossOrigin(options.crossOrigin)
  textureLoader.value.setRequestHeader(options.requestHeader)

  let loader = textureLoader.value

  if (sourceDef?.uri) {
    const handler = options.manager.getHandler(sourceDef.uri)
    if (handler !== null) loader = handler
  }

  const texture = GLTFLoaderFunctions.useLoadTextureImage(options, json, textureIndex, sourceIndex, loader)
  useEffect(() => {
    result.set(texture)
  }, [texture])

  return result.value as Texture | null
}

const textureCache = {} as any // todo

const useLoadTextureImage = (
  options: GLTFParserOptions,
  json: GLTF.IGLTF,
  textureIndex?: number,
  sourceIndex?: number,
  loader?: ImageLoader | ImageBitmapLoader
) => {
  const result = useHookstate<Texture | null>(null)

  const textureDef = typeof textureIndex === 'number' ? json.textures![textureIndex] : null
  const sourceDef = typeof sourceIndex === 'number' ? json.images![sourceIndex] : null

  /** @todo cache */
  // const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ':' + textureDef.sampler

  // if (textureCache[cacheKey]) {
  //   // See https://github.com/mrdoob/three.js/issues/21559.
  //   return textureCache[cacheKey]
  // }

  const texture = GLTFLoaderFunctions.useLoadImageSource(options, json, sourceIndex, loader)

  useEffect(() => {
    if (!texture || !sourceDef || !textureDef) return

    texture.flipY = false

    texture.name = textureDef.name || sourceDef.name || ''

    if (texture.name === '' && typeof sourceDef.uri === 'string' && sourceDef.uri.startsWith('data:image/') === false) {
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

    result.set(texture)
  }, [textureDef, sourceDef, texture])

  // textureCache[cacheKey] = promise

  return result.value as Texture | null
}

// const sourceCache = {} as any // todo

const URL = self.URL || self.webkitURL

const useLoadImageSource = (
  options: GLTFParserOptions,
  json: GLTF.IGLTF,
  sourceIndex?: number,
  loader?: ImageLoader | ImageBitmapLoader
) => {
  const result = useHookstate<Texture | null>(null)

  /** @todo caching */
  // if (sourceCache[sourceIndex] !== undefined) {
  //   return sourceCache[sourceIndex].then((texture) => texture.clone())
  // }

  const sourceDef = typeof sourceIndex === 'number' ? json.images![sourceIndex] : null

  const sourceURI = useHookstate(null as null | string)
  let isObjectURL = false

  const bufferViewSourceURI = GLTFLoaderFunctions.useLoadBufferView(options, json, sourceDef?.bufferView)

  useEffect(() => {
    if (!sourceDef) return

    if (sourceDef.uri === undefined && sourceDef.bufferView === undefined) {
      console.error('THREE.GLTFLoader: Image ' + sourceIndex + ' is missing URI and bufferView')
      return
    }

    if (sourceDef.uri) {
      const url = LoaderUtils.resolveURL(sourceDef.uri, options.path)
      sourceURI.set(url)
      return () => {
        sourceURI.set(null)
      }
    }

    if (bufferViewSourceURI) {
      isObjectURL = true
      const blob = new Blob([bufferViewSourceURI], { type: sourceDef.mimeType })
      const url = URL.createObjectURL(blob)
      sourceURI.set(url)
      return () => {
        URL.revokeObjectURL(url)
        sourceURI.set(null)
      }
    }
  }, [sourceDef?.uri, bufferViewSourceURI])

  useEffect(() => {
    if (!sourceURI.value) return
    loader!.load(
      LoaderUtils.resolveURL(sourceURI.value as string, options.path),
      (imageBitmap) => {
        if ((loader as ImageBitmapLoader).isImageBitmapLoader === true) {
          const texture = new Texture(imageBitmap)
          texture.needsUpdate = true
          result.set(texture)
        } else {
          result.set(imageBitmap)
        }
      },
      undefined,
      (e) => {
        console.error(e)
        console.error("THREE.GLTFLoader: Couldn't load image", sourceURI.value)
      }
    )
  }, [sourceURI.value])

  useEffect(() => {
    if (!result.value || !sourceURI.value || !sourceDef) return

    const texture = result.value as Texture

    // Clean up resources and configure Texture.

    if (isObjectURL === true) {
      URL.revokeObjectURL(sourceURI.value!)
    } else {
      texture.userData.src = sourceURI
    }

    texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri)

    // sourceCache[sourceIndex] = promise
  }, [result.value])

  return result.value as Texture | null
}

export const GLTFLoaderFunctions = {
  computeBounds,
  useLoadAccessor,
  useLoadBufferView,
  useLoadBuffer,
  useLoadMaterial,
  useAssignTexture,
  useLoadTexture,
  useLoadImageSource,
  useLoadTextureImage
}
