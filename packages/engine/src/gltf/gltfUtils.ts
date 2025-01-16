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
import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'

export function nodeIsChild(index: number, nodes: GLTF.INode[]) {
  for (const node of nodes) {
    if (node.children && node.children.includes(index)) return true
  }

  return false
}

const replaceUUID = (obj: object | null, prevUUID: EntityUUID, newUUID: EntityUUID) => {
  if (!obj) return
  for (const key in obj) {
    if (obj[key] === prevUUID) obj[key] = newUUID
    else if (typeof obj[key] === 'object') replaceUUID(obj[key], prevUUID, newUUID)
  }
}

export function gltfReplaceUUIDReferences(gltf: GLTF.IGLTF, prevUUID: EntityUUID, newUUID: EntityUUID) {
  if (!gltf.nodes) return

  for (const node of gltf.nodes) {
    if (!node.extensions) continue

    for (const extKey in node.extensions) {
      if (extKey === UUIDComponent.jsonID) continue

      const ext = node.extensions[extKey]
      // If a component is just a reference to a uuid
      if (ext === prevUUID) node.extensions[extKey] = newUUID
      else if (typeof ext === 'object') {
        replaceUUID(ext, prevUUID, newUUID)
      }
    }
  }
}

type GLTFAppendContext = {
  nodeTable: Record<number, number>
  meshTable: Record<number, number>
  materialTable: Record<number, number>
  cameraTable: Record<number, number>
  bufferTable: Record<number, number>
  bufferViewTable: Record<number, number>
  accessorTable: Record<number, number>
  textureTable: Record<number, number>
  imageTable: Record<number, number>
  samplerTable: Record<number, number>
  skinTable: Record<number, number>
}

type GLTFElementKey =
  | 'nodes'
  | 'accessors'
  | 'animations'
  | 'buffers'
  | 'bufferViews'
  | 'images'
  | 'materials'
  | 'meshes'
  | 'nodes'
  | 'samplers'
  | 'skins'
  | 'textures'

const appendToGLTFArray = <
  Key extends GLTFElementKey,
  Arr extends Exclude<GLTF.IGLTF[Key], undefined>,
  T extends Arr[number]
>(
  src: GLTF.IGLTF,
  dst: GLTF.IGLTF,
  key: Key,
  index: number,
  table: Record<number, number>
): [T, number] => {
  if (!dst[key]) dst[key] = []

  const arr = dst[key]! as Arr
  const newIndex = arr.length
  arr[newIndex] = src[key]![index]
  table[index] = newIndex

  return [arr[newIndex] as T, newIndex]
}

const appendBuffer = (bufferIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, context: GLTFAppendContext): number => {
  if (context.bufferTable[bufferIndex] !== undefined) return context.bufferTable[bufferIndex]

  const [buffer, newBufferIndex] = appendToGLTFArray(src, dst, 'buffers', bufferIndex, context.bufferTable)

  return newBufferIndex
}

const appendBufferView = (
  bufferViewIndex: number,
  src: GLTF.IGLTF,
  dst: GLTF.IGLTF,
  context: GLTFAppendContext
): number => {
  if (context.bufferViewTable[bufferViewIndex] !== undefined) return context.bufferViewTable[bufferViewIndex]

  const [bufferView, newBufferViewIndex] = appendToGLTFArray(
    src,
    dst,
    'bufferViews',
    bufferViewIndex,
    context.bufferViewTable
  )

  if (bufferView.buffer !== undefined) bufferView.buffer = appendBuffer(bufferView.buffer, src, dst, context)

  return newBufferViewIndex
}

const appendImage = (imageIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, context: GLTFAppendContext): number => {
  if (context.imageTable[imageIndex] !== undefined) return context.imageTable[imageIndex]

  const [image, newImageIndex] = appendToGLTFArray(src, dst, 'images', imageIndex, context.imageTable)

  if (image.bufferView !== undefined) return appendBufferView(image.bufferView, src, dst, context)

  return newImageIndex
}

const appendSampler = (samplerIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, context: GLTFAppendContext): number => {
  if (context.samplerTable[samplerIndex] !== undefined) return context.samplerTable[samplerIndex]

  const [sampler, newSamplerIndex] = appendToGLTFArray(src, dst, 'samplers', samplerIndex, context.samplerTable)

  return newSamplerIndex
}

const appendTexture = (textureIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, context: GLTFAppendContext): number => {
  if (context.textureTable[textureIndex] !== undefined) return context.textureTable[textureIndex]

  const [texture, newTextureIndex] = appendToGLTFArray(src, dst, 'textures', textureIndex, context.textureTable)

  if (texture.sampler !== undefined) return appendSampler(texture.sampler, src, dst, context)
  if (texture.source !== undefined) return appendImage(texture.source, src, dst, context)

  return newTextureIndex
}

const appendAccessor = (
  accessorIndex: number,
  src: GLTF.IGLTF,
  dst: GLTF.IGLTF,
  context: GLTFAppendContext
): number => {
  if (context.accessorTable[accessorIndex] !== undefined) return context.accessorTable[accessorIndex]

  const [accessor, newAccessorIndex] = appendToGLTFArray(src, dst, 'accessors', accessorIndex, context.accessorTable)

  if (accessor.bufferView !== undefined) accessor.bufferView = appendBufferView(accessor.bufferView, src, dst, context)
  if (accessor.sparse !== undefined) {
    const sparse = accessor.sparse
    sparse.indices.bufferView = appendBufferView(sparse.indices.bufferView, src, dst, context)
    sparse.values.bufferView = appendBufferView(sparse.values.bufferView, src, dst, context)
  }

  return newAccessorIndex
}

const appendMaterial = (
  materialIndex: number,
  src: GLTF.IGLTF,
  dst: GLTF.IGLTF,
  context: GLTFAppendContext
): number => {
  if (context.materialTable[materialIndex] !== undefined) return context.materialTable[materialIndex]

  const [material, newMaterialIndex] = appendToGLTFArray(src, dst, 'materials', materialIndex, context.materialTable)

  const updateTextureInfo = (textureInfo: GLTF.ITextureInfo) => {
    textureInfo.index = appendTexture(textureInfo.index, src, dst, context)
  }

  if (material.pbrMetallicRoughness !== undefined) {
    if (material.pbrMetallicRoughness.baseColorTexture !== undefined)
      updateTextureInfo(material.pbrMetallicRoughness.baseColorTexture)
    if (material.pbrMetallicRoughness.metallicRoughnessTexture !== undefined)
      updateTextureInfo(material.pbrMetallicRoughness.metallicRoughnessTexture)
  }

  if (material.normalTexture !== undefined) updateTextureInfo(material.normalTexture)
  if (material.occlusionTexture !== undefined) updateTextureInfo(material.occlusionTexture)
  if (material.emissiveTexture !== undefined) updateTextureInfo(material.emissiveTexture)

  return newMaterialIndex
}

const appendMesh = (meshIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, context: GLTFAppendContext): number => {
  if (context.meshTable[meshIndex] !== undefined) return context.meshTable[meshIndex]

  const [mesh, newMeshIndex] = appendToGLTFArray(src, dst, 'meshes', meshIndex, context.meshTable)

  const primitives = mesh.primitives
  for (let i = 0, len = primitives.length; i < len; i++) {
    const primitive = primitives[i]
    for (const key in primitive.attributes) {
      primitive.attributes[key] = appendAccessor(primitive.attributes[key], src, dst, context)
    }
    if (primitive.material !== undefined) primitive.material = appendMaterial(primitive.material, src, dst, context)
    if (primitive.indices !== undefined) primitive.indices = appendAccessor(primitive.indices, src, dst, context)
  }

  return newMeshIndex
}

const appendSkin = (skinIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, context: GLTFAppendContext): number => {
  if (context.skinTable[skinIndex] !== undefined) return context.skinTable[skinIndex]

  const [skin, newSkinIndex] = appendToGLTFArray(src, dst, 'skins', skinIndex, context.skinTable)

  if (skin.skeleton !== undefined) skin.skeleton = appendNode(skin.skeleton, src, dst, context)

  skin.joints = skin.joints.map((jointNode) => {
    return appendNode(jointNode, src, dst, context)
  })

  if (skin.inverseBindMatrices !== undefined)
    skin.inverseBindMatrices = appendAccessor(skin.inverseBindMatrices, src, dst, context)

  return newSkinIndex
}

const appendNode = (nodeIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, context: GLTFAppendContext): number => {
  if (context.nodeTable[nodeIndex] !== undefined) return context.nodeTable[nodeIndex]

  const [node, newNodeIndex] = appendToGLTFArray(src, dst, 'nodes', nodeIndex, context.nodeTable)

  if (node.children) {
    node.children = node.children.map((index) => {
      return appendNode(index, src, dst, context)
    })
  }

  if (node.mesh !== undefined) node.mesh = appendMesh(node.mesh, src, dst, context)
  if (node.skin !== undefined) node.skin = appendSkin(node.skin, src, dst, context)

  return newNodeIndex
}

const appendAnimation = (animationIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, context: GLTFAppendContext) => {
  if (!dst.animations) dst.animations = []

  const animation = src.animations![animationIndex]
  for (let i = 0, len = animation.channels.length; i < len; i++) {
    const channel = animation.channels[i]
    if (channel.target.node !== undefined) channel.target.node = appendNode(channel.target.node, src, dst, context)
  }

  for (let i = 0, len = animation.samplers.length; i < len; i++) {
    const sampler = animation.samplers[i]
    sampler.input = appendAccessor(sampler.input, src, dst, context)
    sampler.output = appendAccessor(sampler.output, src, dst, context)
  }

  dst.animations.push(animation)
}

export const appendGLTF = (src: GLTF.IGLTF, dst: GLTF.IGLTF) => {
  if (src.scene === undefined || src.scenes === undefined || src.nodes === undefined) return

  const context = {
    nodeTable: {},
    meshTable: {},
    materialTable: {},
    cameraTable: {},
    bufferTable: {},
    bufferViewTable: {},
    accessorTable: {},
    textureTable: {},
    imageTable: {},
    samplerTable: {},
    skinTable: {}
  } as GLTFAppendContext

  const nodesToAppend = src.scenes[0].nodes
  for (let i = 0, len = nodesToAppend.length; i < len; i++) {
    const nodeIndex = nodesToAppend[i]
    const newIndex = appendNode(nodeIndex, src, dst, context)
    dst.scenes![0].nodes.push(newIndex)
  }

  if (src.animations) {
    for (let i = 0, len = src.animations.length; i < len; i++) {
      // Animations only reference other elements and are never referenced themselves so no indicies to update
      appendAnimation(i, src, dst, context)
    }
  }

  if (src.extensionsUsed) {
    const usedExtensions = dst.extensionsUsed ? new Set<string>([...dst.extensionsUsed]) : new Set<string>()
    for (const ext of src.extensionsUsed) {
      usedExtensions.add(ext)
    }
    dst.extensionsUsed = [...usedExtensions]
  }

  if (src.extensionsRequired) {
    const requiredExtensions = dst.extensionsRequired ? new Set<string>([...dst.extensionsRequired]) : new Set<string>()
    for (const ext of src.extensionsRequired) {
      requiredExtensions.add(ext)
    }
    dst.extensionsRequired = [...requiredExtensions]
  }
}

export function gltfReplaceUUIDsReferences(gltf: GLTF.IGLTF, UUIDs: [EntityUUID, EntityUUID][]) {
  if (!gltf.nodes || !UUIDs.length) return

  for (const node of gltf.nodes) {
    if (!node.extensions) continue

    for (const extKey in node.extensions) {
      if (extKey === UUIDComponent.jsonID) continue

      const ext = node.extensions[extKey]
      for (const [prevUUID, newUUID] of UUIDs) {
        // If a component is just a reference to a uuid
        if (ext === prevUUID) node.extensions[extKey] = newUUID
        else if (typeof ext === 'object') {
          replaceUUID(ext, prevUUID, newUUID)
        }
      }
    }
  }
}
