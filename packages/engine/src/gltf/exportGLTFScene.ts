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

import { GLTF } from '@gltf-transform/core'
import { EntityTreeComponent, UUIDComponent } from '@ir-engine/ecs'
import {
  ComponentType,
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  serializeComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialPrototypeDefinitions,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { injectMaterialDefaults } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import {
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
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipmapLinearFilter,
  NearestMipmapNearestFilter,
  RepeatWrapping,
  Texture
} from 'three'
import { baseName, pathJoin, relativePathTo } from '../assets/functions/miscUtils'
import { STATIC_ASSET_REGEX } from '../assets/functions/pathResolver'
import { SourceComponent } from '../scene/components/SourceComponent'
import { handleScenePaths } from '../scene/functions/GLTFConversion'
import { GLTFComponent } from './GLTFComponent'
import { NodeIDComponent } from './NodeIDComponent'
import { SceneDeltaExporterExtension } from './SceneDeltaExporterExtension'

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

const THREE_TO_WEBGL = {}

THREE_TO_WEBGL[NearestFilter] = WEBGL_CONSTANTS.NEAREST
THREE_TO_WEBGL[NearestMipmapNearestFilter] = WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST
THREE_TO_WEBGL[NearestMipmapLinearFilter] = WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR
THREE_TO_WEBGL[LinearFilter] = WEBGL_CONSTANTS.LINEAR
THREE_TO_WEBGL[LinearMipmapNearestFilter] = WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST
THREE_TO_WEBGL[LinearMipmapLinearFilter] = WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR

THREE_TO_WEBGL[ClampToEdgeWrapping] = WEBGL_CONSTANTS.CLAMP_TO_EDGE
THREE_TO_WEBGL[RepeatWrapping] = WEBGL_CONSTANTS.REPEAT
THREE_TO_WEBGL[MirroredRepeatWrapping] = WEBGL_CONSTANTS.MIRRORED_REPEAT

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
  sourceID: string
  buffers: ArrayBuffer[]
  extensionsUsed: Set<string>
  exportExtensions: GLTFSceneExportExtension[]
  projectName: string
  relativePath: string
  cache: {
    meshes: Map<Mesh, number>
    materials: Map<Material, number>
    textures: Map<Texture, number>
    images: Map<ImageBitmap | string, number>
    attributes: Map<BufferAttribute | InterleavedBufferAttribute, number>
  }
}

export type ExportExtension = GLTFSceneExportExtension

export const defaultExportExtensionList = [SceneDeltaExporterExtension] as (() => ExportExtension)[]

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
    const subGeom = createSubGeometry(geometry as BufferGeometry, group.start, group.count)
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
  for (let i = 0; i < groupIndices.length; i++) {
    if (groupIndices[i] > maxIndex) {
      maxIndex = groupIndices[i]
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

  // 4) For each attribute (position, normal, uv, etc.), build the new array
  for (const attrName in originalGeometry.attributes) {
    const oldAttr = originalGeometry.attributes[attrName] as BufferAttribute
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
    subGeometry.setAttribute(attrName, newAttr)
  }

  return subGeometry
}

export async function exportGLTFScene(
  entity: Entity,
  projectName: string,
  relativePath: string,
  exportRoot = true,
  exportExtensionTypes: ExportExtension[] = defaultExportExtensionList.map((ext) => ext())
) {
  const exportExtensions = exportExtensionTypes //.map((ext) => new ext())

  const gltf = {
    asset: { generator: 'IREngine.SceneExporter', version: '2.0' },
    nodes: [] as GLTF.INode[],
    scene: 0,
    scenes: [{ nodes: [] }] as GLTF.IScene[]
  } as GLTF.IGLTF

  for (const extension of exportExtensions) extension.before?.(entity, gltf)

  const cache = {
    meshes: new Map<Mesh, number>(),
    materials: new Map<Material, number>(),
    textures: new Map<Texture, number>(),
    images: new Map<ImageBitmap | string, number>(),
    attributes: new Map<BufferAttribute | InterleavedBufferAttribute, number>()
  }

  const context: GLTFSceneExportContext = {
    sourceID: hasComponent(entity, GLTFComponent)
      ? GLTFComponent.getInstanceID(entity)
      : getComponent(entity, SourceComponent),
    buffers: [] as ArrayBuffer[],
    extensionsUsed: new Set<string>(),
    exportExtensions,
    projectName,
    relativePath,
    cache
  }

  if (exportRoot) {
    const rootIndex = await exportGLTFSceneNode(entity, gltf, context)
    if (typeof rootIndex === 'number') gltf.scenes![0].nodes.push(rootIndex)
  } else {
    const indices: number[] = []
    const children = getComponent(entity, EntityTreeComponent).children
    for (const child of children) {
      const index = await exportGLTFSceneNode(child, gltf, context)
      if (typeof index === 'number') indices.push(index)
    }
    gltf.scenes![0].nodes.push(...indices)
  }

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

  if (!gltf) return []

  // const blob = [new Blob([JSON.stringify(gltf, null, 2)], { type: 'application/gltf+json' })]
  // const gltfFile = new File(blob, relativePath)
  return [gltf, ...files]
}

const _diffMatrix = new Matrix4()
const _transformMatrix = new Matrix4()

const exportMesh = async (mesh: Mesh, gltf: GLTF.IGLTF, context: GLTFSceneExportContext): Promise<number> => {
  if (context.cache.meshes.has(mesh)) return context.cache.meshes.get(mesh)!
  const subMeshes = splitMeshByMaterials(mesh)

  const meshDef: GLTF.IMesh = {
    primitives: [] as GLTF.IMeshPrimitive[]
  }
  const targets = []

  // Conversion between attributes names in threejs and gltf spec
  const nameConversion = {
    uv: 'TEXCOORD_0',
    uv1: 'TEXCOORD_1',
    color: 'COLOR_0',
    skinWeight: 'WEIGHTS_0',
    skinIndex: 'JOINTS_0'
  }

  for (const subMesh of subMeshes) {
    const attributes: Record<string, number> = {}
    const geometry = subMesh.geometry
    for (const attributeName in geometry.attributes) {
      if (attributeName.slice(0, 5) === 'morph') continue

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

    // const isMultiMaterial = Array.isArray(mesh.material)

    // const materials: Material[] = isMultiMaterial ? (mesh.material as Material[]) : [mesh.material as Material]
    // const groups = isMultiMaterial ? geometry.groups : [{ materialIndex: 0, start: undefined, count: undefined }]

    // for (let i = 0; i < groups.length; i++) {
    const primitiveDef: GLTF.IMeshPrimitive = {
      attributes
    }

    // const group = groups[i]

    if (geometry.index !== null) {
      // if (context.cache.attributes.has(geometry.index)) {
      //   primitiveDef.indices = context.cache.attributes.get(geometry.index)!
      // } else {
      primitiveDef.indices = exportAccessor(geometry.index, gltf, context, geometry) //, group.start, group.count)
      // context.cache.attributes.set(geometry.index, primitiveDef.indices)
      // }
    }

    if (subMesh.material) {
      const material = subMesh.material as Material
      const materialIndex = await exportMaterial(material, gltf, context)
      if (materialIndex !== null) primitiveDef.material = materialIndex
    }

    meshDef.primitives.push(primitiveDef)
  }

  gltf.meshes ??= []
  const meshIndex = gltf.meshes.length
  gltf.meshes.push(meshDef)

  context.cache.meshes.set(mesh, meshIndex)

  return meshIndex
}

const toDeInterleaved = (attribute: InterleavedBufferAttribute): BufferAttribute => {
  return attribute.clone(undefined)
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

  const minMax = getMinMax(attribute as BufferAttribute, start, count)

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
  const accessorIndex = gltf.accessors!.length
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

  const bufferViewIndex = gltf.bufferViews!.length
  gltf.bufferViews.push(bufferViewDef)

  return bufferViewIndex
  // this.byteOffset += byteLength;
}

const exportBuffer = (buffer: ArrayBuffer, gltf: GLTF.IGLTF, context: GLTFSceneExportContext): number => {
  gltf.buffers ??= []
  const bufferDef: GLTF.IBuffer = {
    byteLength: buffer.byteLength
  }
  const bufferIndex = gltf.buffers!.length
  gltf.buffers.push(bufferDef)
  context.buffers.push(buffer)
  return bufferIndex
}

const exportMaterial = async (
  material: Material,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): Promise<number | null> => {
  const cache = context.cache.materials
  if (cache.has(material)) return cache.get(material)!

  const materialEntityUUID = material.uuid as EntityUUID

  //do not export fallback material
  if (materialEntityUUID === MaterialStateComponent.fallbackMaterialUUID) return null

  const materialEntity = UUIDComponent.getEntityByUUID(materialEntityUUID)
  if (materialEntity === UndefinedEntity) {
    return null
  }
  const materialDef: GLTF.IMaterial = {}

  materialDef.name = getComponent(materialEntity, NameComponent)

  if (material.transparent) {
    materialDef.alphaMode = 'BLEND'
  } else {
    if (material.alphaTest > 0) {
      materialDef.alphaMode = 'MASK'
      materialDef.alphaCutoff = material.alphaTest
    } else {
      materialDef.alphaMode = 'OPAQUE'
    }
  }

  if (material.side === DoubleSide) materialDef.doubleSided = true

  const argData = injectMaterialDefaults(materialEntityUUID)
  if (!argData) {
    throw new Error('Unsupported material ' + material)
  }
  const result: any = {}
  for (const [field, value] of Object.entries(argData)) {
    const argEntry = {
      type: value.type,
      contents: material[field]
    }
    if (value.type === 'texture' && material[field]) {
      if (field === 'envMap') continue //for skipping environment maps which cause errors
      if ((material[field] as CubeTexture).isCubeTexture) continue //for skipping environment maps which cause errors
      const texture = material[field] as Texture
      const textureIndex = await exportTexture(texture, gltf, context)
      if (typeof textureIndex !== 'number') continue
      argEntry.contents = {
        index: textureIndex,
        texCoord: texture.channel
      }
    }
    result[field] = argEntry
  }
  const materialComponent = getComponent(materialEntity, MaterialStateComponent)
  const prototype = getState(MaterialPrototypeDefinitions)[materialComponent.material.type]
  //@todo: plugins
  materialDef.extensions = materialDef.extensions ?? {}
  materialDef.extensions['EE_material'] = {
    uuid: getComponent(materialEntity, NodeIDComponent),
    name: getComponent(materialEntity, NameComponent),
    prototype: prototype.prototypeConstructor.name,
    args: result,
    plugins: []
  }

  context.extensionsUsed.add('EE_material')
  gltf.materials ??= []
  const materialIndex = gltf.materials.length
  gltf.materials.push(materialDef)
  cache.set(material, materialIndex)
  return materialIndex
}

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

  const textureDef: GLTF.ITexture = {}
  textureDef.source = imageIndex
  gltf.textures ??= []

  const textureIndex = gltf.textures!.length
  gltf.textures!.push(textureDef)
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

  let imageDef = undefined as undefined | GLTF.IImage

  if (/^blob:/.test(image.src)) {
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
    const srcName = baseName(srcRelativePath)
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

const exportGLTFSceneNode = async (
  entity: Entity,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): Promise<number | void> => {
  for (const extension of context.exportExtensions) extension.beforeNode?.(entity)

  //ignore entities with no source
  if (!hasComponent(entity, SourceComponent)) return
  //ignore material entities as they get exported in exportMesh
  const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
  if (materialComponent) return

  const children = getOptionalComponent(entity, EntityTreeComponent)?.children
  const childrenIndicies = [] as number[]
  if (children && children.length > 0) {
    for (const child of children) {
      if (getComponent(child, SourceComponent) !== context.sourceID) continue
      const childIndex = await exportGLTFSceneNode(child, gltf, context)
      if (typeof childIndex === 'number') childrenIndicies.push(childIndex)
    }
  }

  const node: GLTF.INode = {}

  const meshComponent = getOptionalComponent(entity, MeshComponent)
  if (meshComponent && !meshComponent.userData['ignoreOnExport']) {
    node.mesh = await exportMesh(meshComponent, gltf, context)
  }

  gltf.nodes!.push(node)

  const index = gltf.nodes!.length - 1

  if (hasComponent(entity, NameComponent)) {
    node.name = getComponent(entity, NameComponent)
  }

  const extensions = {} as Record<string, unknown>
  const components = getAllComponents(entity)
  for (const component of components) {
    for (const extension of context.exportExtensions) extension.beforeComponent?.(entity, component, node, index)

    //skip components that don't have a jsonID
    if (!component.jsonID) continue

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
    } else if (component === MeshComponent) {
      continue
    } else {
      const compData = serializeComponent(entity, component)
      // Do we not want to serialize tag components?
      if (!compData) continue
      extensions[component.jsonID] = compData
      context.extensionsUsed.add(component.jsonID)
    }

    for (const extension of context.exportExtensions) extension.afterComponent?.(entity, component, node, index)
  }
  if (node.matrix && matrixEqualsIdentity(node.matrix)) delete node.matrix
  if (Object.keys(extensions).length > 0) node.extensions = extensions
  if (childrenIndicies.length) node.children = childrenIndicies

  for (const extension of context.exportExtensions) extension.afterNode?.(entity, node, index)

  return index
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
