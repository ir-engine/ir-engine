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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { GLTF } from '@gltf-transform/core'
import {
  EntityTreeComponent,
  getAncestorWithComponents,
  getChildrenWithComponents,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  ComponentType,
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  LayerComponent,
  Layers,
  serializeComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, SourceID } from '@ir-engine/ecs/src/Entity'
import { destroy, hookstate, startReactor, State, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { useEffect } from 'react'
import {
  AnimationClip,
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
  CubeTexture,
  DoubleSide,
  InterleavedBufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearMipmapNearestFilter,
  LoaderUtils,
  Material,
  MathUtils,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipmapLinearFilter,
  NearestMipmapNearestFilter,
  NumberKeyframeTrack,
  Quaternion,
  QuaternionKeyframeTrack,
  RepeatWrapping,
  SkinnedMesh,
  Texture,
  Vector3,
  VectorKeyframeTrack
} from 'three'
import { baseName, pathJoin, relativePathTo } from '../assets/functions/miscUtils'
import { STATIC_ASSET_REGEX } from '../assets/functions/pathResolver'
import { AnimationComponent, getEntityUUIDFromTrack } from '../avatar/components/AnimationComponent'
import { handleScenePaths } from '../scene/functions/GLTFConversion'
import { GLTFComponent } from './GLTFComponent'
import {
  EXTBumpExtensionComponent,
  KHRAnisotropyExtensionComponent,
  KHRClearcoatExtensionComponent,
  KHREmissiveStrengthExtensionComponent,
  KHRIorExtensionComponent,
  KHRIridescenceExtensionComponent,
  KHRSheenExtensionComponent,
  KHRSpecularExtensionComponent,
  KHRTextureTransformExtensionComponent,
  KHRTransmissionExtensionComponent,
  KHRVolumeExtensionComponent,
  MaterialColorValue,
  MaterialNumberValue,
  MaterialTextureValue,
  MaterialValue
} from './MaterialExtensionComponents'
import { overrideExporterExtension } from './overrideExporterExtension'

const WEBGL_CONSTANTS = {
  POINTS: 0x0000,
  LINES: 0x0001,
  LINE_LOOP: 0x0002,
  LINE_STRIP: 0x0003,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  TRIANGLE_FAN: 0x0006,

  BYTE: 0x1400,
  UNSIGNED_BYTE: 0x1401,
  SHORT: 0x1402,
  UNSIGNED_SHORT: 0x1403,
  INT: 0x1404,
  UNSIGNED_INT: 0x1405,
  FLOAT: 0x1406,

  ARRAY_BUFFER: 0x8892,
  ELEMENT_ARRAY_BUFFER: 0x8893,

  NEAREST: 0x2600,
  LINEAR: 0x2601,
  NEAREST_MIPMAP_NEAREST: 0x2700,
  LINEAR_MIPMAP_NEAREST: 0x2701,
  NEAREST_MIPMAP_LINEAR: 0x2702,
  LINEAR_MIPMAP_LINEAR: 0x2703,

  CLAMP_TO_EDGE: 33071,
  MIRRORED_REPEAT: 33648,
  REPEAT: 10497
}

const getMinMax = (attribute: BufferAttribute, start: number, count: number) => {
  const output = {
    min: new Array(attribute.itemSize).fill(Number.POSITIVE_INFINITY),
    max: new Array(attribute.itemSize).fill(Number.NEGATIVE_INFINITY)
  }

  for (let i = start; i < start + count; i++) {
    for (let a = 0; a < attribute.itemSize; a++) {
      let value

      if (attribute.itemSize > 4) {
        // no support for interleaved data for itemSize > 4

        value = attribute.array[i * attribute.itemSize + a]
      } else {
        if (a === 0) value = attribute.getX(i)
        else if (a === 1) value = attribute.getY(i)
        else if (a === 2) value = attribute.getZ(i)
        else if (a === 3) value = attribute.getW(i)

        if (attribute.normalized === true) {
          value = MathUtils.normalize(value, attribute.array as Float32Array)
        }
      }

      output.min[a] = Math.min(output.min[a], value)
      output.max[a] = Math.max(output.max[a], value)
    }
  }

  return output
}

const KHR_MESH_QUANTIZATION = 'KHR_mesh_quantization'

const PATH_PROPERTIES = {
  scale: 'scale',
  position: 'translation',
  quaternion: 'rotation',
  morphTargetInfluences: 'weights'
}

const DEFAULT_SPECULAR_COLOR = new Color()

// GLB constants
// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

const GLB_HEADER_BYTES = 12
const GLB_HEADER_MAGIC = 0x46546c67
const GLB_VERSION = 2

const GLB_CHUNK_PREFIX_BYTES = 8
const GLB_CHUNK_TYPE_JSON = 0x4e4f534a
const GLB_CHUNK_TYPE_BIN = 0x004e4942

export interface GLTFSceneExportExtension {
  before?: (rootEntity: Entity, gltf: GLTF.IGLTF) => void
  beforeNode?: (entity: Entity) => void
  beforeComponent?: (entity: Entity, component: ComponentType<any>, node: GLTF.INode, index: number) => void
  afterComponent?: (entity: Entity, component: ComponentType<any>, node: GLTF.INode, index: number) => void
  afterNode?: (entity: Entity, node: GLTF.INode, index: number) => void
  after?: (rootEntity: Entity, gltf: GLTF.IGLTF) => void
}

type GLTFSceneExportContext = {
  rootEntity: Entity
  sourceID: SourceID
  buffers: ArrayBuffer[]
  extensionsUsed: Set<string>
  exportExtensions: GLTFSceneExportExtension[]
  projectName: string
  relativePath: string
  entityPromises: Map<Entity, Promise<any>>
  materialPromises: State<Record<Entity, number>>
  cache: {
    entities: Map<Entity, number>
    meshes: Map<Mesh, number>
    skins: Map<SkinnedMesh, number>
    materials: Map<Material, number>
    textures: Map<Texture, number>
    images: Map<ImageBitmap | string, number>
    samplers: Map<string, number>
    attributes: Map<BufferAttribute | InterleavedBufferAttribute, number>
  }
}

export type ExportExtension = GLTFSceneExportExtension

export const defaultExportExtensionList = [overrideExporterExtension] as (() => ExportExtension)[]

type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor

/**
 * Splits a multi-material Mesh into separate Meshes (one per group).
 * Fixes the 16-bit/32-bit index buffer bug by checking maximum vertex index.
 */
export function splitMeshByMaterials(originalMesh: Mesh): Mesh[] {
  const { geometry, material } = originalMesh

  if (!geometry.groups || geometry.groups.length === 0) {
    // No groups => Just clone the mesh
    return [originalMesh.clone()]
  }

  const materialsArray = Array.isArray(material) ? material : [material]
  const outputMeshes: Mesh[] = []

  // For each group, slice out the sub-geometry
  for (const group of geometry.groups) {
    const subGeom = createSubGeometry(geometry, group.start, group.count)
    const subMaterial = group.materialIndex
      ? materialsArray[group.materialIndex] || materialsArray[0]
      : materialsArray[0]

    const subMesh = new Mesh(subGeom, subMaterial)
    subMesh.position.copy(originalMesh.position)
    subMesh.quaternion.copy(originalMesh.quaternion)
    subMesh.scale.copy(originalMesh.scale)
    subMesh.matrix.copy(originalMesh.matrix)
    subMesh.matrixWorld.copy(originalMesh.matrixWorld)

    outputMeshes.push(subMesh)
  }

  return outputMeshes
}

function createSubGeometry(originalGeometry: BufferGeometry, start: number, count: number): BufferGeometry {
  // If geometry isn't indexed, can't slice by index range
  if (!originalGeometry.index) {
    console.warn('Geometry is not indexed. Returning a clone of the full geometry.')
    return originalGeometry.clone()
  }

  const subGeometry = new BufferGeometry()
  const indexArray = originalGeometry.index.array

  // 1) Slice the relevant face indices for this group
  //    (3 indices per triangle, or more if it's quads, etc.)
  const groupIndices = indexArray.slice(start, start + count)

  // 2) Determine if we need 32-bit indices by checking the largest index
  let maxIndex = 0
  for (const index of groupIndices) {
    if (index > maxIndex) {
      maxIndex = index
    }
  }

  const needs32Bits = maxIndex > 65535

  // 3) Build a map from oldIndex -> newIndex in encounter order
  const indexMap = new Map<number, number>()
  let nextIndex = 0

  // Prepare newIndices array
  const IndexArrayType = needs32Bits ? Uint32Array : Uint16Array
  const newIndices = new IndexArrayType(groupIndices.length)

  for (let i = 0; i < groupIndices.length; i++) {
    const oldIndex = groupIndices[i]
    if (!indexMap.has(oldIndex)) {
      indexMap.set(oldIndex, nextIndex)
      nextIndex++
    }
    newIndices[i] = indexMap.get(oldIndex)!
  }

  subGeometry.setIndex(new BufferAttribute(newIndices, 1))

  const createAttribute = (oldAttr) => {
    const { itemSize } = oldAttr
    const oldArray = oldAttr.array

    // e.g. Float32Array, etc.
    const NewArrayClass = oldArray.constructor as TypedArrayConstructor
    const newArray = new NewArrayClass(indexMap.size * itemSize)

    // Fill the new attribute array
    for (const [oldIndex, newIndex] of indexMap.entries()) {
      for (let dim = 0; dim < itemSize; dim++) {
        newArray[newIndex * itemSize + dim] = oldArray[oldIndex * itemSize + dim]
      }
    }

    const newAttr = new BufferAttribute(newArray, itemSize)
    return newAttr
  }

  // 4) For each attribute (position, normal, uv, etc.), build the new array
  for (const attrName in originalGeometry.attributes) {
    const oldAttr = originalGeometry.attributes[attrName] as BufferAttribute
    const newAttr = createAttribute(oldAttr)
    subGeometry.setAttribute(attrName, newAttr)
  }

  for (const morphAttr in originalGeometry.morphAttributes) {
    const oldAttrArr = originalGeometry.morphAttributes[morphAttr]
    if (!oldAttrArr.length) continue

    const attrArr = [] as (BufferAttribute | InterleavedBufferAttribute)[]
    for (const oldAttr of oldAttrArr) {
      attrArr.push(createAttribute(oldAttr))
    }

    subGeometry.morphAttributes[morphAttr] = attrArr
  }
  subGeometry.morphTargetsRelative = originalGeometry.morphTargetsRelative

  return subGeometry
}

export async function exportGLTFScene(
  entity: Entity,
  projectName: string,
  relativePath: string,
  exportRoot = true,
  exportExtensionTypes: ExportExtension[] = defaultExportExtensionList.map((ext) => ext())
): Promise<[GLTF.IGLTF, ...File[]]> {
  const exportExtensions = exportExtensionTypes //.map((ext) => new ext())

  const gltf = {
    asset: { generator: 'IREngine.SceneExporter', version: '2.0' },
    nodes: [] as GLTF.INode[],
    scene: 0,
    scenes: [{ nodes: [] }] as GLTF.IScene[]
  } as GLTF.IGLTF

  for (const extension of exportExtensions) extension.before?.(entity, gltf)

  const cache = {
    entities: new Map<Entity, number>(),
    meshes: new Map<Mesh, number>(),
    skins: new Map<SkinnedMesh, number>(),
    materials: new Map<Material, number>(),
    textures: new Map<Texture, number>(),
    images: new Map<ImageBitmap | string, number>(),
    samplers: new Map<string, number>(),
    attributes: new Map<BufferAttribute | InterleavedBufferAttribute, number>()
  }

  const context: GLTFSceneExportContext = {
    rootEntity: entity,
    sourceID: GLTFComponent.getSourceID(entity),
    buffers: [] as ArrayBuffer[],
    extensionsUsed: new Set<string>(),
    exportExtensions,
    projectName,
    relativePath,
    materialPromises: hookstate({} as Record<Entity, number>),
    entityPromises: new Map<Entity, Promise<number | undefined>>(),
    cache
  }

  if (exportRoot) {
    context.entityPromises.set(entity, exportEntity(entity, gltf, context))
  } else {
    const children = getComponent(entity, EntityTreeComponent).children
    for (const child of children) {
      const promise = exportEntity(child, gltf, context)
      promise.then((index) => {
        if (typeof index === 'number') gltf.scenes![0].nodes.push(index)
      })
      context.entityPromises.set(child, promise)
    }
  }

  await Promise.all(context.entityPromises.values())

  const animationEntities = getChildrenWithComponents(entity, [AnimationComponent])
  const animationPromises = [exportAnimations(entity, gltf, context)] as Promise<void>[]
  for (const animEntity of animationEntities) {
    animationPromises.push(exportAnimations(animEntity, gltf, context))
  }
  await Promise.all(animationPromises)

  if (context.extensionsUsed.size) gltf.extensionsUsed = [...context.extensionsUsed]
  handleScenePaths(gltf, 'encode')

  const files: File[] = []
  //combine buffers
  if (gltf.buffers && gltf.bufferViews) {
    const totalByteLength = context.buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0)
    const mergedBuffer = new ArrayBuffer(totalByteLength)
    const mergedBufferView = new Uint8Array(mergedBuffer)
    let offset = 0
    for (const buffer of context.buffers) {
      const bufferView = new Uint8Array(buffer)
      mergedBufferView.set(bufferView, offset)
      offset += buffer.byteLength
    }
    const uri = baseName(relativePath).replace(/\.[^.]+$/, '.bin')
    gltf.buffers = [
      {
        uri,
        byteLength: totalByteLength
      }
    ]
    let currentOffset = 0
    for (let i = 0; i < gltf.bufferViews.length; i++) {
      const bufferView = gltf.bufferViews[i]
      bufferView.buffer = 0
      bufferView.byteOffset = currentOffset
      currentOffset += context.buffers[i].byteLength
    }
    const bufferBlob = [new Blob([mergedBuffer])]
    const bufferFileName = relativePath.replace(/\.[^.]+$/, '.bin')
    const bufferFile = new File(bufferBlob, bufferFileName)
    files.push(bufferFile)
  }

  for (const extension of exportExtensions) extension.after?.(entity, gltf)

  // destroy hookstate store
  destroy(context.materialPromises)

  // const blob = [new Blob([JSON.stringify(gltf, null, 2)], { type: 'application/gltf+json' })]
  // const gltfFile = new File(blob, relativePath)
  return [gltf, ...files]
}

const awaitMaterial = (materialEntity: Entity, context: GLTFSceneExportContext) => {
  if (getComponent(materialEntity, UUIDComponent).entitySourceID !== context.sourceID) return Promise.resolve(-1)
  return new Promise<number>((resolve) => {
    if (typeof context.materialPromises.value[materialEntity] === 'number')
      return resolve(context.materialPromises.value[materialEntity])
    const reactor = startReactor(() => {
      const material = useHookstate(context.materialPromises[materialEntity])
      useEffect(() => {
        if (typeof material.value === 'number') {
          resolve(material.value)
          reactor.stop()
        }
      }, [material])
      return null
    }, `awaitMaterial - ${materialEntity}`)
  })
}

const _diffMatrix = new Matrix4()
const _transformMatrix = new Matrix4()

const exportMesh = async (entity: Entity, gltf: GLTF.IGLTF, context: GLTFSceneExportContext): Promise<number> => {
  const mesh = getComponent(entity, MeshComponent)
  if (context.cache.meshes.has(mesh)) return context.cache.meshes.get(mesh)!
  const subMeshes = splitMeshByMaterials(mesh)

  const meshDef: GLTF.IMesh = {
    primitives: [] as GLTF.IMeshPrimitive[]
  }

  // Conversion between attributes names in threejs and gltf spec
  const nameConversion = {
    uv: 'TEXCOORD_0',
    uv1: 'TEXCOORD_1',
    color: 'COLOR_0',
    skinWeight: 'WEIGHTS_0',
    skinIndex: 'JOINTS_0'
  }

  if (mesh.morphTargetInfluences?.length) {
    meshDef.weights = [...mesh.morphTargetInfluences]
    if (mesh.morphTargetDictionary) {
      if (!meshDef.extras) meshDef.extras = {}
      meshDef.extras.targetNames = Object.keys(mesh.morphTargetDictionary)
    }
  }

  for (const subMesh of subMeshes) {
    const attributes: Record<string, number> = {}
    const geometry = subMesh.geometry
    for (const attributeName in geometry.attributes) {
      if (attributeName.startsWith('morph')) continue

      const attribute = geometry.attributes[attributeName]

      const convertedName = nameConversion[attributeName] || attributeName.toUpperCase()

      let attributeIndex = -1
      if (context.cache.attributes.has(attribute)) {
        attributeIndex = context.cache.attributes.get(attribute)!
      } else if (attribute instanceof InterleavedBufferAttribute) {
        attributeIndex = exportAccessor(toDeInterleaved(attribute), gltf, context)
      } else {
        attributeIndex = exportAccessor(attribute, gltf, context)
      }
      attributes[convertedName] = attributeIndex
      context.cache.attributes.set(attribute, attributeIndex)
    }

    const primitiveDef: GLTF.IMeshPrimitive = {
      attributes
    }

    if (geometry.index !== null) {
      primitiveDef.indices = exportAccessor(geometry.index, gltf, context, geometry) //, group.start, group.count)
    }

    const targets = [] as NonNullable<GLTF.IMeshPrimitive['targets']>
    if (mesh.morphTargetInfluences) {
      for (let i = 0; i < mesh.morphTargetInfluences.length; ++i) {
        for (const attributeName in geometry.morphAttributes) {
          const attribute = geometry.morphAttributes[attributeName][i]
          const gltfAttributeName = attributeName.toUpperCase()

          const accessor = exportAccessor(attribute.clone(), gltf, context, geometry)
          if (!targets[i]) targets[i] = {}
          targets[i][gltfAttributeName] = accessor
        }
      }
    }

    if (targets.length) {
      primitiveDef.targets = [...targets]
    }

    meshDef.primitives.push(primitiveDef)
  }

  const layer = LayerComponent.get(entity)

  const materialPromises = [] as Promise<void>[]

  const materialInstances = getOptionalComponent(entity, MaterialInstanceComponent)
  if (materialInstances) {
    for (let i = 0; i < materialInstances.entities.length; i++) {
      const materialEntity = materialInstances.entities[i]
      materialPromises.push(
        new Promise<void>((resolve) => {
          awaitMaterial(materialEntity, context).then((materialIndex) => {
            if (materialIndex > -1) meshDef.primitives[i].material = materialIndex
            resolve()
          })
        })
      )
    }
  }

  await Promise.all(materialPromises)

  gltf.meshes ??= []
  const meshIndex = gltf.meshes.length
  gltf.meshes.push(meshDef)

  context.cache.meshes.set(mesh, meshIndex)

  return meshIndex
}

const exportSkin = async (entity: Entity, gltf: GLTF.IGLTF, context: GLTFSceneExportContext): Promise<number> => {
  const skinnedMesh = getComponent(entity, SkinnedMeshComponent)
  if (context.cache.skins.has(skinnedMesh)) return context.cache.skins.get(skinnedMesh)!

  if (!gltf.skins) gltf.skins = []
  const skinIndex = gltf.skins.length

  const skinDef = {} as GLTF.ISkin

  const skeleton = skinnedMesh.skeleton
  const bones = skeleton.bones
  const boneInverses = skeleton.boneInverses

  if (boneInverses.length) {
    // Build inverseBindMatrices accessor
    const boneInverseArray = new Float32Array(boneInverses.length * 16)
    for (let i = 0, len = boneInverses.length; i < len; i++) {
      const boneInverseMatrixArray = boneInverses[i].toArray()
      for (let j = 0, matLen = boneInverseMatrixArray.length; j < matLen; j++) {
        boneInverseArray[i * matLen + j] = boneInverseMatrixArray[j]
      }
    }
    const boneInverseAttr = new BufferAttribute(boneInverseArray, 16)
    skinDef.inverseBindMatrices = exportAccessor(boneInverseAttr, gltf, context)
  }

  if (bones.length) {
    // Build joint nodes
    skinDef.joints = []
    for (const bone of bones) {
      const jointNode = await exportEntity(bone.entity, gltf, context)
      if (typeof jointNode === 'number') skinDef.joints.push(jointNode)
    }

    const skeletonRootEntity = getAncestorWithComponents(bones[0].entity, [BoneComponent], false)
    const skeletonNode = await exportEntity(skeletonRootEntity, gltf, context)
    if (typeof skeletonNode === 'number') {
      skinDef.skeleton = skeletonNode
    }
  }

  gltf.skins.push(skinDef)
  return skinIndex
}

const toDeInterleaved = (attribute: InterleavedBufferAttribute): BufferAttribute => {
  return attribute.clone()
}

const exportAccessor = (
  attribute: BufferAttribute,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext,
  geometry?: BufferGeometry,
  start?: number,
  count?: number
): number => {
  const cache = context.cache.attributes
  // if (cache.has(attribute)) return cache.get(attribute)!

  const types = {
    1: 'SCALAR',
    2: 'VEC2',
    3: 'VEC3',
    4: 'VEC4',
    9: 'MAT3',
    16: 'MAT4'
  }

  let componentType

  // Detect the component type of the attribute array
  if (attribute.array.constructor === Float32Array) {
    componentType = WEBGL_CONSTANTS.FLOAT
  } else if (attribute.array.constructor === Int32Array) {
    componentType = WEBGL_CONSTANTS.INT
  } else if (attribute.array.constructor === Uint32Array) {
    componentType = WEBGL_CONSTANTS.UNSIGNED_INT
  } else if (attribute.array.constructor === Int16Array) {
    componentType = WEBGL_CONSTANTS.SHORT
  } else if (attribute.array.constructor === Uint16Array) {
    componentType = WEBGL_CONSTANTS.UNSIGNED_SHORT
  } else if (attribute.array.constructor === Int8Array) {
    componentType = WEBGL_CONSTANTS.BYTE
  } else if (attribute.array.constructor === Uint8Array) {
    componentType = WEBGL_CONSTANTS.UNSIGNED_BYTE
  } else {
    throw new Error('Unsupported bufferAttribute component type.')
  }

  if (start === undefined) start = 0
  if (count === undefined) count = attribute.count

  if (count === 0) throw new Error('trying to create empty accessor')

  const minMax = getMinMax(attribute, start, count)

  let bufferViewTarget: number | null = null

  if (geometry) {
    bufferViewTarget =
      attribute === geometry.index ? WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER : WEBGL_CONSTANTS.ARRAY_BUFFER
  }

  const bufferView = exportBufferView(attribute, componentType, start, count, bufferViewTarget, gltf, context)

  const accessorDef: GLTF.IAccessor = {
    count,
    min: minMax.min,
    max: minMax.max,
    bufferView,
    componentType,
    type: types[attribute.itemSize]
  }

  if (attribute.normalized) accessorDef.normalized = true

  gltf.accessors ??= []
  const accessorIndex = gltf.accessors.length
  gltf.accessors.push(accessorDef)

  return accessorIndex
}

const getPaddedBufferSize = (bufferSize: number): number => Math.ceil(bufferSize / 4) * 4

const exportBufferView = (
  attribute: BufferAttribute,
  componentType: number,
  start: number,
  count: number,
  bufferViewTarget: number | null,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): number => {
  gltf.bufferViews ??= []
  let componentSize = -1
  switch (componentType) {
    case WEBGL_CONSTANTS.BYTE:
    case WEBGL_CONSTANTS.UNSIGNED_BYTE:
      componentSize = 1
      break
    case WEBGL_CONSTANTS.SHORT:
    case WEBGL_CONSTANTS.UNSIGNED_SHORT:
      componentSize = 2
      break
    default:
      componentSize = 4
  }

  const bufferSize = count * attribute.itemSize * componentSize
  const byteLength = getPaddedBufferSize(bufferSize)
  const dataView = new DataView(new ArrayBuffer(byteLength))
  let offset = 0
  for (let i = start; i < start + count; i++) {
    for (let a = 0; a < attribute.itemSize; a++) {
      let value

      if (attribute.itemSize > 4) {
        // no support for interleaved data for itemSize > 4

        value = attribute.array[i * attribute.itemSize + a]
      } else {
        if (a === 0) value = attribute.getX(i)
        else if (a === 1) value = attribute.getY(i)
        else if (a === 2) value = attribute.getZ(i)
        else if (a === 3) value = attribute.getW(i)

        if (attribute.normalized === true) {
          value = MathUtils.normalize(value, attribute.array as Float32Array)
        }
      }

      if (componentType === WEBGL_CONSTANTS.FLOAT) {
        dataView.setFloat32(offset, value, true)
      } else if (componentType === WEBGL_CONSTANTS.INT) {
        dataView.setInt32(offset, value, true)
      } else if (componentType === WEBGL_CONSTANTS.UNSIGNED_INT) {
        dataView.setUint32(offset, value, true)
      } else if (componentType === WEBGL_CONSTANTS.SHORT) {
        dataView.setInt16(offset, value, true)
      } else if (componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT) {
        dataView.setUint16(offset, value, true)
      } else if (componentType === WEBGL_CONSTANTS.BYTE) {
        dataView.setInt8(offset, value)
      } else if (componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE) {
        dataView.setUint8(offset, value)
      }

      offset += componentSize
    }
  }

  const bufferViewDef: GLTF.IBufferView = {
    buffer: exportBuffer(dataView.buffer, gltf, context),
    byteOffset: 0,
    byteLength: byteLength
  }

  if (bufferViewTarget !== undefined) bufferViewDef.target = bufferViewTarget ?? undefined

  if (bufferViewTarget === WEBGL_CONSTANTS.ARRAY_BUFFER) {
    // Only define byteStride for vertex attributes.
    bufferViewDef.byteStride = attribute.itemSize * componentSize
  }

  const bufferViewIndex = gltf.bufferViews.length
  gltf.bufferViews.push(bufferViewDef)

  return bufferViewIndex
}

const exportBuffer = (buffer: ArrayBuffer, gltf: GLTF.IGLTF, context: GLTFSceneExportContext): number => {
  gltf.buffers ??= []
  const bufferDef: GLTF.IBuffer = {
    byteLength: buffer.byteLength
  }
  const bufferIndex = gltf.buffers.length
  gltf.buffers.push(bufferDef)
  context.buffers.push(buffer)
  return bufferIndex
}

const _builtinMaterialDefs = {
  color: (materialDef: GLTF.IMaterial, value: MaterialColorValue) => {
    if (!materialDef.pbrMetallicRoughness) materialDef.pbrMetallicRoughness = {}
    // Set RGB array
    if (value.contents.isColor) materialDef.pbrMetallicRoughness.baseColorFactor = value.contents.toArray()
    else {
      materialDef.pbrMetallicRoughness.baseColorFactor = new Color(value.contents).toArray()
    }
    // Set A channel to GLTF default because color is just RGB
    materialDef.pbrMetallicRoughness.baseColorFactor[3] = 1
  },
  map: (materialDef: GLTF.IMaterial, value: MaterialTextureValue) => {
    if (!materialDef.pbrMetallicRoughness) materialDef.pbrMetallicRoughness = {}
    materialDef.pbrMetallicRoughness.baseColorTexture = value.contents
  },
  normalMap: (materialDef: GLTF.IMaterial, value: MaterialTextureValue) => {
    materialDef.normalTexture = value.contents
  },
  metalness: (materialDef: GLTF.IMaterial, value: MaterialNumberValue) => {
    if (!materialDef.pbrMetallicRoughness) materialDef.pbrMetallicRoughness = {}
    materialDef.pbrMetallicRoughness.metallicFactor = value.contents
  },
  metalnessMap: (materialDef: GLTF.IMaterial, value: MaterialTextureValue) => {
    if (!materialDef.pbrMetallicRoughness) materialDef.pbrMetallicRoughness = {}
    materialDef.pbrMetallicRoughness.metallicRoughnessTexture = value.contents
  },
  roughness: (materialDef: GLTF.IMaterial, value: MaterialNumberValue) => {
    if (!materialDef.pbrMetallicRoughness) materialDef.pbrMetallicRoughness = {}
    materialDef.pbrMetallicRoughness.roughnessFactor = value.contents
  },
  roughnessMap: (materialDef: GLTF.IMaterial, value: MaterialTextureValue) => {
    if (!materialDef.pbrMetallicRoughness) materialDef.pbrMetallicRoughness = {}
    materialDef.pbrMetallicRoughness.metallicRoughnessTexture = value.contents
  },
  emissive: (materialDef: GLTF.IMaterial, value: MaterialColorValue) => {
    if (value.contents.isColor) materialDef.emissiveFactor = value.contents.toArray()
    else {
      materialDef.emissiveFactor = new Color(value.contents).toArray()
    }
  },
  emissiveMap: (materialDef: GLTF.IMaterial, value: MaterialTextureValue) => {
    materialDef.emissiveTexture = value.contents
  },
  aoMap: (materialDef: GLTF.IMaterial, value: MaterialTextureValue) => {
    materialDef.occlusionTexture = value.contents
  }
} as Record<keyof MeshPhysicalMaterial, (materialDef: GLTF.IMaterial, value: MaterialValue) => void>

export const materialExtensions = [
  KHREmissiveStrengthExtensionComponent,
  KHRClearcoatExtensionComponent,
  KHRIridescenceExtensionComponent,
  KHRSheenExtensionComponent,
  KHRTransmissionExtensionComponent,
  KHRVolumeExtensionComponent,
  KHRIorExtensionComponent,
  KHRSpecularExtensionComponent,
  EXTBumpExtensionComponent,
  KHRAnisotropyExtensionComponent
]

export const materialValuesToMaterialDef = (materialValues: Record<string, MaterialValue>) => {
  const materialDef: GLTF.IMaterial = {}

  for (const key in _builtinMaterialDefs) {
    const resultValue = materialValues[key]
    if (resultValue?.contents != null) {
      _builtinMaterialDefs[key](materialDef, resultValue)
      delete materialValues[key]
    }
  }

  materialDef.extensions ??= {}
  for (const ext of materialExtensions) {
    if (typeof ext.exportMaterialExtension === 'function') {
      const extension = ext.exportMaterialExtension(materialValues)
      if (extension && Object.keys(extension).length > 0) {
        materialDef.extensions[ext.jsonID] = extension
      }
    }
  }

  return materialDef
}

export const materialToMaterialDef = async (
  material: Material,
  name: string,
  handleTexture: ((texture: Texture, field: string) => Promise<number | void> | undefined) | null = null
) => {
  const materialDef: GLTF.IMaterial = {}

  materialDef.name = name

  if (material.transparent) {
    materialDef.alphaMode = 'BLEND'
  } else if (material.alphaTest > 0) {
    materialDef.alphaMode = 'MASK'
    materialDef.alphaCutoff = material.alphaTest
  } else {
    materialDef.alphaMode = 'OPAQUE'
  }

  if (material.side === DoubleSide) materialDef.doubleSided = true

  const result: any = {}
  await Promise.all(
    Object.entries(material).map(async ([field, value]) => {
      if (value === undefined || value === null) return
      if (typeof value === 'function') return

      const argEntry = {
        type: value.type,
        contents: value
      }
      const texture = value as Texture

      if (texture.isTexture && handleTexture) {
        const textureIndex = await handleTexture(texture, field)
        if (typeof textureIndex !== 'number') return
        argEntry.contents = {
          index: textureIndex,
          texCoord: texture.channel
        }
      }
      result[field] = argEntry
    })
  )

  return { ...materialDef, ...materialValuesToMaterialDef(result) }
}

const exportMaterial = async (
  entity: Entity,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): Promise<number | null> => {
  const material = getComponent(entity, MaterialStateComponent).material

  const cache = context.cache.materials
  if (cache.has(material)) return cache.get(material)!

  const materialEntityUUID = getComponent(entity, UUIDComponent)

  //do not export fallback material
  if (
    materialEntityUUID.entityID === MaterialStateComponent.fallbackMaterialUUIDPair.entityID &&
    materialEntityUUID.entitySourceID === MaterialStateComponent.fallbackMaterialUUIDPair.entitySourceID
  )
    return null

  const materialDef: GLTF.IMaterial = await materialToMaterialDef(
    material,
    getComponent(entity, NameComponent),
    (texture, field) => {
      if (field === 'envMap') return //for skipping environment maps which cause errors
      if ((texture as CubeTexture).isCubeTexture) return //for skipping environment maps which cause errors
      return exportTexture(texture, gltf, context)
    }
  )

  materialDef.extensions ??= {}
  const components = getAllComponents(entity)
  for (const component of components) {
    if (!component.jsonID) continue
    if (component === UUIDComponent || component === NameComponent || component === EntityTreeComponent) continue
    if (materialDef.extensions[component.jsonID]) continue
    materialDef.extensions[component.jsonID] = serializeComponent(entity, component)
  }

  for (const ext in materialDef.extensions) {
    context.extensionsUsed.add(ext)
  }

  gltf.materials ??= []
  const materialIndex = gltf.materials.length
  gltf.materials.push(materialDef)
  cache.set(material, materialIndex)
  context.materialPromises[entity].set(materialIndex)
  return materialIndex
}

const GLTF_FILTERS = {
  [NearestFilter]: 9728,
  [LinearFilter]: 9729,
  [NearestMipmapNearestFilter]: 9984,
  [LinearMipmapNearestFilter]: 9985,
  [NearestMipmapLinearFilter]: 9986,
  [LinearMipmapLinearFilter]: 9987
}

const GLTF_WRAPPINGS = {
  [ClampToEdgeWrapping]: 33071,
  [MirroredRepeatWrapping]: 33648,
  [RepeatWrapping]: 10497
}

const exportSampler = (texture: Texture, gltf: GLTF.IGLTF, context: GLTFSceneExportContext): number => {
  const sampler: GLTF.ISampler = {
    magFilter: GLTF_FILTERS[texture.magFilter] as GLTF.TextureMagFilter,
    minFilter: GLTF_FILTERS[texture.minFilter] as GLTF.TextureMinFilter,
    wrapS: GLTF_WRAPPINGS[texture.wrapS] as GLTF.TextureWrapMode,
    wrapT: GLTF_WRAPPINGS[texture.wrapT] as GLTF.TextureWrapMode
  }
  // Samplers are small and mostly the same across all textures,
  // so use the sampler data as the key to keep the gltf files smaller
  const samplerStr = JSON.stringify(sampler)
  if (context.cache.samplers.has(samplerStr)) return context.cache.samplers.get(samplerStr)!

  if (!gltf.samplers) gltf.samplers = []
  const index = gltf.samplers.length
  gltf.samplers.push(sampler)
  context.cache.samplers.set(samplerStr, index)
  return index
}

const textureExtensions = [KHRTextureTransformExtensionComponent]

const exportTexture = async (
  texture: Texture,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): Promise<number | void> => {
  const cache = context.cache.textures
  if (cache.has(texture)) return cache.get(texture)!

  let mimeType = texture.userData.mimeType
  if (mimeType === 'image/webp') mimeType = 'image/png'

  const src = texture.userData.src
  const url = texture.userData.url
  if (url) {
    texture.image.src = url
  } else if (src) {
    texture.image.src = src
  }
  if (mimeType) {
    texture.image.mimeType = mimeType
  }
  if (!texture.image.src) return

  const imageIndex = await exportImage(texture.image, gltf, context)
  if (typeof imageIndex !== 'number') return

  const textureDef: GLTF.ITexture = { name: src, source: imageIndex }
  textureDef.sampler = exportSampler(texture, gltf, context)
  gltf.textures ??= []

  textureDef.extensions ??= {}
  for (const ext of textureExtensions) {
    if (typeof ext.exportTextureExtension === 'function') {
      const extension = ext.exportTextureExtension(texture)
      if (extension && Object.keys(extension).length > 0) {
        textureDef.extensions[ext.jsonID] = extension
      }
    }
  }
  if (Object.keys(textureDef.extensions).length === 0) delete textureDef.extensions

  const textureIndex = gltf.textures.length
  gltf.textures.push(textureDef)
  cache.set(texture, textureIndex)
  return textureIndex
}

const getPaddedArrayBuffer = (arrayBuffer: ArrayBuffer, paddingByte = 0) => {
  const paddedLength = getPaddedBufferSize(arrayBuffer.byteLength)

  if (paddedLength !== arrayBuffer.byteLength) {
    const array = new Uint8Array(paddedLength)
    array.set(new Uint8Array(arrayBuffer))

    if (paddingByte !== 0) {
      for (let i = arrayBuffer.byteLength; i < paddedLength; i++) {
        array[i] = paddingByte
      }
    }

    return array.buffer
  }

  return arrayBuffer
}

const exportBufferViewImage = async (
  blob: Blob,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): Promise<number> => {
  return new Promise(function (resolve) {
    const reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    reader.onloadend = function () {
      const buffer = getPaddedArrayBuffer(reader.result as ArrayBuffer)

      const bufferViewDef = {
        buffer: exportBuffer(buffer, gltf, context),
        byteOffset: 0,
        byteLength: buffer.byteLength
      }

      const bufferViewIndex = gltf.bufferViews!.length
      if (!gltf.bufferViews) gltf.bufferViews = []
      gltf.bufferViews.push(bufferViewDef)
      resolve(bufferViewIndex)
    }
  })
}

const exportImage = async (
  image: any,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): Promise<number | undefined> => {
  if (!image.src) return

  const cache = context.cache.images
  if (typeof image.src === 'string') {
    if (cache.has(image.src)) return cache.get(image.src)!
  } else if (cache.has(image)) return cache.get(image)!

  gltf.images ??= []

  let imageDef: undefined | GLTF.IImage

  if (image.src.startsWith('blob:')) {
    const canvas = new OffscreenCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    const blob = await canvas.convertToBlob({ type: image.mimeType, quality: 1 })

    const bufferViewIndex = await exportBufferViewImage(blob, gltf, context)
    imageDef = {
      mimeType: image.mimeType,
      bufferView: bufferViewIndex
    }
  } else {
    const [, dstOrgName, dstProjectName, dstInternalPath] = STATIC_ASSET_REGEX.exec(image.src)!
    const srcProjectName = context.projectName
    const dstRelativePath = pathJoin(dstOrgName, dstProjectName, dstInternalPath)
    const srcRelativePath = pathJoin(srcProjectName, context.relativePath)
    const dstName = baseName(dstRelativePath)
    const dstDir = LoaderUtils.extractUrlBase(dstRelativePath)
    const srcDir = LoaderUtils.extractUrlBase(srcRelativePath)

    const uri = pathJoin(relativePathTo(srcDir, dstDir), dstName)

    imageDef = {
      mimeType: image.mimeType,
      uri
    }
  }

  gltf.images ??= []
  const imageIndex = gltf.images.length
  gltf.images.push(imageDef)

  cache.set(image.src, imageIndex)

  return imageIndex
}

const exportEntity = async (
  entity: Entity,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): Promise<number | void> => {
  if (context.cache.entities.has(entity)) return context.cache.entities.get(entity)

  for (const extension of context.exportExtensions) extension.beforeNode?.(entity)

  //ignore entities with no source
  if (!hasComponent(entity, UUIDComponent)) return
  //ignore material entities as they get exported in exportMesh
  const materialComponent = hasComponent(entity, MaterialStateComponent)
  if (materialComponent) {
    await exportMaterial(entity, gltf, context)
    return
  }

  const node: GLTF.INode = {}
  gltf.nodes!.push(node)

  const index = gltf.nodes!.length - 1
  context.cache.entities.set(entity, index)

  if (entity === context.rootEntity) {
    gltf.scenes![0].nodes.push(index)
  }
  const entityExportPromises = [] as Promise<void>[]

  const children = getOptionalComponent(entity, EntityTreeComponent)?.children
  const childrenIndicies = [] as number[]
  if (children && children.length > 0) {
    for (const child of children) {
      if (getComponent(child, UUIDComponent).entitySourceID !== context.sourceID) continue
      const childPromise = new Promise<void>((resolve) => {
        exportEntity(child, gltf, context).then((childIndex) => {
          if (typeof childIndex === 'number') childrenIndicies.push(childIndex)
          resolve()
        })
      })
      entityExportPromises.push(childPromise)
      context.entityPromises.set(child, childPromise)
    }
  }

  const meshComponent = getOptionalComponent(entity, MeshComponent)
  if (meshComponent && !meshComponent.userData['ignoreOnExport']) {
    const meshPromise = new Promise<void>((resolve) => {
      exportMesh(entity, gltf, context).then((meshIndex) => {
        node.mesh = meshIndex
        resolve()
      })
    })
    entityExportPromises.push(meshPromise)
  }
  const skinnedMeshComponent = getOptionalComponent(entity, SkinnedMeshComponent)
  if (skinnedMeshComponent && !skinnedMeshComponent.userData['ignoreOnExport']) {
    const skinnedMeshPromise = new Promise<void>((resolve) => {
      exportSkin(entity, gltf, context).then((skinIndex) => {
        node.skin = skinIndex
        resolve()
      })
    })
    entityExportPromises.push(skinnedMeshPromise)
  }

  if (hasComponent(entity, NameComponent)) {
    node.name = getComponent(entity, NameComponent)
  }

  const extensions = {} as Record<string, unknown>
  const components = getAllComponents(entity)
  for (const component of components) {
    for (const extension of context.exportExtensions) extension.beforeComponent?.(entity, component, node, index)

    //skip components that don't have a jsonID
    if (!component.jsonID) continue

    // skip serializable components we already handle
    if (component === NameComponent || component === EntityTreeComponent) continue

    if (entity === context.rootEntity && component === GLTFComponent) continue

    if (component === TransformComponent) {
      const transform = getComponent(entity, TransformComponent)
      const parent = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity
      if (parent) {
        const parentTransform = getComponent(parent, TransformComponent)
        _diffMatrix.copy(parentTransform.matrix).invert().multiply(transform.matrix)
        node.matrix = _transformMatrix.copy(parentTransform.matrix).multiply(_diffMatrix).toArray()
      } else {
        // If no parent, position at identity, but keep scale
        node.matrix = _diffMatrix.identity().scale(transform.scale).toArray()
      }
    } else {
      const compData = serializeComponent(entity, component)
      // Do we not want to serialize tag components?
      if (compData == null) continue

      extensions[component.jsonID] = compData
      context.extensionsUsed.add(component.jsonID)
    }

    for (const extension of context.exportExtensions) extension.afterComponent?.(entity, component, node, index)
  }

  await Promise.all(entityExportPromises)

  if (node.matrix && matrixEqualsIdentity(node.matrix)) delete node.matrix
  if (Object.keys(extensions).length > 0) node.extensions = extensions
  if (childrenIndicies.length) node.children = childrenIndicies

  for (const extension of context.exportExtensions) extension.afterNode?.(entity, node, index)

  return index
}

const _trsConversionMatrix = new Matrix4()
const _trsTranslation = new Vector3()
const _trsRotation = new Quaternion()
const _trsScale = new Vector3()

const exportAnimations = async (entity: Entity, gltf: GLTF.IGLTF, context: GLTFSceneExportContext) => {
  if (
    !hasComponent(entity, AnimationComponent) ||
    getComponent(entity, UUIDComponent).entitySourceID !== context.sourceID ||
    (hasComponent(entity, AnimationComponent) && hasComponent(entity, GLTFComponent) && entity !== context.rootEntity)
  )
    return

  const animationsDef = [] as GLTF.IAnimation[]
  const animations = getComponent(entity, AnimationComponent).animations as AnimationClip[]

  for (const animation of animations) {
    const animationDef = { channels: [], samplers: [] } as GLTF.IAnimation
    animationDef.name = animation.name

    const tracks = animation.tracks
    for (let i = 0, len = tracks.length; i < len; i++) {
      const track = tracks[i]

      // Create channel
      const channelDef = { target: {} } as GLTF.IAnimationChannel
      if (track instanceof NumberKeyframeTrack) {
        channelDef.target.path = 'weights'
      } else if (track instanceof QuaternionKeyframeTrack) {
        channelDef.target.path = 'rotation'
      } else if (track instanceof VectorKeyframeTrack) {
        const isPosition = track.name.endsWith('position')
        if (isPosition) {
          channelDef.target.path = 'translation'
        } else {
          channelDef.target.path = 'scale'
        }
      }

      const targetEntity = UUIDComponent.getEntityByUUID(getEntityUUIDFromTrack(track), Layers.Authoring)
      const targetNode = await exportEntity(targetEntity, gltf, context)
      if (typeof targetNode === 'number') {
        channelDef.target.node = targetNode

        // https://github.com/KhronosGroup/glTF/issues/892
        // Animated nodes can not have a matrix property, only TRS
        const node = gltf.nodes?.[targetNode]
        if (node?.matrix) {
          const mat = _trsConversionMatrix.fromArray(node.matrix)
          mat.decompose(_trsTranslation, _trsRotation, _trsScale)
          node.translation = _trsTranslation.toArray()
          node.rotation = _trsRotation.toArray()
          node.scale = _trsScale.toArray()
          delete node.matrix
        }
      }
      channelDef.sampler = i
      animationDef.channels.push(channelDef)

      // Create sampler
      const samplerDef = {} as GLTF.IAnimationSampler
      const inputAttr = new BufferAttribute(track.times, 1)
      let outputSize = track.values.length / track.times.length
      if (channelDef.target.path === 'weights') {
        const mesh = getOptionalComponent(targetEntity, MeshComponent)
        if (mesh?.morphTargetInfluences) {
          outputSize /= mesh.morphTargetInfluences.length
        }
      }
      const outputAttr = new BufferAttribute(track.values, outputSize)
      const [input, output] = await Promise.all([
        exportAccessor(inputAttr, gltf, context),
        exportAccessor(outputAttr, gltf, context)
      ])
      samplerDef.input = input
      samplerDef.output = output

      const interpolantFunc = (track as any).createInterpolant as (any) => any
      if (interpolantFunc === track.InterpolantFactoryMethodDiscrete) {
        samplerDef.interpolation = 'STEP'
      } else if ((interpolantFunc as any).isInterpolantFactoryMethodGLTFCubicSpline) {
        samplerDef.interpolation = 'CUBICSPLINE'
      } else if (interpolantFunc === track.InterpolantFactoryMethodLinear) {
        samplerDef.interpolation = 'LINEAR'
      } else if (interpolantFunc === track.InterpolantFactoryMethodSmooth) {
        samplerDef.interpolation = 'LINEAR'
      } else {
        samplerDef.interpolation = 'LINEAR'
      }

      animationDef.samplers.push(samplerDef)
    }

    animationsDef.push(animationDef)
  }

  if (animations.length) gltf.animations = animationsDef
}

const matrixEqualsIdentity = (matrix: number[]) => {
  return (
    matrix[0] === 1 &&
    matrix[1] === 0 &&
    matrix[2] === 0 &&
    matrix[3] === 0 &&
    matrix[4] === 0 &&
    matrix[5] === 1 &&
    matrix[6] === 0 &&
    matrix[7] === 0 &&
    matrix[8] === 0 &&
    matrix[9] === 0 &&
    matrix[10] === 1 &&
    matrix[11] === 0 &&
    matrix[12] === 0 &&
    matrix[13] === 0 &&
    matrix[14] === 0 &&
    matrix[15] === 1
  )
}
