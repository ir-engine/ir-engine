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
import { KHRDracoMeshCompression } from '@gltf-transform/extensions'
import {
  Component,
  ComponentJSONIDMap,
  Entity,
  EntityTreeComponent,
  EntityUUID,
  LayerComponent,
  LayerFunctions,
  Layers,
  UUIDComponent,
  deserializeComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  iterateEntityNode,
  removeComponent,
  setComponent,
  traverseEntityNode
} from '@ir-engine/ecs'
import { getMutableState, getState, isClient } from '@ir-engine/hyperflux'
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
  MaterialPrototypeDefinitions,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { setupMaterialParameters } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
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
  TypedArray,
  Vector2,
  Vector3,
  VectorKeyframeTrack
} from 'three'
import { parseStorageProviderURLs } from '../assets/functions/parseSceneJSON'
import { loadResource, unloadResourcesForEntity } from '../assets/functions/resourceLoaderFunctions'
import { getTextureAsync } from '../assets/functions/resourceLoaderHooks'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import { Loader } from '../assets/loaders/base/Loader'
import { TextureLoader } from '../assets/loaders/texture/TextureLoader'
import { AssetCacheState } from '../assets/state/AssetCacheState'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { SourceID } from '../scene/components/SourceComponent'
import {
  MATERIAL_JSON_ID,
  MATERIAL_PROTOTYPE_JSON_ID,
  SceneDeltaEntry,
  SceneDeltaRegistry,
  SceneDeltaState
} from '../scene/systems/SceneDeltaState'
import { GLTFComponent } from './GLTFComponent'
import {
  ALPHA_MODES,
  ATTRIBUTES,
  INTERPOLATION,
  PATH_PROPERTIES,
  WEBGL_COMPONENT_TYPES,
  WEBGL_FILTERS,
  WEBGL_TYPE_SIZES,
  WEBGL_WRAPPINGS
} from './GLTFConstants'
import { KHR_DRACO_MESH_COMPRESSION, getBufferIndex } from './GLTFExtensions'
import {
  GLTFCubicSplineInterpolant,
  GLTFCubicSplineQuaternionInterpolant,
  assignExtrasToUserData,
  getNormalizedComponentScale
} from './GLTFLoaderUtils'
import { KHRTextureTransformExtensionComponent, KHRUnlitExtensionComponent } from './MaterialExtensionComponents'
import { NodeID, NodeIDComponent } from './NodeIDComponent'
import { SCENE_DELTA_EXTENSION_NAME } from './SceneDeltaExporterExtension'

type ComponentExt = Component & {
  loadNode?: (options: GLTFParserOptions, nodeIndex: number) => Promise<void>
  getMaterialType?: (materialDef: GLTF.IMaterial) => any
  extendMaterialParams?: (
    options: GLTFParserOptions,
    materialParams: any,
    materialDef: GLTF.IMaterial,
    materialIndex: number
  ) => Promise<void>
}

export function getImageURIMimeType(uri) {
  if (uri.search(/\.jpe?g($|\?)/i) > 0 || uri.search(/^data:image\/jpeg/) === 0) return 'image/jpeg'
  if (uri.search(/\.webp($|\?)/i) > 0 || uri.search(/^data:image\/webp/) === 0) return 'image/webp'

  return 'image/png'
}

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
    mesh.primitives.map((primitive, index) => GLTFLoaderFunctions.loadPrimitive(options, meshIndex, index))
  )

  if (primitives.length > 1) {
    let needsTangentRecalculation = false
    for (const [geometry] of primitives) {
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

  let materialPromise: Promise<Material | MeshPhysicalMaterial>

  if (typeof materialIndex === 'number') {
    materialPromise = getDependency(options, 'material', materialIndex)
  } else {
    materialPromise = Promise.resolve(MaterialStateComponent.fallbackMaterial())
  }

  const hasDracoCompression =
    primitiveDef.extensions && (primitiveDef.extensions['KHR_draco_mesh_compression'] as KHRDracoMeshCompression)

  if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && 'COLOR_0' in primitiveDef.attributes) {
    console.warn(
      `THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`
    )
  }

  if (hasDracoCompression) {
    return new Promise((resolve) => {
      KHR_DRACO_MESH_COMPRESSION.decodePrimitive(options, primitiveDef).then((geom) => {
        GLTFLoaderFunctions.computeBounds(json, geom, primitiveDef)
        assignExtrasToUserData(geom, primitiveDef)
        materialPromise.then((material) => {
          assignFinalMaterial(primitiveDef, material as MeshPhysicalMaterial)
          resolve([geom, material])
        })
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
        new Promise<void>((resolve) => {
          getDependency(options, 'accessor', attribute).then((accessor) => {
            if (accessor) {
              geometry.setAttribute(threeAttributeName, accessor)
            }
            resolve()
          })
        })
      )
    }

    if (typeof primitiveDef.indices === 'number') {
      promises.push(
        new Promise<void>((resolve) => {
          getDependency(options, 'accessor', primitiveDef.indices!).then((accessor) => {
            if (accessor) {
              geometry.setIndex(accessor as BufferAttribute)
            }
            resolve()
          })
        })
      )
    }
    GLTFLoaderFunctions.computeBounds(json, geometry, primitiveDef)
    assignExtrasToUserData(geometry, primitiveDef)
    const [material] = await Promise.all([materialPromise, Promise.all(promises)])
    assignFinalMaterial(primitiveDef, material as MeshPhysicalMaterial)
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

  if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve()

  const pendingPositionAccessors = [] as Promise<BufferAttribute | InterleavedBufferAttribute>[]
  const pendingNormalAccessors = [] as Promise<BufferAttribute | InterleavedBufferAttribute>[]
  const pendingColorAccessors = [] as Promise<BufferAttribute | InterleavedBufferAttribute>[]

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
    return Promise.resolve(new BufferAttribute(array, itemSize, normalized))
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
  const byteOffset = accessorDef.byteOffset ?? 0
  const byteStride =
    accessorDef.bufferView !== undefined ? json.bufferViews![accessorDef.bufferView].byteStride : undefined
  const normalized = accessorDef.normalized === true
  let array: TypedArray, bufferAttribute: BufferAttribute | InterleavedBufferAttribute

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

    const byteOffsetIndices = accessorDef.sparse.indices.byteOffset ?? 0
    const byteOffsetValues = accessorDef.sparse.values.byteOffset ?? 0

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

const loadBufferView = async (options: GLTFParserOptions, bufferViewIndex: number): Promise<ArrayBuffer | null> => {
  const [bufferIndex, callback] = getBufferIndex(options, bufferViewIndex)

  const buffer = await getDependency(options, 'buffer', bufferIndex)
  if (!buffer) return Promise.resolve(null)

  return callback(buffer)
}

const loadBuffer = async (options: GLTFParserOptions, bufferIndex: number): Promise<ArrayBuffer | null> => {
  const json = options.document
  const bufferDef = json.buffers![bufferIndex]

  if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
    throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.')
  }

  const cache = DependencyCache.get(options.url)
  if (bufferDef.uri && cache?.has(bufferDef.uri)) {
    return cache.get(bufferDef.uri) as Promise<ArrayBuffer>
  }

  if (bufferDef.uri === undefined && bufferIndex === 0) {
    return Promise.resolve(options.body)
  }

  const loader = new FileLoader(options.manager)
  loader.setResponseType('arraybuffer')

  const bufferPromise = new Promise<ArrayBuffer>(function (resolve, reject) {
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
        reject(new Error('GLTFLoaderFunctions: Failed to load buffer "' + bufferDef.uri + '".'))
      },
      null!, // controller.signal,
      loader
    )
  })

  bufferDef.uri && cache?.set(bufferDef.uri, bufferPromise)
  return bufferPromise
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

  let materialConstructorParameters = {} as any
  const promises = [] as Promise<void>[]
  const materialExtensions = materialDef.extensions || {}

  let materialConstructor = MeshStandardMaterial
  if (!materialExtensions['EE_material'] && materialExtensions['KHR_materials_unlit']) {
    const kmuExtension = KHRUnlitExtensionComponent
    materialConstructor = kmuExtension.getMaterialType() as any
    promises.push(kmuExtension.extendMaterialParams(options, materialConstructorParameters, materialDef))
  } else {
    materialConstructorParameters.color = new Color(1.0, 1.0, 1.0)
    materialConstructorParameters.opacity = 1.0

    if (typeof materialDef.pbrMetallicRoughness?.baseColorTexture !== 'undefined') {
      promises.push(
        GLTFLoaderFunctions.assignTexture(options, materialDef.pbrMetallicRoughness.baseColorTexture).then((map) => {
          if (map) {
            map.colorSpace = SRGBColorSpace
            materialConstructorParameters.map = map
          }
        })
      )
    }

    if (typeof materialDef.pbrMetallicRoughness?.baseColorFactor !== 'undefined') {
      if (Array.isArray(materialDef.pbrMetallicRoughness?.baseColorFactor)) {
        const array = materialDef.pbrMetallicRoughness.baseColorFactor
        materialConstructorParameters.color = new Color().setRGB(array[0], array[1], array[2], LinearSRGBColorSpace)
        materialConstructorParameters.opacity = array[3]
      }
    }
    materialConstructorParameters.metalness =
      materialDef.pbrMetallicRoughness?.metallicFactor !== undefined
        ? materialDef.pbrMetallicRoughness.metallicFactor
        : 1.0

    materialConstructorParameters.roughness =
      materialDef.pbrMetallicRoughness?.roughnessFactor !== undefined
        ? materialDef.pbrMetallicRoughness.roughnessFactor
        : 1.0

    if (typeof materialDef.pbrMetallicRoughness?.metallicRoughnessTexture !== 'undefined') {
      promises.push(
        GLTFLoaderFunctions.assignTexture(options, materialDef.pbrMetallicRoughness.metallicRoughnessTexture).then(
          (metalnessMap) => {
            if (metalnessMap) {
              materialConstructorParameters.metalnessMap = metalnessMap
            }
          }
        )
      )
    }

    if (typeof materialDef.pbrMetallicRoughness?.metallicRoughnessTexture !== 'undefined') {
      promises.push(
        GLTFLoaderFunctions.assignTexture(options, materialDef.pbrMetallicRoughness.metallicRoughnessTexture).then(
          (roughnessMap) => {
            if (roughnessMap) {
              materialConstructorParameters.roughnessMap = roughnessMap
            }
          }
        )
      )
    }
  }

  materialConstructorParameters.side = materialDef.doubleSided === true ? DoubleSide : FrontSide

  const alphaMode = materialDef.alphaMode ?? ALPHA_MODES.OPAQUE
  materialConstructorParameters.transparent = alphaMode === ALPHA_MODES.BLEND

  // See: https://github.com/mrdoob/three.js/issues/17706
  if (alphaMode === ALPHA_MODES.BLEND) {
    materialConstructorParameters.depthWrite = false
  }

  if (materialDef.alphaMode === ALPHA_MODES.MASK) {
    materialConstructorParameters.alphaTest =
      typeof materialDef.alphaCutoff === 'number' ? materialDef.alphaCutoff : 0.5
  } else {
    materialConstructorParameters.alphaTest = 0
  }

  if (typeof materialDef.normalTexture !== 'undefined') {
    promises.push(
      GLTFLoaderFunctions.assignTexture(options, materialDef.normalTexture).then((normalMap) => {
        if (normalMap) {
          materialConstructorParameters.normalMap = normalMap
        }
      })
    )
  }

  if (materialDef.normalTexture?.scale) {
    const scale = materialDef.normalTexture.scale
    materialConstructorParameters.normalScale = new Vector2(scale, scale)
  } else {
    materialConstructorParameters.normalScale = new Vector2(1, 1)
  }

  if (typeof materialDef.occlusionTexture !== 'undefined') {
    promises.push(
      GLTFLoaderFunctions.assignTexture(options, materialDef.occlusionTexture).then((aoMap) => {
        if (aoMap) {
          materialConstructorParameters.aoMap = aoMap
        }
      })
    )
  }

  materialConstructorParameters.aoMapIntensity = materialDef.occlusionTexture?.strength ?? 1.0

  const emissiveFactor = materialDef.emissiveFactor
  if (emissiveFactor) {
    materialConstructorParameters.emissive = new Color().setRGB(
      emissiveFactor[0],
      emissiveFactor[1],
      emissiveFactor[2],
      LinearSRGBColorSpace
    )
  }

  if (typeof materialDef.emissiveTexture !== 'undefined') {
    promises.push(
      GLTFLoaderFunctions.assignTexture(options, materialDef.emissiveTexture).then((emissiveMap) => {
        if (emissiveMap) {
          emissiveMap.colorSpace = SRGBColorSpace
          materialConstructorParameters.emissiveMap = emissiveMap
        }
      })
    )
  }

  const extensions = Object.entries(materialDef.extensions || {})

  await Promise.all(promises)

  const extensionPromises = [] as Promise<void>[]

  for (const [extensionName, extension] of extensions) {
    const Component = ComponentJSONIDMap.get(extensionName) as ComponentExt
    if (!Component) continue
    deserializeComponent(materialEntity, Component, extension)
    if (typeof Component.getMaterialType === 'function') {
      const ext = Component.getMaterialType(materialDef)
      if (ext) materialConstructor = ext
      else console.warn('GLTFLoaderFunctions: Material type not found.')
    }
    if (typeof Component.extendMaterialParams === 'function') {
      extensionPromises.push(
        Component.extendMaterialParams(options, materialConstructorParameters, materialDef, materialIndex)
      )
    }
  }

  await Promise.all(extensionPromises)

  const deltaPromises = [] as Promise<void>[]
  //apply deltas
  const deltaState = getState(SceneDeltaState)
  const sourceDelta = deltaState[getComponent(options.entity, NodeIDComponent)]

  if (sourceDelta) {
    const nodeID = getComponent(materialEntity, NodeIDComponent)
    const nodeDelta = sourceDelta[nodeID]
    if (nodeDelta) {
      const materialDelta = nodeDelta[MATERIAL_JSON_ID]
      const materialPrototype = nodeDelta[MATERIAL_PROTOTYPE_JSON_ID]
      if (materialDelta && materialPrototype) {
        const prototype = getState(MaterialPrototypeDefinitions)[materialPrototype]
        materialConstructor = prototype.prototypeConstructor
        // optionally serializing the uuid to determine if we need to replace the material -
        // this is insanely brittle but will do for now
        if (materialDelta.uuid || materialPrototype) materialConstructorParameters = {}

        for (const key in materialDelta) {
          if (materialDelta[key] === null) continue
          switch (prototype.arguments[key]?.type) {
            case 'color':
              materialConstructorParameters[key] = new Color(materialDelta[key])
              break
            case 'texture':
              deltaPromises.push(
                getTextureAsync(materialDelta[key]).then(([texture]) => {
                  if (texture) {
                    texture.colorSpace = SRGBColorSpace
                    materialConstructorParameters[key] = texture
                  }
                })
              )
              break
            default:
              materialConstructorParameters[key] = materialDelta[key]
              break
          }
        }
      }
    }
  }

  await Promise.all(deltaPromises)

  const material = new materialConstructor(materialConstructorParameters)
  const uuid = getComponent(materialEntity, UUIDComponent)
  material.uuid = uuid
  material.name = materialDef.name ?? 'Material-' + materialIndex

  setComponent(materialEntity, MaterialStateComponent, { material })
  setupMaterialParameters(materialEntity, {
    ...materialConstructorParameters,
    uuid: material.uuid,
    name: material.name
  })

  assignExtrasToUserData(material, materialDef)

  return material
}

const mergeMorphTargets = async (options: GLTFParserOptions, nodeIndex: number) => {
  const json = options.document
  const node = json.nodes![nodeIndex]
  const mesh = json.meshes![node.mesh!]

  const morphTargetsPromise = [] as Promise<Record<string, BufferAttribute[]> | null>[]

  mesh.primitives.forEach((primitive) => {
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

  const loadedMorphTargets = morphTargets[0]
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

  return loadedMorphTargets
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
  const basisu = extensions && (extensions['KHR_texture_basisu'] as KHRTextureBasisu)

  /** @todo properly support texture extensions, this is a hack */
  const sourceIndex =
    (extensions && Object.values(extensions).find((ext) => typeof ext.source === 'number')?.source) ??
    textureDef.source!
  const sourceDef = typeof sourceIndex === 'number' ? json.images![sourceIndex] : null

  const handler = typeof sourceDef?.uri === 'string' && options.manager.getHandler(sourceDef.uri)
  let loader: Loader<unknown, string>

  if (basisu) loader = getState(AssetLoaderState).ktx2Loader as unknown as Loader
  else if (handler) loader = handler as Loader<unknown, string>
  else {
    const textureLoader = new TextureLoader(undefined, undefined, false)
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
  loader: Loader
) => {
  const json = options.document

  const textureDef = json.textures![textureIndex]
  const sourceDef = json.images![sourceIndex]

  const texture = await GLTFLoaderFunctions.loadImageSource(options, sourceIndex, loader)

  if (!texture || !sourceDef || !textureDef) return

  texture.flipY = false

  texture.name = textureDef.name ?? sourceDef.name ?? ''

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

const loadImageSource = async (options: GLTFParserOptions, sourceIndex: number, loader: Loader) => {
  const json = options.document
  const sourceDef = json.images![sourceIndex]

  let sourceURI = sourceDef.uri ?? ''
  let isObjectURL = false

  if (sourceDef.bufferView !== undefined) {
    if (!isClient) {
      const texture = new Texture()
      texture.userData.mimeType = sourceDef.mimeType ?? getImageURIMimeType(sourceDef.uri)
      return Promise.resolve(texture)
    }
    // Load binary image data from bufferView, if provided.

    sourceURI = await getDependency(options, 'bufferView', sourceDef.bufferView).then(function (bufferView) {
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
        reject(err as Error)
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

  texture.userData.mimeType = sourceDef.mimeType ?? getImageURIMimeType(sourceDef.uri)

  return texture
}

declare module '@gltf-transform/core' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace GLTF {
    interface IBuffer {
      type?: string
    }
    interface IAnimation {
      parameters?: any
    }
  }
}

const loadAnimation = async (options: GLTFParserOptions, animationIndex: number) => {
  const json = options.document

  const animationDef = json.animations![animationIndex]
  const animationName = animationDef.name ? animationDef.name : 'animation_' + animationIndex

  const pendingNodes = [] as Promise<Entity>[]
  const pendingInputAccessors = [] as Promise<BufferAttribute | InterleavedBufferAttribute>[]
  const pendingOutputAccessors = [] as Promise<BufferAttribute | InterleavedBufferAttribute>[]
  const samplers = [] as GLTF.IAnimationSampler[]
  const targets = [] as GLTF.IAnimationChannelTarget[]

  for (let i = 0, il = animationDef.channels.length; i < il; i++) {
    const channel = animationDef.channels[i]
    const sampler = animationDef.samplers[channel.sampler]
    const target = channel.target
    const name = target.node
    const input = animationDef.parameters !== undefined ? animationDef.parameters[sampler.input] : sampler.input
    const output = animationDef.parameters !== undefined ? animationDef.parameters[sampler.output] : sampler.output

    if (name === undefined) continue

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
      for (const createdTrack of createdTracks) {
        tracks.push(createdTrack)
      }
    }
  }

  return new AnimationClip(animationName, undefined, tracks)
}

const _createAnimationTracks = (
  node: Entity,
  inputAccessor: BufferAttribute | InterleavedBufferAttribute,
  outputAccessor: BufferAttribute | InterleavedBufferAttribute,
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

const _getArrayFromAccessor = (accessor: BufferAttribute | InterleavedBufferAttribute) => {
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
  const node = nodes[nodeIndex]

  const cameraDef = json.cameras![node.camera!]

  if (cameraDef.type === 'orthographic' || !cameraDef.perspective) {
    // const camera = new OrthographicCamera(-params.xmag, params.xmag, params.ymag, -params.ymag, params.znear, params.zfar)
    return console.warn('Orthographic cameras not supported yet')
  }

  const perspectiveCamera = cameraDef.perspective

  setComponent(entity, CameraComponent, {
    fov: MathUtils.radToDeg(perspectiveCamera.yfov),
    aspect: perspectiveCamera.aspectRatio ?? 1,
    near: perspectiveCamera.znear ?? 1,
    far: perspectiveCamera.zfar ?? 2e6
  })
}

const loadSkin = async (options: GLTFParserOptions, nodeEntity: Entity, nodeIndex: number) => {
  const json = options.document
  const nodeDef = json.nodes![nodeIndex]
  const skinDef = json.skins![nodeDef.skin!]

  const [skinnedMesh, inverseBindMatrices, ...jointNodes] = (await Promise.all([
    getDependency(options, 'mesh', nodeEntity, nodeIndex, nodeDef.mesh!),
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
  // Make sure skeleton is propagated to simulation layer
  setComponent(skinnedMesh.entity, SkinnedMeshComponent, skinnedMesh)
}

const loadNode = async (options: GLTFParserOptions, nodeIndex: number) => {
  const json = options.document

  const nodeDef = json.nodes![nodeIndex]

  const layerID = LayerComponent.get(options.entity)

  const nodeID = getNodeID(nodeDef, options.documentID, nodeIndex)
  const nodeEntity = NodeIDComponent.create(options.documentID, nodeID, layerID)

  setComponent(nodeEntity, NameComponent, nodeDef.name ?? 'Node-' + nodeIndex)

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
  } else {
    setComponent(nodeEntity, TransformComponent)
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
  } else if (isBoneNode(json, nodeIndex)) {
    const bone = new Bone()
    // bone.name = node.name ?? 'Node-' + i
    setComponent(nodeEntity, BoneComponent, bone)
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
      const Component = ComponentJSONIDMap.get(extension) as ComponentExt | undefined
      if (!Component) continue
      deserializeComponent(nodeEntity, Component, nodeDef.extensions[extension])
      if (typeof Component.loadNode === 'function') {
        extensionPending.push(Component.loadNode(options, nodeIndex))
      }
    }
  }

  await Promise.all(extensionPending)

  const rootNodeID = getOptionalComponent(options.entity, NodeIDComponent)

  //apply deltas if they exist in state
  const deltas = rootNodeID ? getState(SceneDeltaState)?.[rootNodeID]?.[nodeID] : null
  if (deltas) {
    for (const [componentName, delta] of Object.entries(deltas)) {
      const Component = ComponentJSONIDMap.get(componentName)
      if (!Component) continue
      deserializeComponent(nodeEntity, Component, delta as SceneDeltaEntry<typeof Component>)
    }
  }

  return nodeEntity
}

const setAnimationClips = (rootEntity: Entity, animationClips: AnimationClip[]) => {
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
}

const loadDeltas = (document: GLTF.IGLTF) => {
  const deltas = document.extensions?.[SCENE_DELTA_EXTENSION_NAME] as SceneDeltaRegistry | null
  if (deltas) {
    const parsedDeltas = parseStorageProviderURLs(deltas)
    getMutableState(SceneDeltaState).merge(parsedDeltas)
  }
}

const loadGLTFDependencies = (options: GLTFParserOptions) => {
  const gltf = options.document
  const deps = [] as Promise<any>[]

  for (let i = 0, len = gltf.textures?.length ?? 0; i < len; i++) {
    deps.push(getDependency(options, 'texture', i))
  }

  for (let i = 0, len = gltf.materials?.length ?? 0; i < len; i++) {
    deps.push(getDependency(options, 'material', i))
  }

  return deps
}

const loadScene = async (options: GLTFParserOptions, sceneIndex: number) => {
  const json = options.document
  const rootEntity = options.entity

  // load deltas into state before anything else
  loadDeltas(json)

  DependencyCache.set(options.url, new Map())

  const sceneDef = json.scenes?.[sceneIndex] ?? ({} as GLTF.IScene)
  const nodeIds = sceneDef.nodes || []

  const pending = [] as Promise<Entity>[]

  for (let i = 0, il = nodeIds.length; i < il; i++) {
    pending.push(getDependency(options, 'node', nodeIds[i]))
  }

  const animationPromises = [] as Promise<AnimationClip>[]

  const animations = json.animations || []
  for (let i = 0, il = animations.length; i < il; i++) {
    const animation = getDependency(options, 'animation', i)
    animationPromises.push(animation)
  }

  const loadedNodeEntities = await Promise.all(pending)
  await Promise.all(loadGLTFDependencies(options))

  for (const entity of loadedNodeEntities) {
    setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
    iterateEntityNode(
      entity,
      (e) => {
        computeTransformMatrix(e)
        TransformComponent.dirty[e] = 1
      },
      (e) => hasComponent(e, TransformComponent)
    )
  }

  /** @todo this is a temporary hack */
  if (!hasComponent(rootEntity, ObjectComponent)) {
    const obj3d = new Object3D()
    setComponent(rootEntity, ObjectComponent, obj3d)
  }

  const animationClips = await Promise.all(animationPromises)
  setAnimationClips(rootEntity, animationClips)

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
}

type DependencyKey = keyof typeof DependencyMap

type ExcludeFirst<T extends any[]> = T extends [infer First, ...infer Rest extends any[]] ? Rest : never

/** @todo integrate this with resource tracking or something */
export const getDependency = <
  Type extends DependencyKey,
  Func extends (typeof DependencyMap)[Type],
  Args extends ExcludeFirst<[...Parameters<Func>]>
>(
  options: GLTFParserOptions,
  type: Type,
  ...args: Args
) => {
  const url = options.url
  const cache = DependencyCache.get(url)
  if (!cache) throw new Error('GLTFLoader: No cache found for url ' + url)

  const cacheKey = type + ':' + JSON.stringify(args)
  const dependency = cache.get(cacheKey) as ReturnType<Func> | undefined

  if (!dependency) {
    const dep = (DependencyMap[type] as (...args: any[]) => ReturnType<Func>)(options, ...args)
    cache.set(cacheKey, dep)
    return dep
  }

  return dependency
}

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

const validateVersionFormat = (vers: string): boolean => /^[0-9]{1,10}.[0-9]{1,10}$/.test(vers)

function validateVersionGreaterThan(vers1: string, vers2: string): boolean {
  const [major1, minor1] = vers1.split('.').map(Number)
  const [major2, minor2] = vers2.split('.').map(Number)
  return major1 > major2 || (major1 === major2 && minor1 > minor2)
}

function validateAsset(asset: GLTF.IAsset) {
  // glTF.asset.version
  if (asset.version === undefined) throw new Error('glTF.asset.version MUST be defined.')
  if (!GLTFValidate.versionFormat(asset.version))
    throw new Error('glTF.asset.version MUST respect the format ^[0-9]+.[0-9]+$.')
  if (asset.version !== '2.0') throw new Error('glTF.asset.version MUST be "2.0".')

  // glTF.asset.copyright
  if (asset.copyright !== undefined) {
    // MAY be undefined
    if (typeof asset.copyright !== 'string') throw new Error('glTF.asset.copyright MUST be a string.')
  }

  // glTF.asset.generator
  if (asset.generator !== undefined) {
    // MAY be undefined
    if (typeof asset.generator !== 'string') throw new Error('glTF.asset.generator MUST be a string.')
  }

  // glTF.asset.minVersion
  if (asset.minVersion !== undefined) {
    // MAY be undefined
    if (typeof asset.minVersion !== 'string') throw new Error('glTF.asset.minVersion MUST be a string.')
    if (!GLTFValidate.versionFormat(asset.minVersion))
      throw new Error('glTF.asset.minVersion MUST respect the format ^[0-9]+.[0-9]+$.')
    if (GLTFValidate.versionGreaterThan(asset.minVersion, asset.version))
      throw new Error('glTF.asset.minVersion MUST NOT be greater than Asset.version.')
  }

  // glTF.asset.extensions
  if (asset.extensions !== undefined) {
    // MAY be undefined
    if (typeof asset.extensions !== 'object') throw new Error('glTF.asset.extensions MUST be a JSON object.')
  }

  // glTF.asset.extras
  if (asset.extras !== undefined) {
    /* ignored */
  } // MAY be undefined
}

export const GLTFValidate = {
  versionFormat: validateVersionFormat,
  versionGreaterThan: validateVersionGreaterThan,
  asset: validateAsset
}
