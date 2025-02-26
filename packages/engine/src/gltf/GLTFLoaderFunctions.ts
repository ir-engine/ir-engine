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
  Entity,
  EntityTreeComponent,
  EntityUUID,
  LayerComponent,
  LayerFunctions,
  Layers,
  UUIDComponent,
  createEntity,
  deserializeComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  iterateEntityNode,
  removeComponent,
  setComponent,
  traverseEntityNode
} from '@ir-engine/ecs'
import { getState, isClient } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { ResourceType } from '@ir-engine/spatial/src/resources/ResourceState'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
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
  LoadingManager,
  Material,
  MathUtils,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
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
import { loadResource, unloadResourcesForEntity } from '../assets/functions/resourceLoaderFunctions'
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
import { getImageURIMimeType } from '../assets/loaders/gltf/GLTFParser'
import { KTX2Loader } from '../assets/loaders/gltf/KTX2Loader'
import { TextureLoader } from '../assets/loaders/texture/TextureLoader'
import { AssetCacheState } from '../assets/state/AssetCacheState'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { SourceComponent, SourceID } from '../scene/components/SourceComponent'
import { GLTFComponent } from './GLTFComponent'
import { KHR_DRACO_MESH_COMPRESSION, getBufferIndex } from './GLTFExtensions'
import { KHRTextureTransformExtensionComponent, KHRUnlitExtensionComponent } from './MaterialExtensionComponents'
import { NodeID, NodeIDComponent } from './NodeIDComponent'

const assignFinalMaterial = (primitiveDef: GLTF.IMeshPrimitive, material: MeshPhysicalMaterial) => {
  const useDerivativeTangents = primitiveDef.attributes.TANGENT === undefined
  const useVertexColors = primitiveDef.attributes.COLOR_0 !== undefined
  const useFlatShading = primitiveDef.attributes.NORMAL === undefined

  if (useVertexColors) material.vertexColors = true
  if (useFlatShading) material.flatShading = true

  if (useDerivativeTangents) {
    if (material.normalScale) material.normalScale.y *= -1
    if (material.clearcoatNormalScale) material.clearcoatNormalScale.y *= -1
  }

  material.needsUpdate = true
}

const loadPrimitives = async (
  options: GLTFParserOptions,
  meshIndex: number
): Promise<[BufferGeometry, Material | Material[]]> => {
  const json = options.document
  const mesh = json.meshes![meshIndex]

  const primitives = await Promise.all(
    mesh.primitives.map((primitive, index) => GLTFLoaderFunctions.loadPrimitive(options, meshIndex, index)!)
  )

  if (primitives.length > 1) {
    let needsTangentRecalculation = false
    for (let i = 0; i < primitives.length; i++) {
      const [geometry] = primitives[i]!
      if (geometry.attributes.tangent) needsTangentRecalculation = true
      geometry.deleteAttribute('tangent')
    }

    const newGeometry = mergeBufferGeometries(
      primitives.map(([geometry]) => geometry),
      true
    )!
    if (needsTangentRecalculation) newGeometry?.computeTangents()

    return [newGeometry, primitives.map(([, material]) => material)]
  } else {
    return primitives[0]
  }
}

const loadPrimitive = async (
  options: GLTFParserOptions,
  meshIndex: number,
  primitiveIndex: number
): Promise<[BufferGeometry, Material]> => {
  const json = options.document
  const mesh = json.meshes![meshIndex]

  const primitiveDef = mesh.primitives[primitiveIndex]
  const materialIndex = primitiveDef.material

  let materialPromise

  if (typeof materialIndex === 'number') {
    materialPromise = getDependency(options, 'material', materialIndex)
  } else {
    materialPromise = Promise.resolve(MaterialStateComponent.fallbackMaterial())
  }

  const hasDracoCompression = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]

  if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && 'COLOR_0' in primitiveDef.attributes) {
    console.warn(
      `THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`
    )
  }

  if (hasDracoCompression) {
    return new Promise((resolve) => {
      KHR_DRACO_MESH_COMPRESSION.decodePrimitive(options, primitiveDef).then(async (geom) => {
        GLTFLoaderFunctions.computeBounds(json, geom, primitiveDef)
        assignExtrasToUserData(geom, primitiveDef as GLTF.IMeshPrimitive)
        const material = await materialPromise
        assignFinalMaterial(primitiveDef, material)
        resolve([geom, material])
      })
    })
  } else {
    const geometry = new BufferGeometry()

    const attributes = primitiveDef.attributes

    const promises = [] as Promise<void>[]

    for (const attributeName in attributes) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()
      // Skip attributes already provided by e.g. Draco extension.
      if (threeAttributeName in geometry.attributes) continue
      const attribute = primitiveDef.attributes[attributeName]
      promises.push(
        new Promise<void>(async (resolve) => {
          const accessor = await getDependency(options, 'accessor', attribute)
          if (accessor) {
            geometry.setAttribute(threeAttributeName, accessor)
          }
          resolve()
        })
      )
    }

    if (typeof primitiveDef.indices === 'number') {
      promises.push(
        new Promise<void>(async (resolve) => {
          const accessor = await getDependency(options, 'accessor', primitiveDef.indices!)
          if (accessor) {
            geometry.setIndex(accessor as BufferAttribute)
          }
          resolve()
        })
      )
    }
    GLTFLoaderFunctions.computeBounds(json, geometry, primitiveDef)
    assignExtrasToUserData(geometry, primitiveDef as GLTF.IMeshPrimitive)
    const [material] = await Promise.all([materialPromise, ...promises])
    assignFinalMaterial(primitiveDef, material)
    if (primitiveDef.targets) await addMorphTargets(options, geometry, primitiveDef.targets)
    return [geometry, material]
  }
}

const addMorphTargets = async (
  options: GLTFParserOptions,
  geometry: BufferGeometry,
  targets: GLTF.IMeshPrimitive['targets']
) => {
  let hasMorphPosition = false
  let hasMorphNormal = false
  let hasMorphColor = false

  if (!targets) return Promise.resolve()

  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i]

    if (target.POSITION !== undefined) hasMorphPosition = true
    if (target.NORMAL !== undefined) hasMorphNormal = true
    if (target.COLOR_0 !== undefined) hasMorphColor = true

    if (hasMorphPosition && hasMorphNormal && hasMorphColor) break
  }

  if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve(geometry)

  const pendingPositionAccessors = [] as Promise<BufferAttribute>[]
  const pendingNormalAccessors = [] as Promise<BufferAttribute>[]
  const pendingColorAccessors = [] as Promise<BufferAttribute>[]

  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i]

    if (hasMorphPosition) {
      const pendingAccessor =
        target.POSITION !== undefined
          ? getDependency(options, 'accessor', target.POSITION)
          : Promise.resolve(geometry.attributes.position)

      pendingPositionAccessors.push(pendingAccessor)
    }

    if (hasMorphNormal) {
      const pendingAccessor =
        target.NORMAL !== undefined
          ? getDependency(options, 'accessor', target.NORMAL)
          : Promise.resolve(geometry.attributes.normal)

      pendingNormalAccessors.push(pendingAccessor)
    }

    if (hasMorphColor) {
      const pendingAccessor =
        target.COLOR_0 !== undefined
          ? getDependency(options, 'accessor', target.COLOR_0)
          : Promise.resolve(geometry.attributes.color)

      pendingColorAccessors.push(pendingAccessor)
    }
  }

  const [morphPositions, morphNormals, morphColors] = await Promise.all([
    Promise.all(pendingPositionAccessors),
    Promise.all(pendingNormalAccessors),
    Promise.all(pendingColorAccessors)
  ])

  if (hasMorphPosition) geometry.morphAttributes.position = morphPositions
  if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals
  if (hasMorphColor) geometry.morphAttributes.color = morphColors
  geometry.morphTargetsRelative = true
}

function updateMorphTargets(mesh: Mesh, meshDef: GLTF.IMesh) {
  mesh.updateMorphTargets()

  if (meshDef.weights !== undefined) {
    for (let i = 0, il = meshDef.weights.length; i < il; i++) {
      mesh.morphTargetInfluences![i] = meshDef.weights[i]
    }
  }

  // .extras has user-defined data, so check that .extras.targetNames is an array.
  if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
    const targetNames = meshDef.extras.targetNames

    if (mesh.morphTargetInfluences!.length === targetNames.length) {
      mesh.morphTargetDictionary = {}

      for (let i = 0, il = targetNames.length; i < il; i++) {
        mesh.morphTargetDictionary[targetNames[i]] = i
      }
    } else {
      console.warn('THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.')
    }
  }
}

const interleavedBufferCache = {} as Record<string, Record<string, InterleavedBuffer>>

const loadAccessor = async (options: GLTFParserOptions, accessorIndex: number) => {
  const json = options.document

  const accessorDef = json.accessors![accessorIndex]

  if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
    const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
    const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]
    const normalized = accessorDef.normalized === true

    const array = new TypedArray(accessorDef.count * itemSize)
    return new BufferAttribute(array, itemSize, normalized)
  }

  const pendingBufferViews = [] as Promise<ArrayBuffer | null>[]

  if (typeof accessorDef.bufferView === 'number') {
    pendingBufferViews.push(getDependency(options, 'bufferView', accessorDef.bufferView))
  } else {
    pendingBufferViews.push(Promise.resolve(null))
  }

  if (typeof accessorDef.sparse === 'object') {
    pendingBufferViews.push(getDependency(options, 'bufferView', accessorDef.sparse.indices.bufferView))
    pendingBufferViews.push(getDependency(options, 'bufferView', accessorDef.sparse.values.bufferView))
  }

  const [bufferView, sparseBufferViewIndices, sparseBufferViewValues] = await Promise.all(pendingBufferViews)

  const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
  const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

  // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
  const elementBytes = TypedArray.BYTES_PER_ELEMENT
  const itemBytes = elementBytes * itemSize
  const byteOffset = accessorDef.byteOffset || 0
  const byteStride =
    accessorDef.bufferView !== undefined ? json.bufferViews![accessorDef.bufferView].byteStride : undefined
  const normalized = accessorDef.normalized === true
  let array, bufferAttribute: BufferAttribute | InterleavedBufferAttribute

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
    if (!interleavedBufferCache[options.url]) interleavedBufferCache[options.url] = {}
    const cache = interleavedBufferCache[options.url]
    let ib = cache[ibCacheKey]

    if (!ib) {
      array = new TypedArray(bufferView!, ibSlice * byteStride, (accessorDef.count * byteStride) / elementBytes)

      // Integer parameters to IB/IBA are in array elements, not bytes.
      ib = new InterleavedBuffer(array, byteStride / elementBytes)

      cache[ibCacheKey] = ib
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

  return bufferAttribute
}

const loadBufferView = async (options: GLTFParserOptions, bufferViewIndex: number) => {
  const [bufferIndex, callback] = getBufferIndex(options, bufferViewIndex)

  const buffer = await GLTFLoaderFunctions.loadBuffer(options, bufferIndex)
  if (!buffer) return null

  return callback(buffer)
}

const loadBuffer = async (options: GLTFParserOptions, bufferIndex: number) => {
  const json = options.document
  const bufferDef = json.buffers![bufferIndex]

  if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
    throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.')
  }

  const loader = new FileLoader(options.manager)
  loader.setResponseType('arraybuffer')

  if (bufferDef.uri === undefined && bufferIndex === 0) {
    return Promise.resolve(options.body)
  }

  return new Promise<ArrayBuffer>(function (resolve, reject) {
    const url = LoaderUtils.resolveURL(bufferDef.uri!, options.path)
    loadResource<ArrayBuffer>(
      url,
      ResourceType.ArrayBuffer,
      options.entity, // the GLTF entity
      (response) => {
        resolve(response)
      },
      (request) => {
        //
      },
      (err) => {
        // if (controller.signal.aborted) return
        reject(new Error('GLTFLoaderFunctions: Failed to load buffer "' + bufferDef.uri + '".'))
      },
      null!, // controller.signal,
      loader
    )
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
const loadMaterial = async (options: GLTFParserOptions, materialIndex: number) => {
  const json = options.document
  const entity = options.entity

  const layer = LayerComponent.get(entity)
  const materialDef = json.materials![materialIndex]

  const nodeID = ('material-' + materialIndex) as NodeID
  const materialEntity = NodeIDComponent.create(options.documentID, nodeID, layer)
  setComponent(materialEntity, EntityTreeComponent, { parentEntity: entity, childIndex: materialIndex })
  setComponent(materialEntity, NameComponent, materialDef.name ?? 'Material-' + materialIndex)

  // if (materialDef.extensions) addUnknownExtensionsToUserData(GLTFExtensions, material, materialDef)

  const materialParams = {} as any
  const promises = [] as Promise<void>[]
  const materialExtensions = materialDef.extensions || {}

  let materialConstructor = MeshStandardMaterial
  if (!materialExtensions[EXTENSIONS.EE_MATERIAL] && materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
    const kmuExtension = KHRUnlitExtensionComponent
    materialConstructor = kmuExtension.getMaterialType() as any
    promises.push(kmuExtension.extendMaterialParams(options, materialParams, materialDef) as any)
  } else {
    materialParams.color = new Color(1.0, 1.0, 1.0)
    materialParams.opacity = 1.0

    if (typeof materialDef.pbrMetallicRoughness?.baseColorTexture !== 'undefined') {
      promises.push(
        new Promise<void>(async (resolve) => {
          const map = await GLTFLoaderFunctions.assignTexture(
            options,
            materialDef.pbrMetallicRoughness!.baseColorTexture!
          )
          if (map) {
            map.colorSpace = SRGBColorSpace
            materialParams.map = map
          }
          resolve()
        })
      )
    }

    if (typeof materialDef.pbrMetallicRoughness?.baseColorFactor !== 'undefined') {
      if (Array.isArray(materialDef.pbrMetallicRoughness?.baseColorFactor)) {
        const array = materialDef.pbrMetallicRoughness.baseColorFactor
        ;(materialParams.color = new Color().setRGB(array[0], array[1], array[2], LinearSRGBColorSpace)),
          (materialParams.opacity = array[3])
      }
    }
    materialParams.metalness =
      materialDef.pbrMetallicRoughness?.metallicFactor !== undefined
        ? materialDef.pbrMetallicRoughness.metallicFactor
        : 1.0

    materialParams.roughness =
      materialDef.pbrMetallicRoughness?.roughnessFactor !== undefined
        ? materialDef.pbrMetallicRoughness.roughnessFactor
        : 1.0

    if (typeof materialDef.pbrMetallicRoughness?.metallicRoughnessTexture !== 'undefined') {
      promises.push(
        new Promise<void>(async (resolve) => {
          const metalnessMap = await GLTFLoaderFunctions.assignTexture(
            options,
            materialDef.pbrMetallicRoughness!.metallicRoughnessTexture!
          )

          if (metalnessMap) {
            materialParams.metalnessMap = metalnessMap
          }
          resolve()
        })
      )
    }

    if (typeof materialDef.pbrMetallicRoughness?.metallicRoughnessTexture !== 'undefined') {
      promises.push(
        new Promise<void>(async (resolve) => {
          const roughnessMap = await GLTFLoaderFunctions.assignTexture(
            options,
            materialDef.pbrMetallicRoughness!.metallicRoughnessTexture!
          )

          if (roughnessMap) {
            materialParams.roughnessMap = roughnessMap
          }
          resolve()
        })
      )
    }
  }

  materialParams.side = materialDef.doubleSided === true ? DoubleSide : FrontSide

  const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE
  materialParams.transparent = alphaMode === ALPHA_MODES.BLEND

  // See: https://github.com/mrdoob/three.js/issues/17706
  if (alphaMode === ALPHA_MODES.BLEND) {
    materialParams.depthWrite = false
  }

  if (materialDef.alphaMode === ALPHA_MODES.MASK) {
    materialParams.alphaTest = typeof materialDef.alphaCutoff === 'number' ? materialDef.alphaCutoff : 0.5
  } else {
    materialParams.alphaTest = 0
  }

  if (typeof materialDef.normalTexture !== 'undefined') {
    const normalMap = await GLTFLoaderFunctions.assignTexture(options, materialDef.normalTexture)

    if (normalMap) {
      materialParams.normalMap = normalMap
    }
  }

  if (materialDef.normalTexture?.scale) {
    const scale = materialDef.normalTexture.scale
    materialParams.normalScale = new Vector2(scale, scale)
  } else {
    materialParams.normalScale = new Vector2(1, 1)
  }

  if (typeof materialDef.occlusionTexture !== 'undefined') {
    const aoMap = await GLTFLoaderFunctions.assignTexture(options, materialDef.occlusionTexture)

    if (aoMap) {
      materialParams.aoMap = aoMap
    }
  }

  materialParams.aoMapIntensity = materialDef.occlusionTexture?.strength ?? 1.0

  const emissiveFactor = materialDef.emissiveFactor
  if (emissiveFactor) {
    materialParams.emissive = new Color().setRGB(
      emissiveFactor[0],
      emissiveFactor[1],
      emissiveFactor[2],
      LinearSRGBColorSpace
    )
  }

  if (typeof materialDef.emissiveTexture !== 'undefined') {
    promises.push(
      new Promise<void>(async (resolve) => {
        const emissiveMap = await GLTFLoaderFunctions.assignTexture(options, materialDef.emissiveTexture!)

        if (emissiveMap) {
          emissiveMap.colorSpace = SRGBColorSpace
          materialParams.emissiveMap = emissiveMap
        }
        resolve()
      })
    )
  }

  const extensions = Object.entries(materialDef.extensions || {})

  for (const [extensionName, extension] of extensions) {
    const Component = ComponentJSONIDMap.get(extensionName) as any // todo
    if (!Component) continue
    deserializeComponent(materialEntity, Component, extension)
    if (typeof Component.getMaterialType === 'function') {
      const ext = Component.getMaterialType(materialDef)
      if (ext) materialConstructor = ext
      else console.warn('GLTFLoaderFunctions: Material type not found.')
    }
    if (typeof Component.extendMaterialParams === 'function') {
      promises.push(Component.extendMaterialParams(options, materialParams, materialDef, materialIndex))
    }
  }

  await Promise.all(promises)

  const material = new materialConstructor(materialParams)
  const uuid = getComponent(materialEntity, UUIDComponent)
  material.uuid = uuid
  material.name = materialDef.name || 'Material-' + materialIndex

  setComponent(materialEntity, MaterialStateComponent, { material, parameters: materialParams })

  assignExtrasToUserData(material, materialDef)

  return material
}

const mergeMorphTargets = async (options: GLTFParserOptions, nodeIndex: number) => {
  const json = options.document
  const node = json.nodes![nodeIndex]!
  const mesh = json.meshes![node.mesh!]

  const morphTargetsPromise = [] as Promise<Record<string, BufferAttribute[]> | null>[]
  let loadedMorphTargets = null! as Record<string, BufferAttribute[]> | null

  mesh.primitives.map((primitive) => {
    if (primitive.targets) morphTargetsPromise.push(GLTFLoaderFunctions.loadMorphTargets(options, primitive.targets))
  })

  const morphTargets = await Promise.all(morphTargetsPromise)

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

  return loadedMorphTargets as Record<string, BufferAttribute[]> | null
}

const loadMorphTargets = async (options: GLTFParserOptions, targetsList: Record<string, number>[]) => {
  const targetState = targetsList.map((target) =>
    Object.fromEntries(Object.entries(target).map(([key]) => [key, null]))
  ) as Record<string, BufferAttribute | null>[]

  for (let i = 0, il = targetsList.length; i < il; i++) {
    const target = targetsList[i]
    for (const [key, accessorIndex] of Object.entries(target)) {
      const accessor = await getDependency(options, 'accessor', accessorIndex)
      if (!accessor) continue
      targetState[i][key] = accessor as BufferAttribute
    }
  }

  return targetState.reduce(
    (acc, target: Record<string, BufferAttribute>) => {
      for (const [key, value] of Object.entries(target)) {
        if (!acc[key]) acc[key] = []
        acc[key].push(value)
      }
      return acc
    },
    {} as Record<string, BufferAttribute[]>
  )
}

/**
 * Asynchronously assigns a texture to the given material parameters.
 * @param {Object} materialParams
 * @param {string} mapName
 * @param {Object} mapDef
 * @return {Promise<Texture>}
 */
const assignTexture = async (options: GLTFParserOptions, mapDef: GLTF.ITextureInfo) => {
  let texture = await getDependency(options, 'texture', mapDef.index)
  if (!texture) return null

  if (mapDef?.texCoord !== undefined && mapDef.texCoord > 0) {
    texture = texture.clone()
    texture.channel = mapDef.texCoord
  }

  /** @todo properly support extensions */
  const transform =
    mapDef?.extensions !== undefined ? mapDef.extensions[KHRTextureTransformExtensionComponent.jsonID] : undefined

  if (transform) {
    const extendedTexture = KHRTextureTransformExtensionComponent.extendTexture(texture, transform)
    return extendedTexture
  } else {
    return texture
  }
}

type KHRTextureBasisu = {
  source: number
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
 * @param {number} textureIndex
 * @return {Promise<THREE.Texture|null>}
 */
const loadTexture = (options: GLTFParserOptions, textureIndex: number) => {
  const json = options.document

  const textureDef = json.textures![textureIndex]

  const extensions = textureDef?.extensions as Record<string, Record<string, number>> | null
  const basisu = extensions && (extensions[EXTENSIONS.KHR_TEXTURE_BASISU] as KHRTextureBasisu)

  /** @todo properly support texture extensions, this is a hack */
  const sourceIndex =
    (extensions && Object.values(extensions).find((ext) => typeof ext.source === 'number')?.source) ??
    textureDef.source!
  const sourceDef = typeof sourceIndex === 'number' ? json.images![sourceIndex] : null

  const handler = typeof sourceDef?.uri === 'string' && options.manager.getHandler(sourceDef.uri)
  let loader: ImageLoader | ImageBitmapLoader | TextureLoader | KTX2Loader | Loader<unknown, string>

  if (basisu) loader = getState(AssetLoaderState).gltfLoader.ktx2Loader!
  else if (handler) loader = handler as Loader<unknown, string>
  else {
    const textureLoader = new TextureLoader(undefined, true)
    loader = textureLoader
    loader.setRequestHeader(options.requestHeader)
  }

  const texture = GLTFLoaderFunctions.loadTextureImage(options, textureIndex, sourceIndex, loader)

  return texture
}

const loadTextureImage = async (
  options: GLTFParserOptions,
  textureIndex: number,
  sourceIndex: number,
  loader: ImageLoader | ImageBitmapLoader | TextureLoader | KTX2Loader | Loader
) => {
  const json = options.document

  const textureDef = json.textures![textureIndex]
  const sourceDef = json.images![sourceIndex]

  const texture = await GLTFLoaderFunctions.loadImageSource(options, sourceIndex, loader)

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

  return texture
}

const URL = self.URL || self.webkitURL

const loadImageSource = async (
  options: GLTFParserOptions,
  sourceIndex: number,
  loader: ImageLoader | ImageBitmapLoader | TextureLoader | KTX2Loader | Loader
) => {
  const json = options.document
  const sourceDef = json.images![sourceIndex]

  let sourceURI = sourceDef.uri || ''
  let isObjectURL = false

  if (sourceDef.bufferView !== undefined) {
    if (!isClient) {
      const texture = new Texture()
      texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri)
      return texture
    }
    // Load binary image data from bufferView, if provided.

    sourceURI = await GLTFLoaderFunctions.loadBufferView(options, sourceDef.bufferView).then(function (bufferView) {
      isObjectURL = true
      const blob = new Blob([bufferView!], { type: sourceDef.mimeType })
      sourceURI = URL.createObjectURL(blob)
      return sourceURI
    })
  } else if (sourceDef.uri === undefined) {
    throw new Error('THREE.GLTFLoader: Image ' + sourceIndex + ' is missing URI and bufferView')
  }

  const texture = await new Promise<Texture>(function (resolve, reject) {
    const url = LoaderUtils.resolveURL(sourceURI, options.path)
    loadResource<Texture>(
      url,
      ResourceType.Texture,
      options.entity, // the GLTF entity
      (response) => {
        resolve(response)
      },
      (request) => {
        //
      },
      (err) => {
        // if (controller.signal.aborted) return
        reject()
      },
      null!, // controller.signal,
      loader
    )
  })

  if (isObjectURL) {
    URL.revokeObjectURL(sourceURI)
  } else {
    texture.userData.src = sourceURI
  }

  texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri)

  return texture
}

const loadAnimation = async (options: GLTFParserOptions, animationIndex: number) => {
  const json = options.document

  const animationDef = json.animations![animationIndex]
  const animationName = animationDef.name ? animationDef.name : 'animation_' + animationIndex

  const pendingNodes = [] as Promise<Entity>[]
  const pendingInputAccessors = [] as Promise<BufferAttribute | null>[]
  const pendingOutputAccessors = [] as Promise<BufferAttribute | null>[]
  const samplers = [] as GLTF.IAnimationSampler[]
  const targets = [] as GLTF.IAnimationChannelTarget[]

  for (let i = 0, il = animationDef.channels.length; i < il; i++) {
    const channel = animationDef.channels[i]
    const sampler = animationDef.samplers[channel.sampler]
    const target = channel.target
    const name = target.node
    const input = animationDef.parameters !== undefined ? animationDef.parameters[sampler.input] : sampler.input
    const output = animationDef.parameters !== undefined ? animationDef.parameters[sampler.output] : sampler.output

    if (target.node === undefined) continue

    pendingNodes.push(getDependency(options, 'node', name))
    pendingInputAccessors.push(getDependency(options, 'accessor', input))
    pendingOutputAccessors.push(getDependency(options, 'accessor', output))
    samplers.push(sampler)
    targets.push(target)
  }

  const [nodes, inputAccessors, outputAccessors] = await Promise.all([
    Promise.all(pendingNodes),
    Promise.all(pendingInputAccessors),
    Promise.all(pendingOutputAccessors)
  ])

  const tracks = [] as KeyframeTrack[]
  for (let i = 0, il = nodes.length; i < il; i++) {
    const entity = nodes[i]
    const node = getComponent(entity, ObjectComponent) as Bone | SkinnedMesh | Mesh
    const inputAccessor = inputAccessors[i]
    const outputAccessor = outputAccessors[i]
    const sampler = samplers[i]
    const target = targets[i]

    if (!node || !outputAccessor || !inputAccessor) continue

    if (node.updateMatrix) {
      node.updateMatrix()
    }

    const createdTracks = _createAnimationTracks(entity, inputAccessor, outputAccessor, sampler, target)

    if (createdTracks) {
      for (let k = 0; k < createdTracks.length; k++) {
        tracks.push(createdTracks[k])
      }
    }
  }

  return new AnimationClip(animationName, undefined, tracks)
}

const _createAnimationTracks = (
  node: Entity,
  inputAccessor: BufferAttribute,
  outputAccessor: BufferAttribute,
  sampler: GLTF.IAnimationSampler,
  target: GLTF.IAnimationChannelTarget
) => {
  const tracks = [] as KeyframeTrack[]

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

const loadMesh = async (options: GLTFParserOptions, entity: Entity, nodeIndex: number, meshIndex: number) => {
  const json = options.document

  const meshDef = json.meshes![meshIndex]

  if (!hasComponent(entity, ColliderComponent)) setComponent(entity, VisibleComponent)

  const node = json.nodes![nodeIndex]

  const [geometry, materials] = await GLTFLoaderFunctions.loadPrimitives(options, node.mesh!)

  const isSkinnedMesh = typeof node.skin !== 'undefined'

  /** @todo add support for primitive modes */
  // let mesh: Mesh | SkinnedMesh | LineSegments | Line | LineLoop | LineSegments | Points

  // if (
  //   primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
  //   primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
  //   primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
  //   primitive.mode === undefined
  // ) {
  const mesh = isSkinnedMesh === true ? new SkinnedMesh(geometry, materials) : new Mesh(geometry, materials)

  //   if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
  //     mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleStripDrawMode)
  //   } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
  //     mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleFanDrawMode)
  //   }
  // } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
  //   mesh = new LineSegments(geometry, material)
  // } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
  //   mesh = new Line(geometry, material)
  // } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
  //   mesh = new LineLoop(geometry, material)
  // } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
  //   mesh = new Points(geometry, material)
  // } else {
  //   throw new Error('THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode)
  // }

  if (isSkinnedMesh) {
    const skinnedMesh = mesh as SkinnedMesh
    skinnedMesh.skeleton = new Skeleton()
    skinnedMesh.normalizeSkinWeights()
    setComponent(entity, SkinnedMeshComponent, skinnedMesh)
  }

  //handle primitive extensions
  // const extensions = primitiveDef.extensions || {}
  // for (const extensionName in extensions) {
  //   const Component = ComponentJSONIDMap.get(extensionName)
  //   if (!Component) continue
  //   deserializeComponent(entity, Component, extensions[extensionName])
  // }

  setComponent(entity, MeshComponent, mesh)
  setComponent(entity, NameComponent, meshDef.name ?? 'Mesh-' + meshIndex)

  setComponent(entity, MaterialInstanceComponent, {
    uuid: (Array.isArray(materials) ? materials : [materials]).map((material) => material.uuid as EntityUUID)
  })

  if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
    updateMorphTargets(mesh, meshDef)
  }

  return mesh
}

const loadCamera = async (options: GLTFParserOptions, entity: Entity, nodeIndex: number) => {
  const json = options.document
  const nodes = json.nodes!
  const node = nodes[nodeIndex]!

  const cameraDef = json.cameras![node.camera!]

  if (cameraDef.type === 'orthographic' || !cameraDef.perspective) {
    // const camera = new OrthographicCamera(-params.xmag, params.xmag, params.ymag, -params.ymag, params.znear, params.zfar)
    return console.warn('Orthographic cameras not supported yet')
  }

  const perspectiveCamera = cameraDef.perspective

  setComponent(entity, CameraComponent, {
    fov: MathUtils.radToDeg(perspectiveCamera.yfov),
    aspect: perspectiveCamera.aspectRatio || 1,
    near: perspectiveCamera.znear || 1,
    far: perspectiveCamera.zfar || 2e6
  })
}

const loadSkin = async (options: GLTFParserOptions, nodeEntity: Entity, nodeIndex: number) => {
  const json = options.document
  const nodeDef = json.nodes![nodeIndex]
  const skinDef = json.skins![nodeDef.skin!]

  const [skinnedMesh, inverseBindMatrices, ...jointNodes] = (await Promise.all([
    getDependency(options, 'mesh', nodeEntity, nodeIndex, nodeDef.mesh),
    getDependency(options, 'accessor', skinDef.inverseBindMatrices!),
    ...skinDef.joints.map((joint) => getDependency(options, 'node', joint))
  ])) as [SkinnedMesh, BufferAttribute, ...Entity[]]
  if (!inverseBindMatrices) throw new Error('GLTFLoader: Inverse bind matrices not found')
  const jointBones = jointNodes.map((entity) => getComponent(entity, BoneComponent))

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
      console.warn('Joint "%s" could not be found.', skinDef.joints[i])
    }
  }

  const skeleton = new Skeleton(bones, boneInverses)
  skinnedMesh.skeleton = skeleton
}

const loadNode = async (options: GLTFParserOptions, nodeIndex: number) => {
  const json = options.document

  const nodeDef = json.nodes![nodeIndex]

  const layerID = LayerComponent.get(options.entity)

  const nodeID = getNodeID(nodeDef, options.documentID, nodeIndex)
  const nodeEntity = createEntity(layerID)
  setComponent(nodeEntity, NodeIDComponent, nodeID)
  const uuid = NodeIDComponent.getUUIDBySourceAndNodeID(options.documentID, nodeID)
  setComponent(nodeEntity, SourceComponent, options.documentID)

  setComponent(nodeEntity, UUIDComponent, uuid)
  setComponent(nodeEntity, NameComponent, nodeDef.name ?? 'Node-' + nodeIndex)
  setComponent(nodeEntity, TransformComponent)

  if (nodeDef.matrix) {
    const mat4 = new Matrix4().fromArray(nodeDef.matrix)
    const position = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()
    mat4.decompose(position, rotation, scale)
    setComponent(nodeEntity, TransformComponent, { position, rotation, scale })
  } else if (nodeDef.translation || nodeDef.rotation || nodeDef.scale) {
    const position = new Vector3().fromArray(nodeDef.translation || [0, 0, 0])
    const rotation = new Quaternion().fromArray(nodeDef.rotation || [0, 0, 0, 1])
    const scale = new Vector3().fromArray(nodeDef.scale || [1, 1, 1])
    setComponent(nodeEntity, TransformComponent, { position, rotation, scale })
  }

  /** Always set visible extension if this is not an ECS node */
  if (!nodeDef.extensions?.[NodeIDComponent.jsonID]) setComponent(nodeEntity, VisibleComponent)

  //handle legacy ECS embedding
  const extras = nodeDef.extras
  if (extras) {
    const data = [...Object.entries(extras)]
    for (const [key, value] of data) {
      const parts = key.split('.')
      if (parts.length > 1) {
        if (parts[0] === 'xrengine') {
          if (ComponentJSONIDMap.has(parts[1])) {
            const Component = ComponentJSONIDMap.get(parts[1])
            if (!Component) {
              console.warn('no component found for extension', parts[1])
              continue
            }
            let deserializedValue = typeof parts[2] === 'string' ? { [parts[2]]: value } : value
            if (typeof value === 'string') {
              try {
                deserializedValue = JSON.parse(value)
              } catch (e) {
                // expected
              }
            }
            deserializeComponent(nodeEntity, Component, deserializedValue)
            if (Component === ColliderComponent) removeComponent(nodeEntity, VisibleComponent)
          }
        }
      }
    }
  }

  const dependencies = [] as Promise<any>[]

  if (nodeDef.children) {
    for (let i = 0; i < nodeDef.children.length; i++) {
      const childIndex = nodeDef.children[i]
      const nodePromise = getDependency(options, 'node', childIndex)
      dependencies.push(nodePromise)
      nodePromise.then((childEntity) => {
        setComponent(childEntity, EntityTreeComponent, {
          parentEntity: nodeEntity,
          childIndex: i
        })
      })
    }
  }

  if (typeof nodeDef.mesh !== 'undefined') {
    const meshPromise = getDependency(options, 'mesh', nodeEntity, nodeIndex, nodeDef.mesh)
    dependencies.push(meshPromise)
    if (!hasComponent(nodeEntity, ColliderComponent)) setComponent(nodeEntity, VisibleComponent)
  } else if (isBoneNode(json, nodeIndex)) {
    const bone = new Bone()
    // bone.name = node.name ?? 'Node-' + i
    setComponent(nodeEntity, BoneComponent, bone)
    removeComponent(nodeEntity, VisibleComponent) // remove visible so it isn't rendered
  } else {
    const obj3d = new Object3D()
    // obj3d.name = node.name ?? 'Node-' + i
    setComponent(nodeEntity, ObjectComponent, obj3d)
  }

  if (typeof nodeDef.skin === 'number') {
    dependencies.push(getDependency(options, 'skin', nodeEntity, nodeIndex))
  }

  if (nodeDef.camera !== undefined) {
    getDependency(options, 'camera', nodeEntity, nodeIndex)
  }

  await Promise.all(dependencies)

  const extensionPending = [] as Promise<void>[]

  // add all extensions for synchronous mount
  if (nodeDef.extensions) {
    for (const extension in nodeDef.extensions) {
      const Component = ComponentJSONIDMap.get(extension) as any // todo
      if (!Component) continue
      if (Component === ColliderComponent) {
        removeComponent(nodeEntity, VisibleComponent)
      }
      deserializeComponent(nodeEntity, Component, nodeDef.extensions[extension])
      if (typeof Component.loadNode === 'function') {
        extensionPending.push(Component.loadNode(options, nodeIndex))
      }
    }
  }

  await Promise.all(extensionPending)

  return nodeEntity
}

const loadScene = async (options: GLTFParserOptions, sceneIndex: number) => {
  const json = options.document

  DependencyCache.set(options.url, new Map())

  const sceneDef = json.scenes![sceneIndex]

  const nodeIds = sceneDef.nodes || []

  const pending = [] as Promise<Entity>[]

  for (let i = 0, il = nodeIds.length; i < il; i++) {
    pending.push(getDependency(options, 'node', nodeIds[i]) as Promise<Entity>)
  }

  const animationPromises = [] as Promise<AnimationClip>[]

  const animations = json.animations || []
  for (let i = 0, il = animations.length; i < il; i++) {
    const animation = getDependency(options, 'animation', i) as Promise<AnimationClip>
    animationPromises.push(animation)
  }

  const loadedNodeEntities = await Promise.all(pending)

  for (const entity of loadedNodeEntities) {
    setComponent(entity, EntityTreeComponent, { parentEntity: options.entity })
    iterateEntityNode(entity, computeTransformMatrix, (e) => hasComponent(e, TransformComponent))
  }

  const rootEntity = options.entity
  /** @todo this is a temporary hack */
  if (!hasComponent(rootEntity, ObjectComponent)) {
    const obj3d = new Object3D()
    setComponent(rootEntity, ObjectComponent, obj3d)
  }

  const animationClips = await Promise.all(animationPromises)

  if (animationClips.length > 0) {
    // obj3d should always come from the simulation layer
    const obj3d = getComponent(
      LayerFunctions.getLayerRelationsEntities(rootEntity)?.[Layers.Simulation]?.[1] ?? rootEntity,
      ObjectComponent
    )
    obj3d.animations = animationClips
    if (!hasComponent(rootEntity, AnimationComponent)) {
      setComponent(rootEntity, AnimationComponent, {
        mixer: new AnimationMixer(obj3d),
        animations: obj3d.animations
      })
    } else {
      getMutableComponent(rootEntity, AnimationComponent).animations.merge(obj3d.animations)
    }
  }

  // dereference body non-reactively if it exists
  getComponent(options.entity, GLTFComponent).body = null
}

const unloadScene = async (url: string, entity: Entity) => {
  // handle reference counting
  unloadResourcesForEntity(entity)

  // if no more references to this url, remove from cache
  const assetCacheState = getState(AssetCacheState)
  if (!assetCacheState[url]) {
    delete interleavedBufferCache[url]
    DependencyCache.delete(url)
  }
}

export const GLTFLoaderFunctions = {
  computeBounds,
  loadPrimitive,
  loadPrimitives,
  loadAccessor,
  loadBufferView,
  loadBuffer,
  loadMaterial,
  loadMorphTargets,
  mergeMorphTargets,
  assignTexture,
  loadTexture,
  loadImageSource,
  loadTextureImage,
  loadAnimation,
  loadCamera,
  loadMesh,
  loadNode,
  loadScene,
  unloadScene
}

export const DependencyCache = new Map<string, Map<string, Promise<any>>>()

type DependencyType =
  | 'scene'
  | 'node'
  | 'mesh'
  | 'accessor'
  | 'bufferView'
  | 'buffer'
  | 'material'
  | 'texture'
  | 'skin'
  | 'animation'
  | 'camera'

/** @todo integrate this with resource tracking or something */
export const getDependency = (options: GLTFParserOptions, type: DependencyType, ...args: any[]) => {
  const url = options.url
  const cache = DependencyCache.get(url)
  if (!cache) throw new Error('GLTFLoader: No cache found for url ' + url)

  const cacheKey = type + ':' + JSON.stringify(args)
  const dependency = cache.get(cacheKey)

  if (!dependency) {
    const dep = DependencyMap[type](options, ...args)
    cache.set(cacheKey, dep)
    return dep
  }

  return dependency
}

const DependencyMap = {
  scene: loadScene,
  node: loadNode,
  mesh: loadMesh,
  accessor: loadAccessor,
  bufferView: loadBufferView,
  buffer: loadBuffer,
  material: loadMaterial,
  texture: loadTexture,
  skin: loadSkin,
  animation: loadAnimation,
  camera: loadCamera
} as Record<DependencyType, (options: GLTFParserOptions, ...args: any[]) => any>

export const getNodeID = (node: GLTF.INode, documentID: SourceID, nodeIndex: number) =>
  (node.extensions?.[NodeIDComponent.jsonID] as NodeID) ?? (`${nodeIndex}` as NodeID)

export type GLTFParserOptions = {
  url: string
  documentID: SourceID
  document: GLTF.IGLTF
  entity: Entity
  body: null | ArrayBuffer
  manager: LoadingManager
  path: string
  requestHeader: Record<string, string>
}
