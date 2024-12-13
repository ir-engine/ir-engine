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
  ComponentJSONIDMap,
  ComponentType,
  Entity,
  EntityUUID,
  LayerComponent,
  UUIDComponent,
  UndefinedEntity,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs'
import { NO_PROXY, getState, isClient, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { proxifyParentChildRelationships } from '@ir-engine/spatial/src/renderer/functions/proxifyParentChildRelationships'
import {
  MaterialInstanceComponent,
  MaterialPrototypeComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { ResourceManager, ResourceType } from '@ir-engine/spatial/src/resources/ResourceState'
import { EntityTreeComponent, traverseEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import {
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  ColorManagement,
  DoubleSide,
  FrontSide,
  ImageBitmapLoader,
  ImageLoader,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  InterpolateLinear,
  KeyframeTrack,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearSRGBColorSpace,
  LoaderUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NumberKeyframeTrack,
  Object3D,
  Quaternion,
  QuaternionKeyframeTrack,
  RepeatWrapping,
  SRGBColorSpace,
  Skeleton,
  SkinnedMesh,
  Sphere,
  Texture,
  Vector2,
  Vector3,
  VectorKeyframeTrack
} from 'three'
import { useFile, useTexture } from '../assets/functions/resourceLoaderHooks'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import { Loader } from '../assets/loaders/base/Loader'
import {
  ALPHA_MODES,
  ATTRIBUTES,
  INTERPOLATION,
  PATH_PROPERTIES,
  WEBGL_COMPONENT_TYPES,
  WEBGL_FILTERS,
  WEBGL_TYPE_SIZES,
  WEBGL_WRAPPINGS
} from '../assets/loaders/gltf/GLTFConstants'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import {
  GLTFCubicSplineInterpolant,
  GLTFCubicSplineQuaternionInterpolant,
  assignExtrasToUserData,
  getNormalizedComponentScale
} from '../assets/loaders/gltf/GLTFLoaderFunctions'
import { GLTFParserOptions, GLTFRegistry, getImageURIMimeType } from '../assets/loaders/gltf/GLTFParser'
import { KTX2Loader } from '../assets/loaders/gltf/KTX2Loader'
import { TextureLoader } from '../assets/loaders/texture/TextureLoader'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFComponent } from './GLTFComponent'
import { KHR_DRACO_MESH_COMPRESSION, getBufferIndex } from './GLTFExtensions'
import { defaultMaterial } from './GLTFState'
import { KHRTextureTransformExtensionComponent, MaterialDefinitionComponent } from './MaterialDefinitionComponent'

// todo make this a state
const cache = new GLTFRegistry()

const loadPrimitives = async (options: GLTFParserOptions, meshIndex: number) => {
  // const finalGeometry = useHookstate(null as BufferGeometry | null)
  let finalGeometry: BufferGeometry | null = null
  const json = options.document
  const mesh = json.meshes![meshIndex]

  const geometries = await Promise.all(
    mesh.primitives.map((primitive, index) => GLTFLoaderFunctions.useLoadPrimitive(options, meshIndex, index)!)
  )

  // useEffect(() => {
  // if (geometries.some((geometry) => !geometry) || finalGeometry.value) return

  if (geometries.length > 1) {
    let needsTangentRecalculation = false
    for (let i = 0; i < geometries.length; i++) {
      geometries[i]?.deleteAttribute('tangent')
      if (geometries[i]?.attributes.tangent) needsTangentRecalculation = true
    }

    const newGeometry = mergeBufferGeometries(geometries, true)
    if (needsTangentRecalculation) newGeometry?.computeTangents()

    for (let i = 0; i < mesh.primitives.length; i++) newGeometry!.groups[i].materialIndex = mesh.primitives[i].material!

    finalGeometry = newGeometry
    // finalGeometry.set(newGeometry)
  } else {
    finalGeometry = geometries[0]
    // finalGeometry.set(geometries[0])
  }
  // }, [geometries])

  // return finalGeometry.get(NO_PROXY) as BufferGeometry | null
  return finalGeometry
}

const loadPrimitive = (options: GLTFParserOptions, meshIndex: number, primitiveIndex: number) => {
  // const [result] = useReferencedResource(() => null as null | BufferGeometry, options.url)
  return new Promise<BufferGeometry>((resolve, reject) => {
    const json = options.document
    const mesh = json.meshes![meshIndex]

    const primitive = mesh.primitives[primitiveIndex]

    const hasDracoCompression = primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]

    if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && 'COLOR_0' in primitive.attributes) {
      console.warn(
        `THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`
      )
    }

    if (hasDracoCompression) {
      KHR_DRACO_MESH_COMPRESSION.decodePrimitive(options, primitive).then((geom) => {
        GLTFLoaderFunctions.computeBounds(json, geom, primitive)
        assignExtrasToUserData(geom, primitive as GLTF.IMeshPrimitive)
        resolve(geom)
      })
    } else {
      const geometry = new BufferGeometry()

      /** @todo we need to figure out a better way of handling reactivity for both draco and regular buffers */

      const attributes = primitive.attributes
      // const resourcesState = useHookstate(
      //   () =>
      //     ({
      //       ...Object.fromEntries(Object.keys(attributes).map((key) => [key, false])),
      //       index: false
      //     }) as Record<string, boolean>
      // )

      for (const attributeName of Object.keys(attributes)) {
        const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()
        const attribute = primitive.attributes[attributeName]
        const accessor = GLTFLoaderFunctions.useLoadAccessor(options, attribute)
        // useEffect(() => {
        //   if (!accessor) return
        if (accessor) {
          geometry.setAttribute(threeAttributeName, accessor)
        }
        //   resourcesState[attributeName].set(true)
        // }, [accessor])
      }

      const accessor = GLTFLoaderFunctions.useLoadAccessor(options, primitive.indices!)

      // useEffect(() => {
      //   if (!accessor) return
      if (accessor) {
        geometry.setIndex(accessor)
      }
      //   resourcesState.index.set(true)
      // }, [accessor])

      // useEffect(() => {
      //const attributeCount = Object.keys(attributes).length
      // const resourcesLoaded = Object.values(resourcesState.get(NO_PROXY)).filter(Boolean).length
      // if (resourcesLoaded !== attributeCount + (typeof primitive.indices === 'number' ? 1 : 0)) return

      GLTFLoaderFunctions.computeBounds(json, geometry, primitive)
      assignExtrasToUserData(geometry, primitive as GLTF.IMeshPrimitive)
      // result = geometry
      resolve(geometry)
      // reactor.stop()
      // }, [resourcesState])

      // return () => {
      //   reactor.stop()
      // }
    }
  })
}

const loadAccessor = (options: GLTFParserOptions, accessorIndex?: number) => {
  const json = options.document

  let result: BufferAttribute | null = null

  const accessorDef = typeof accessorIndex === 'number' ? json.accessors![accessorIndex] : null

  const gltfComponent = getComponent(options.entity, GLTFComponent)
  const hasBufferView = accessorDef?.bufferView !== undefined
  const bufferView = hasBufferView ? gltfComponent.bufferViews[accessorDef.bufferView!] : null

  // const sparseBufferViewIndices = GLTFLoaderFunctions.useLoadBufferView(
  //   options,
  //   accessorDef?.sparse?.indices?.bufferView
  // )
  const sparseBufferViewIndices = accessorDef?.sparse?.indices?.bufferView
    ? gltfComponent.bufferViews[accessorDef.sparse.indices.bufferView]
    : null

  const sparseBufferViewValues = accessorDef?.sparse?.values?.bufferView
    ? gltfComponent.bufferViews[accessorDef.sparse.values.bufferView]
    : null

  // useEffect(() => {
  //   if (!accessorDef || !bufferView) return
  if (!accessorDef || !bufferView) return null
  if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
    const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
    const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]
    const normalized = accessorDef.normalized === true

    const array = new TypedArray(accessorDef.count * itemSize)
    result = new BufferAttribute(array, itemSize, normalized)
    return
  }

  if (typeof accessorDef.bufferView === 'number' && !bufferView) return
  if (accessorDef.sparse && !sparseBufferViewIndices && !sparseBufferViewValues) return

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

    bufferAttribute = new InterleavedBufferAttribute(ib, itemSize, (byteOffset % byteStride) / elementBytes, normalized)
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
      sparseBufferViewIndices!,
      byteOffsetIndices,
      accessorDef.sparse.count * itemSizeIndices
    )
    const sparseValues = new TypedArray(sparseBufferViewValues!, byteOffsetValues, accessorDef.sparse.count * itemSize)

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

  result = bufferAttribute
  // }, [bufferView, sparseBufferViewIndices, sparseBufferViewValues])

  return result
}

const useLoadBufferView = (options: GLTFParserOptions, bufferViewIndex?: number) => {
  const result = useHookstate<ArrayBuffer | null>(null)

  const [bufferIndex, callback] = getBufferIndex(options, bufferViewIndex)

  const buffer = GLTFLoaderFunctions.useLoadBuffer(options, bufferIndex)

  useEffect(() => {
    if (!buffer) return result.set(null)
    callback(buffer).then((buffer) => result.set(buffer))
  }, [buffer])

  return result.get(NO_PROXY) as ArrayBuffer | null
}

const useLoadBuffer = (options: GLTFParserOptions, bufferIndex) => {
  const json = options.document
  const loader = useHookstate(() => {
    const fileLoader = new FileLoader(options.manager)
    fileLoader.setResponseType('arraybuffer')
    return fileLoader
  })

  const bufferDef = typeof bufferIndex === 'number' ? json.buffers![bufferIndex] : null
  const [result] = useFile(
    bufferDef?.uri ? LoaderUtils.resolveURL(bufferDef.uri, options.path) : '',
    UndefinedEntity,
    () => {},
    loader.value
  )

  useEffect(() => {
    if (!bufferDef) return

    if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
      console.warn('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.')
    }
  }, [bufferDef?.type])

  // if (bufferDef && bufferDef.uri === undefined) {
  //   return options.body
  //   let startByte = 0
  //   for(let prevIndex = 0; prevIndex < bufferIndex; prevIndex++) {
  //     startByte += json.buffers![prevIndex].byteLength
  //   }
  //   const thisBuffer = options.body?.slice(startByte, startByte + bufferDef.byteLength)
  //   return thisBuffer
  // } else return result
  // if (bufferDef && bufferDef.uri === undefined && bufferIndex !== 0) return new ArrayBuffer(0)
  return bufferDef && bufferDef.uri === undefined && bufferIndex === 0 ? options.body : result
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
const loadMaterial = (options: GLTFParserOptions, materialDef: ComponentType<typeof MaterialDefinitionComponent>) => {
  // const [result] = useReferencedResource(() => null as null | MeshStandardMaterial | MeshBasicMaterial, options.url)
  let result = null as null | MeshStandardMaterial | MeshBasicMaterial
  // useEffect(() => {
  /** @todo refactor this into a proper registry, rather than prototype definition entities */
  const materialPrototypeEntity = NameComponent.entitiesByName[materialDef.type]?.[0]
  const materialPrototype = materialPrototypeEntity
    ? (getComponent(materialPrototypeEntity, MaterialPrototypeComponent).prototypeConstructor as any)[materialDef.type]
    : null
  const materialConstructor = materialPrototype ?? MeshStandardMaterial
  const newMaterial = new materialConstructor()
  assignExtrasToUserData(newMaterial, materialDef)

  /** @todo */
  // parser.associations.set(material, { materials: materialIndex })

  // if (materialDef.extensions) addUnknownExtensionsToUserData(GLTFExtensions, material, materialDef)

  result = newMaterial
  // }, [materialDef.type])

  const material = result //.get(NO_PROXY) as null | MeshStandardMaterial | MeshBasicMaterial
  const map = GLTFLoaderFunctions.useAssignTexture(options, materialDef.pbrMetallicRoughness?.baseColorTexture)

  // useEffect(() => {
  // if (!map) return
  if (map) {
    map.colorSpace = SRGBColorSpace
    material?.setValues({ map })
    // if (material) material.needsUpdate = true
  }

  // }, [material, map])

  // useEffect(() => {
  if (Array.isArray(materialDef.pbrMetallicRoughness?.baseColorFactor)) {
    const array = materialDef.pbrMetallicRoughness.baseColorFactor
    material?.setValues({
      color: new Color().setRGB(array[0], array[1], array[2], LinearSRGBColorSpace),
      opacity: array[3]
    })
    if (material) material.needsUpdate = true
  }
  // }, [material, materialDef.pbrMetallicRoughness?.baseColorFactor])

  // useEffect(() => {
  material?.setValues({
    metalness:
      materialDef.pbrMetallicRoughness?.metallicFactor !== undefined
        ? materialDef.pbrMetallicRoughness.metallicFactor
        : 1.0
  })
  if (material) material.needsUpdate = true
  // }, [material, materialDef.pbrMetallicRoughness?.metallicFactor])

  // useEffect(() => {
  material?.setValues({
    roughness:
      materialDef.pbrMetallicRoughness?.roughnessFactor !== undefined
        ? materialDef.pbrMetallicRoughness.roughnessFactor
        : 1.0
  })
  if (material) material.needsUpdate = true
  // }, [material, materialDef.pbrMetallicRoughness?.roughnessFactor])

  const metalnessMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    materialDef.type === 'MeshBasicMaterial' ? undefined : materialDef.pbrMetallicRoughness?.metallicRoughnessTexture
  )

  // useEffect(() => {
  // if (!metalnessMap) return
  if (metalnessMap) {
    material?.setValues({ metalnessMap })
    if (material) material.needsUpdate = true
  }
  // }, [material, metalnessMap])

  const roughnessMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    materialDef.type === 'MeshBasicMaterial' ? undefined : materialDef.pbrMetallicRoughness?.metallicRoughnessTexture
  )

  // useEffect(() => {
  // if (!roughnessMap) return
  if (roughnessMap) {
    material?.setValues({ roughnessMap })
    if (material) material.needsUpdate = true
  }
  // material?.setValues({ roughnessMap })
  // if (material) material.needsUpdate = true
  // }, [material, roughnessMap])

  // useEffect(() => {
  material?.setValues({ side: materialDef.doubleSided === true ? DoubleSide : FrontSide })
  if (material) material.needsUpdate = true
  // }, [material, materialDef.doubleSided])

  // useEffect(() => {
  const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE
  material?.setValues({ transparent: alphaMode === ALPHA_MODES.BLEND })

  // See: https://github.com/mrdoob/three.js/issues/17706
  if (alphaMode === ALPHA_MODES.BLEND) {
    material?.setValues({ depthWrite: false })
  }
  if (material) material.needsUpdate = true
  // }, [material, materialDef.alphaMode])

  // useEffect(() => {
  if (materialDef.alphaMode === ALPHA_MODES.MASK) {
    material?.setValues({ alphaTest: typeof materialDef.alphaCutoff === 'number' ? materialDef.alphaCutoff : 0.5 })
  } else {
    material?.setValues({ alphaTest: 0 })
  }
  if (material) material.needsUpdate = true
  // }, [material, materialDef.alphaMode, materialDef.alphaCutoff])

  const normalMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    materialDef.type === 'MeshBasicMaterial' ? undefined : materialDef.normalTexture
  )

  // useEffect(() => {
  // if (!normalMap) return
  if (normalMap) {
    material?.setValues({ normalMap })
    if (material) material.needsUpdate = true
  }
  // }, [material, normalMap])

  // useEffect(() => {
  if (materialDef.normalTexture?.scale) {
    const scale = materialDef.normalTexture.scale
    material?.setValues({ normalScale: new Vector2(scale, scale) })
  } else {
    material?.setValues({ normalScale: new Vector2(1, 1) })
  }
  if (material) material.needsUpdate = true
  // }, [material, materialDef.normalTexture?.scale])

  const aoMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    materialDef.type === 'MeshBasicMaterial' ? undefined : materialDef.occlusionTexture
  )

  // useEffect(() => {
  // if (!aoMap) return
  if (aoMap) {
    material?.setValues({ aoMap })
    if (material) material.needsUpdate = true
  }
  // }, [material, aoMap])

  // useEffect(() => {
  material?.setValues({ aoMapIntensity: materialDef.occlusionTexture?.strength ?? 1.0 })
  if (material) material.needsUpdate = true
  // }, [material, materialDef.occlusionTexture?.strength])

  // useEffect(() => {
  const emissiveFactor = materialDef.emissiveFactor
  // if (!emissiveFactor) return
  if (emissiveFactor) {
    material?.setValues({
      emissive: new Color().setRGB(emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], LinearSRGBColorSpace)
    })
    if (material) material.needsUpdate = true
  }
  // }, [material, materialDef.emissiveFactor])

  const emissiveMap = GLTFLoaderFunctions.useAssignTexture(
    options,
    materialDef.type === 'MeshBasicMaterial' ? undefined : materialDef.emissiveTexture
  )

  // useEffect(() => {
  // if (!emissiveMap) return
  if (emissiveMap) {
    emissiveMap.colorSpace = SRGBColorSpace
    // result.value?.setValues({ emissiveMap })
    material?.setValues({ emissiveMap })
    if (material) material.needsUpdate = true
  }
  // }, [material, emissiveMap])

  // return result.get(NO_PROXY) as MeshStandardMaterial | null
  return result
}

const mergeMorphTargets = (options: GLTFParserOptions, nodeIndex: number) => {
  const json = options.document
  const node = json.nodes![nodeIndex]!
  const mesh = json.meshes![node.mesh!]

  const morphTargets = [] as (Record<string, BufferAttribute[]> | null)[]
  let loadedMorphTargets = null! as Record<string, BufferAttribute[]> | null

  mesh.primitives.map((primitive) => {
    if (primitive.targets) morphTargets.push(GLTFLoaderFunctions.useLoadMorphTargets(options, primitive.targets as any))
  })

  // useEffect(() => {
  // if (morphTargets.some((geometry) => !geometry) || loadedMorphTargets.value) return
  const morphAttributes = {} as Record<string, BufferAttribute[]>
  for (const morphTarget of morphTargets) {
    for (const name in morphTarget) {
      if (!morphAttributes[name]) morphAttributes[name] = []
      morphTarget[name].forEach((target) => morphAttributes[name].push(target))
    }
  }
  loadedMorphTargets = morphTargets[0]
  for (const name in morphAttributes) {
    const newAttributesLength = morphAttributes[name].length / morphTargets.length
    for (let j = newAttributesLength; j < morphAttributes[name].length; j++) {
      const mergeIntoIndex = j % newAttributesLength
      // console.log(j + ' goes into ' + mergeIntoIndex)
      const newArray = new Float32Array(
        morphAttributes[name][j].array.length + morphAttributes[name][mergeIntoIndex].array.length
      )
      newArray.set([...morphAttributes[name][mergeIntoIndex].array, ...morphAttributes[name][j].array])
      morphAttributes[name][mergeIntoIndex].array = newArray
      const newAttribute = new BufferAttribute(
        morphAttributes[name][mergeIntoIndex].array,
        morphAttributes[name][mergeIntoIndex].itemSize
      )
      loadedMorphTargets![name][mergeIntoIndex] = newAttribute
    }
  }
  // }, [morphTargets])

  return loadedMorphTargets as Record<string, BufferAttribute[]> | null
}

const loadMorphTargets = (options: GLTFParserOptions, targetsList: Record<string, number>[]) => {
  // const result = useHookstate(null as null | Record<string, BufferAttribute[]>)
  let result = null as Record<string, BufferAttribute[]> | null

  // useEffect(() => {
  /** @todo make individual targets individually reactive */
  // const reactor = startReactor(() => {
  // const targetState = useHookstate(
  //   () =>
  //     targetsList.map((target) => Object.fromEntries(Object.entries(target).map(([key]) => [key, null]))) as Record<
  //       string,
  //       BufferAttribute | null
  //     >[]
  // )
  const targetState = targetsList.map((target) =>
    Object.fromEntries(Object.entries(target).map(([key]) => [key, null]))
  ) as Record<string, BufferAttribute | null>[]

  for (let i = 0, il = targetsList.length; i < il; i++) {
    const target = targetsList[i]
    for (const [key, accessorIndex] of Object.entries(target)) {
      const accessor = GLTFLoaderFunctions.useLoadAccessor(options, accessorIndex)
      if (!accessor) continue
      targetState[i][key] = accessor
    }
  }

  // useEffect(() => {
  //   for (const target of targetState.value) {
  //     if (Object.values(target).includes(null)) return
  //   }
  result = targetState.reduce(
    (acc, target: Record<string, BufferAttribute>) => {
      for (const [key, value] of Object.entries(target)) {
        if (!acc[key]) acc[key] = []
        acc[key].push(value)
      }
      return acc
    },
    {} as Record<string, BufferAttribute[]>
  )

  // reactor.stop()
  // }, [targetState])

  //   return null
  // })
  // return () => {
  //   reactor.stop()
  // }
  // }, [targetsList])

  return result
}

/**
 * Asynchronously assigns a texture to the given material parameters.
 * @param {Object} materialParams
 * @param {string} mapName
 * @param {Object} mapDef
 * @return {Promise<Texture>}
 */
const assignTexture = (options: GLTFParserOptions, mapDef?: GLTF.ITextureInfo) => {
  // const result = useHookstate<Texture | null>(null)
  let result = null as Texture | null

  const texture = GLTFLoaderFunctions.useLoadTexture(options, mapDef?.index)
  if (!texture) return null
  // useEffect(() => {
  // if (!texture) {
  //   result.set(null)
  //   result = null
  //   return
  // }

  // if (!mapDef) return

  if (mapDef?.texCoord !== undefined && mapDef.texCoord > 0) {
    texture.channel = mapDef.texCoord
  }

  /** @todo properly support extensions */
  const transform =
    mapDef?.extensions !== undefined ? mapDef.extensions[KHRTextureTransformExtensionComponent.jsonID] : undefined

  if (transform) {
    // const gltfReference = parser.associations.get(texture)
    const extendedTexture = KHRTextureTransformExtensionComponent.extendTexture(texture, transform)
    // parser.associations.set(texture, gltfReference)
    // result.set(extendedTexture)
    result = extendedTexture
  } else {
    // result.set(texture)
    result = texture
  }
  // }, [texture, mapDef])

  // return result.get(NO_PROXY) as Texture | null
  return result as Texture | null
}

const textureLoader = new TextureLoader(undefined, true)

type KHRTextureBasisu = {
  source: number
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
 * @param {number} textureIndex
 * @return {Promise<THREE.Texture|null>}
 */
const loadTexture = (options: GLTFParserOptions, textureIndex?: number) => {
  const json = options.document

  const textureDef = typeof textureIndex === 'number' ? json.textures![textureIndex] : null

  const extensions = textureDef?.extensions as Record<string, Record<string, number>> | null
  const basisu = extensions && (extensions[EXTENSIONS.KHR_TEXTURE_BASISU] as KHRTextureBasisu)

  /** @todo properly support texture extensions, this is a hack */
  const sourceIndex =
    (extensions && Object.values(extensions).find((ext) => typeof ext.source === 'number')?.source) ??
    textureDef?.source
  const sourceDef = typeof sourceIndex === 'number' ? json.images![sourceIndex] : null

  const handler = typeof sourceDef?.uri === 'string' && options.manager.getHandler(sourceDef.uri)
  let loader: ImageLoader | ImageBitmapLoader | TextureLoader | KTX2Loader | Loader<unknown, string>

  if (handler) loader = handler as Loader<unknown, string>
  if (basisu) loader = getState(AssetLoaderState).gltfLoader.ktx2Loader!
  else {
    loader = textureLoader
    loader.setRequestHeader(options.requestHeader)
  }

  const texture = GLTFLoaderFunctions.useLoadTextureImage(options, textureIndex, sourceIndex, loader)

  return texture
}

const loadTextureImage = (
  options: GLTFParserOptions,
  textureIndex?: number,
  sourceIndex?: number,
  loader?: ImageLoader | ImageBitmapLoader | TextureLoader | KTX2Loader | Loader
) => {
  const json = options.document
  // const result = useHookstate<Texture | null>(null)

  let result = null as Texture | null

  const gltfComponent = getComponent(options.entity, GLTFComponent)

  const textureDef = typeof textureIndex === 'number' ? json.textures![textureIndex] : null
  const sourceDef = typeof sourceIndex === 'number' ? json.images![sourceIndex] : null

  /** @todo cache */
  // const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ':' + textureDef.sampler

  // if (textureCache[cacheKey]) {
  //   // See https://github.com/mrdoob/three.js/issues/21559.
  //   return textureCache[cacheKey]
  // }

  // const texture = GLTFLoaderFunctions.useLoadImageSource(options, sourceIndex, loader)

  const texture = typeof sourceIndex === 'number' ? (gltfComponent.images[sourceIndex] as Texture | null) : null

  // useEffect(() => {
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

  result = texture
  // result.set(texture)
  // }, [textureDef, sourceDef, texture])

  // textureCache[cacheKey] = promise

  return result //result.get(NO_PROXY) as Texture | null
}

// const sourceCache = {} as any // todo

const URL = self.URL || self.webkitURL

const useLoadImageSource = (
  options: GLTFParserOptions,
  sourceIndex?: number,
  loader?: ImageLoader | ImageBitmapLoader | TextureLoader | KTX2Loader | Loader
) => {
  const json = options.document
  const sourceDef = typeof sourceIndex === 'number' ? json.images![sourceIndex] : null

  const sourceURI = useHookstate('')
  const result = useHookstate<Texture | null>(null)
  const [loadedTexture, error] = useTexture(sourceURI.value, UndefinedEntity, () => {}, loader)
  let isObjectURL = false

  const bufferViewSourceURI = GLTFLoaderFunctions.useLoadBufferView(options, sourceDef?.bufferView)

  useEffect(() => {
    if (!error) return
    console.error(`GLTFLoaderFunctions:useLoadImageSource Error loading texture for uri ${sourceURI.value}`, error)
  }, [error])

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
        sourceURI.set('')
      }
    }

    if (bufferViewSourceURI) {
      isObjectURL = true
      const blob = new Blob([bufferViewSourceURI], { type: sourceDef.mimeType })
      const url = URL.createObjectURL(blob)
      sourceURI.set(url)
      return () => {
        URL.revokeObjectURL(url)
        sourceURI.set('')
      }
    }
  }, [sourceDef?.uri, bufferViewSourceURI])

  useEffect(() => {
    if (!loadedTexture) return

    let resultTexture: Texture
    if (isClient) {
      if (loadedTexture instanceof ImageBitmap) {
        resultTexture = new Texture(loadedTexture as ImageBitmap)
        resultTexture.needsUpdate = true
      } else {
        resultTexture = loadedTexture
      }
    } else {
      resultTexture = loadedTexture
    }

    result.set(resultTexture)
    const url = options.url
    ResourceManager.addReferencedAsset(url, resultTexture, ResourceType.Texture)
    return () => {
      ResourceManager.removeReferencedAsset(url, resultTexture, ResourceType.Texture)
    }
  }, [loadedTexture])

  useEffect(() => {
    if (!result.value || !sourceURI.value || !sourceDef) return

    const texture = result.value

    // Clean up resources and configure Texture.

    if (isObjectURL === true) {
      URL.revokeObjectURL(sourceURI.value!)
    } else {
      texture.userData.src = sourceURI.value
    }

    texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri)

    // sourceCache[sourceIndex] = promise
  }, [result])

  return result.value as Texture | null
}

const getNodeUUID = (node: GLTF.INode, documentID: string, nodeIndex: number) =>
  (node.extensions?.[UUIDComponent.jsonID] as EntityUUID) ?? (`${documentID}-${nodeIndex}` as EntityUUID)

const loadAnimation = (options: GLTFParserOptions, animationIndex?: number) => {
  // const result = useHookstate(null as null | AnimationClip)
  let result = null as null | AnimationClip

  const json = options.document

  const layerID = LayerComponent.get(options.entity)

  const animationDef = typeof animationIndex === 'number' ? json.animations![animationIndex] : null
  const animationName = animationDef ? (animationDef.name ? animationDef.name : 'animation_' + animationIndex) : null

  // useEffect(() => {
  if (!animationDef || !animationName) return

  const channels = animationDef.channels.filter((channel) => channel.target.node !== undefined)

  // const reactor = startReactor(() => {
  //   const channelData = useHookstate(() =>
  //     Object.fromEntries(
  //       channels.map((channel, i) => [
  //         i,
  //         {
  //           nodes: null as null | Mesh | Bone | Object3D,
  //           inputAccessors: null as null | BufferAttribute,
  //           outputAccessors: null as null | BufferAttribute,
  //           samplers: animationDef.samplers[channel.sampler],
  //           targets: channel.target
  //         }
  //       ])
  //     )
  //   )
  const channelData = Object.fromEntries(
    channels.map((channel, i) => [
      i,
      {
        nodes: null as null | Mesh | Bone | Object3D,
        entity: null as null | Entity,
        inputAccessors: null as null | BufferAttribute,
        outputAccessors: null as null | BufferAttribute,
        samplers: animationDef.samplers[channel.sampler],
        targets: channel.target
      }
    ])
  )

  for (let i = 0, il = channels.length; i < il; i++) {
    const channel = channels[i]
    const sampler = animationDef.samplers[channel.sampler]
    const target = channel.target
    const nodeIndex = target.node!
    const input = animationDef.parameters !== undefined ? animationDef.parameters[sampler.input] : sampler.input
    const output = animationDef.parameters !== undefined ? animationDef.parameters[sampler.output] : sampler.output
    const node = json.nodes![nodeIndex]
    const mesh = typeof node.mesh === 'number' ? json.meshes?.[node.mesh!] : null
    const meshHasWeights = mesh?.weights !== undefined && mesh.weights.length > 0

    const targetNodeUUID = getNodeUUID(json.nodes![nodeIndex], options.documentID, nodeIndex)
    const targetNodeEntity = UUIDComponent.getEntityByUUID(targetNodeUUID, layerID)

    /** @todo we should probably jsut use GroupComponent or something here once we stop creating Object3Ds for all nodes */
    const meshComponent = getOptionalComponent(targetNodeEntity, MeshComponent)
    const boneComponent = getOptionalComponent(targetNodeEntity, BoneComponent)
    // useEffect(() => {
    if (!channelData[i].nodes) {
      const meshWeightsLoaded = meshHasWeights ? meshComponent?.morphTargetInfluences !== undefined : true
      if (meshWeightsLoaded || boneComponent) {
        channelData[i].nodes =
          getOptionalComponent(targetNodeEntity, MeshComponent) ??
          getOptionalComponent(targetNodeEntity, BoneComponent)!
      }
    }

    // }, [meshComponent, boneComponent])

    const inputAccessor = GLTFLoaderFunctions.useLoadAccessor(options, input)
    channelData[i].inputAccessors = inputAccessor ?? null
    // useEffect(() => {
    //   if (!inputAccessor) return
    //   channelData[i].inputAccessors.set(inputAccessor)
    // }, [inputAccessor])

    const outputAccessor = GLTFLoaderFunctions.useLoadAccessor(options, output)

    // useEffect(() => {
    //   if (!outputAccessor) return
    //   channelData[i].outputAccessors.set(outputAccessor)
    // }, [outputAccessor])

    channelData[i].outputAccessors = outputAccessor ?? null

    channelData[i].entity = targetNodeEntity
  }

  // useEffect(() => {
  const channelDataArray = Object.values(channelData)
  if (!channelDataArray.some((data) => data.nodes)) return
  if (
    !(channelDataArray.length === 1 && channelDataArray[0].nodes === null) /**@todo reevaluate this check */ &&
    !channelDataArray.some((data) => !data.outputAccessors || !data.inputAccessors)
  ) {
    const values = Object.values(channelData)
    const nodes = values.map((data) => data.nodes)
    const inputAccessors = values.map((data) => data.inputAccessors) as BufferAttribute[]
    const outputAccessors = values.map((data) => data.outputAccessors) as BufferAttribute[]
    const samplers = values.map((data) => data.samplers) as GLTF.IAnimationSampler[]
    const targets = values.map((data) => data.targets) as GLTF.IAnimationChannelTarget[]
    const entities = values.map((data) => data.entity) as Entity[]

    const tracks = [] as any[] // todo
    for (let i = 0, il = nodes.length; i < il; i++) {
      const node = nodes[i] as Mesh | SkinnedMesh
      const inputAccessor = inputAccessors[i]
      const outputAccessor = outputAccessors[i]
      const sampler = samplers[i]
      const target = targets[i]
      const entity = entities[i]

      if (!(node || entity) || !outputAccessor || !inputAccessor) continue

      if (node?.updateMatrix) {
        node.updateMatrix()
      }

      const createdTracks = _createAnimationTracks(entity, inputAccessor, outputAccessor, sampler, target)

      if (createdTracks) {
        for (let k = 0; k < createdTracks.length; k++) {
          tracks.push(createdTracks[k])
        }
      }
    }

    result = new AnimationClip(animationName, undefined, tracks)
  }

  //   reactor.stop()
  // }, [channelData])

  //     return null
  //   })
  //   return () => {
  //     reactor.stop()
  //   }
  // }, [animationDef])

  return result as AnimationClip | null
}

const _createAnimationTracks = (
  node: Entity,
  inputAccessor: BufferAttribute,
  outputAccessor: BufferAttribute,
  sampler: GLTF.IAnimationSampler,
  target: GLTF.IAnimationChannelTarget
) => {
  const tracks = [] as any[] // todo
  const targetName = getComponent(node, UUIDComponent)
  if (!targetName) throw new Error('THREE.GLTFLoader: Node has no name.')
  const targetNames = [] as string[]
  if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
    traverseEntityNode(node, (entity) => {
      const object = getComponent(entity, MeshComponent)
      if (object.morphTargetInfluences) {
        if (!object.name) throw new Error('THREE.GLTFLoader: Node has no name.')
        targetNames.push(getComponent(entity, UUIDComponent))
      }
    })
  } else {
    targetNames.push(targetName)
  }

  let TypedKeyframeTrack

  switch (PATH_PROPERTIES[target.path]) {
    case PATH_PROPERTIES.weights:
      TypedKeyframeTrack = NumberKeyframeTrack
      break

    case PATH_PROPERTIES.rotation:
      TypedKeyframeTrack = QuaternionKeyframeTrack
      break

    case PATH_PROPERTIES.position:
    case PATH_PROPERTIES.scale:
      TypedKeyframeTrack = VectorKeyframeTrack
      break

    default:
      switch (outputAccessor.itemSize) {
        case 1:
          TypedKeyframeTrack = NumberKeyframeTrack
          break
        case 2:
        case 3:
        default:
          TypedKeyframeTrack = VectorKeyframeTrack
          break
      }

      break
  }

  const interpolation = sampler.interpolation !== undefined ? INTERPOLATION[sampler.interpolation] : InterpolateLinear

  const outputArray = _getArrayFromAccessor(outputAccessor)

  for (let j = 0, jl = targetNames.length; j < jl; j++) {
    const track = new TypedKeyframeTrack(
      targetNames[j] + '.' + PATH_PROPERTIES[target.path],
      inputAccessor.array,
      outputArray,
      interpolation
    )

    // Override interpolation with custom factory method.
    if (sampler.interpolation === 'CUBICSPLINE') {
      _createCubicSplineTrackInterpolant(track)
    }

    tracks.push(track)
  }

  return tracks
}

const _getArrayFromAccessor = (accessor: BufferAttribute) => {
  let outputArray = accessor.array

  if (accessor.normalized) {
    const scale = getNormalizedComponentScale(outputArray.constructor)
    const scaled = new Float32Array(outputArray.length)

    for (let j = 0, jl = outputArray.length; j < jl; j++) {
      scaled[j] = outputArray[j] * scale
    }

    outputArray = scaled
  }

  return outputArray
}

const _createCubicSplineTrackInterpolant = (track: KeyframeTrack) => {
  // @ts-ignore
  track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
    // A CUBICSPLINE keyframe in glTF has three output values for each input value,
    // representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
    // must be divided by three to get the interpolant's sampleSize argument.

    const interpolantType =
      this instanceof QuaternionKeyframeTrack ? GLTFCubicSplineQuaternionInterpolant : GLTFCubicSplineInterpolant

    return new interpolantType(this.times, this.values, this.getValueSize() / 3, result)
  }

  // @ts-ignore Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
  track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true
}

const isBoneNode = (json: GLTF.IGLTF, nodeIndex: number) => {
  const skinDefs = json.skins || []
  for (let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
    const joints = skinDefs[skinIndex].joints
    for (let i = 0, il = joints.length; i < il; i++) {
      if (joints[i] === nodeIndex) return true
    }
  }
  return false
}

const loadGLTF = async (options: GLTFParserOptions) => {
  const { entity, document } = options

  const layerID = LayerComponent.get(entity)

  const gltfComponent = getComponent(entity, GLTFComponent)

  //initialize materials
  const materials = document.materials || []
  for (let i = 0; i < materials.length; i++) {
    const materialDef = materials[i]
    const uuid = (options.documentID + '-material-' + i) as EntityUUID
    const materialEntity = UUIDComponent.getOrCreateEntityByUUID(uuid, layerID)
    setComponent(materialEntity, UUIDComponent, uuid)
    setComponent(materialEntity, SourceComponent, options.documentID)
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: entity, childIndex: i })
    setComponent(materialEntity, NameComponent, materialDef.name ?? 'Material-' + i)

    setComponent(materialEntity, MaterialDefinitionComponent, materialDef)

    const extensions = Object.entries(materialDef.extensions || {})
    for (const [extensionName, extension] of extensions) {
      const Component = ComponentJSONIDMap.get(extensionName)
      if (!Component) continue
      setComponent(materialEntity, Component, extension)
    }
  }

  //initialize each node as en entity
  const nodes = document.nodes || []

  const indexMap: Record<number, Entity> = {}

  const generatedEntities: Entity[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const uuid = getNodeUUID(node, options.documentID, i)
    const nodeEntity = UUIDComponent.getOrCreateEntityByUUID(uuid, layerID)
    indexMap[i] = nodeEntity
    generatedEntities.push(nodeEntity)
    const nodeName = node.name ?? 'Node-' + i
    setComponent(nodeEntity, NameComponent, nodeName)
    setComponent(nodeEntity, TransformComponent)
    setComponent(nodeEntity, SourceComponent, options.documentID)
    if (node.matrix) {
      const mat4 = new Matrix4().fromArray(node.matrix)
      const position = new Vector3()
      const rotation = new Quaternion()
      const scale = new Vector3()
      mat4.decompose(position, rotation, scale)
      setComponent(nodeEntity, TransformComponent, { position, rotation, scale })
    } else if (node.translation || node.rotation || node.scale) {
      const position = new Vector3().fromArray(node.translation || [0, 0, 0])
      const rotation = new Quaternion().fromArray(node.rotation || [0, 0, 0, 1])
      const scale = new Vector3().fromArray(node.scale || [1, 1, 1])
      setComponent(nodeEntity, TransformComponent, { position, rotation, scale })
    }

    /** Always set visible extension if this is not an ECS node */
    if (!node.extensions?.[UUIDComponent.jsonID]) setComponent(nodeEntity, VisibleComponent)

    // add all extensions for synchronous mount
    if (node.extensions) {
      for (const extension in node.extensions) {
        const Component = ComponentJSONIDMap.get(extension)
        if (!Component) continue
        setComponent(nodeEntity, Component, node.extensions[extension])
      }
    }

    //handle legacy ECS embedding
    const extras = node.extras
    if (extras) {
      const data = [...Object.entries(extras)]
      for (const [key, value] of data) {
        const parts = key.split('.')
        if (parts.length > 1) {
          if (parts[0] === 'xrengine') {
            if (ComponentJSONIDMap.has(parts[1])) {
              const Component = ComponentJSONIDMap.get(parts[1])
              if (!Component) return console.warn('no component found for extension', parts[1])
              setComponent(nodeEntity, Component)
              if (Component === ColliderComponent) removeComponent(nodeEntity, VisibleComponent)
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const nodeEntity = indexMap[i]
    const node = nodes[i]
    if (node.children) {
      for (let j = 0; j < node.children.length; j++) {
        const childIndex = node.children[j]
        const childEntity = indexMap[childIndex]
        setComponent(childEntity, EntityTreeComponent, {
          parentEntity: nodeEntity,
          childIndex: j
        })
      }
    }

    if (node.mesh !== undefined) {
      if (!document.meshes) throw new Error('GLTFLoader: Referencing undefined mesh array')

      if (!hasComponent(nodeEntity, ColliderComponent)) setComponent(nodeEntity, VisibleComponent)

      const meshDef = document.meshes[node.mesh]

      const isSinglePrimitive = meshDef.primitives.length === 1
      const meshGeometry = await GLTFLoaderFunctions.useLoadPrimitives(options, node.mesh)

      const material = isSinglePrimitive ? defaultMaterial() : meshDef.primitives.map(defaultMaterial)
      const mesh =
        typeof node.skin !== 'undefined'
          ? new SkinnedMesh(meshGeometry as BufferGeometry)
          : new Mesh(meshGeometry as BufferGeometry)

      mesh.material = material

      if (typeof node.skin !== 'undefined') {
        const skinnedMesh = mesh as SkinnedMesh
        skinnedMesh.skeleton = new Skeleton()
        skinnedMesh.normalizeSkinWeights()
        setComponent(nodeEntity, SkinnedMeshComponent, skinnedMesh)
      }

      setComponent(nodeEntity, MeshComponent, mesh)
      addObjectToGroup(nodeEntity, mesh)
      proxifyParentChildRelationships(mesh)

      mesh.name = node.name ?? 'Node-' + i

      const url = options.url
      ResourceManager.addReferencedAsset(url, mesh, ResourceType.Mesh)
      const materialInstance: ComponentType<typeof MaterialInstanceComponent> = { uuid: [] }
      for (let primIndex = 0; primIndex < meshDef.primitives.length; primIndex++) {
        const primitive = meshDef.primitives[primIndex]
        //handle material instances
        const materialUUID = (options.documentID + '-material-' + primitive.material!) as EntityUUID

        // const materialInstance: ComponentType<typeof MaterialInstanceComponent> =
        //   getOptionalComponent(nodeEntity, MaterialInstanceComponent) ?? { uuid: [] }
        //{ uuid: [] }
        if (isSinglePrimitive) {
          materialInstance.uuid = [materialUUID]
        } else {
          materialInstance.uuid[primitive.material!] = materialUUID
        }
        //handle primitive extensions
        const extensions = primitive.extensions || {}
        for (const extensionName in extensions) {
          const Component = ComponentJSONIDMap.get(extensionName)
          if (!Component) continue
          setComponent(nodeEntity, Component, extensions[extensionName])
        }
        //@todo: weird that this needs to be set repeatedly in the for loop for proper instantiation
      }
      setComponent(nodeEntity, MaterialInstanceComponent, materialInstance)
      //handle morph targets
      const loadedMorphTargets = GLTFLoaderFunctions.useMergeMorphTargets(options, i)

      if (loadedMorphTargets && mesh) {
        if (loadedMorphTargets.POSITION) mesh.geometry.morphAttributes.position = loadedMorphTargets.POSITION
        if (loadedMorphTargets.NORMAL) mesh.geometry.morphAttributes.normal = loadedMorphTargets.NORMAL
        if (loadedMorphTargets.COLOR_0) mesh.geometry.morphAttributes.color = loadedMorphTargets.COLOR_0

        mesh.geometry.morphTargetsRelative = true
        mesh.updateMorphTargets()

        if (meshDef.weights) {
          for (let j = 0, jl = meshDef.weights.length; j < jl; j++) {
            mesh.morphTargetInfluences![j] = meshDef.weights[j]
          }
        }
      }
    } else if (isBoneNode(gltfComponent.document!, i)) {
      const bone = new Bone()
      bone.name = node.name ?? 'Node-' + i
      setComponent(nodeEntity, BoneComponent, bone)
      addObjectToGroup(nodeEntity, bone)
      proxifyParentChildRelationships(bone)
      setComponent(nodeEntity, Object3DComponent, bone)
    } else {
      const obj3d = new Object3D()
      obj3d.name = node.name ?? 'Node-' + i
      addObjectToGroup(nodeEntity, obj3d)
      proxifyParentChildRelationships(obj3d)
      setComponent(nodeEntity, Object3DComponent, obj3d)
    }
  }

  //initialize animations
  const animations = document.animations || []
  const animationClips = [] as AnimationClip[]
  for (let i = 0; i < animations.length; i++) {
    const animationTrack = GLTFLoaderFunctions.useLoadAnimation(options, i)
    if (animationTrack) animationClips.push(animationTrack)
  }
  if (!hasComponent(entity, Object3DComponent)) {
    const obj3d = new Object3D()
    setComponent(entity, Object3DComponent, obj3d)
    addObjectToGroup(entity, obj3d)
    proxifyParentChildRelationships(obj3d)
  }

  const obj3d = getComponent(entity, Object3DComponent)
  obj3d.animations = animationClips
  if (!hasComponent(entity, AnimationComponent)) {
    setComponent(entity, AnimationComponent, {
      mixer: new AnimationMixer(obj3d),
      animations: obj3d.animations
    })
  } else {
    const clips = getComponent(entity, AnimationComponent).animations
    setComponent(entity, AnimationComponent, { animations: [...clips, ...animationClips] })
  }

  //initialize skins
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (node.skin === undefined) continue

    const nodeEntity = indexMap[i]
    const skinnedMeshComponent = getComponent(nodeEntity, SkinnedMeshComponent)
    const skin = document.skins![node.skin!]!

    const inverseBindMatrices = GLTFLoaderFunctions.useLoadAccessor(options, skin.inverseBindMatrices)
    if (!inverseBindMatrices) throw new Error('GLTFLoader: Inverse bind matrices not found')
    const jointNodeUUIDs = skin.joints.map((joint) =>
      getNodeUUID(nodes[joint], options.documentID, joint)
    ) as EntityUUID[]
    const jointEntities = jointNodeUUIDs.map((uuid) => UUIDComponent.getEntityByUUID(uuid, layerID))
    const jointBones = jointEntities.map((entity) => getComponent(entity, BoneComponent))

    const bones: Bone[] = []
    const boneInverses: Matrix4[] = []
    for (let i = 0, il = jointBones.length; i < il; i++) {
      const jointNode = jointBones[i]

      if (jointNode) {
        bones.push(jointNode)

        const mat = new Matrix4()

        if (inverseBindMatrices !== null) {
          mat.fromArray(inverseBindMatrices.array, i * 16)
        }

        boneInverses.push(mat)
      } else {
        // console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinDef.joints[i])
      }
    }

    const skeleton = new Skeleton(bones, boneInverses)
    skinnedMeshComponent.skeleton = skeleton

    const url = options.url
    ResourceManager.addReferencedAsset(url, skeleton as unknown as Object3D, ResourceType.Object3D)
  }

  //parent root nodes to gltf entity
  const roots = document.scenes![0].nodes
  for (const rootIndex of roots) {
    const rootEntity = indexMap[rootIndex]
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: entity, childIndex: rootIndex })
  }

  return generatedEntities
}

export const GLTFLoaderFunctions = {
  computeBounds,
  useLoadPrimitive: loadPrimitive,
  useLoadPrimitives: loadPrimitives,
  useLoadAccessor: loadAccessor,
  useLoadBufferView,
  useLoadBuffer,
  useLoadMaterial: loadMaterial,
  useLoadMorphTargets: loadMorphTargets,
  useMergeMorphTargets: mergeMorphTargets,
  useAssignTexture: assignTexture,
  useLoadTexture: loadTexture,
  useLoadImageSource,
  useLoadTextureImage: loadTextureImage,
  useLoadAnimation: loadAnimation,
  loadGLTF
}
