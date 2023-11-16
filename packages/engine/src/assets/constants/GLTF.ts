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

export type GLTFExtensionJson = {
  [key: string]: any
}

export type GLTFExtrasJson = {
  [key: string]: any
}

export type GLTFAssetJson = {
  generator: string
  version: string
  extras?: GLTFExtrasJson
}

export type GLTFSceneJson = {
  name: string
  nodes: number[]
  extras?: GLTFExtrasJson
}

export type GLTFNodeJson = {
  name?: string
  mesh?: number
  translation?: [number, number, number]
  rotation?: [number, number, number, number]
  scale?: [number, number, number]
  children?: number[]
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFMaterialJson = {
  name?: string
  doubleSided?: boolean
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFMeshJson = {
  name?: string
  extras?: GLTFExtrasJson
}

export type GLTFTextureJson = {
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFImageJson = {
  uri?: string
  mimeType?: string
  bufferView?: number
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFSamplerJson = {
  magFilter?: number
  minFilter?: number
  wrapS?: number
  wrapT?: number
  name?: string
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFSkinJson = {
  inverseBindMatrices?: number
  skeleton?: number
  joints: number[]
  name?: string
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFAnimationJson = {
  channels: GLTFAnimationChannelJson[]
  samplers: GLTFAnimationSamplerJson[]
  name?: string
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFAnimationChannelJson = {
  sampler: number
  target: GLTFAnimationChannelTargetJson
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFAnimationSamplerJson = {
  input: number
  interpolation?: 'LINEAR' | 'STEP' | 'CUBICSPLINE'
  output: number
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFAnimationChannelTargetJson = {
  node: number
  path: 'translation' | 'rotation' | 'scale' | 'weights'
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFBufferJson = {
  uri?: string
  byteLength: number
  name?: string
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFBufferViewJson = {
  buffer: number
  byteOffset?: number
  byteLength: number
  byteStride?: number
  target?: number
  name?: string
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFAccessorJson = {
  bufferView?: number
  byteOffset?: number
  componentType: number
  normalized?: boolean
  count: number
  type: 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4' | 'MAT2' | 'MAT3' | 'MAT4'
  max?: number[]
  min?: number[]
  sparse?: GLTFAccessorSparseJson
  name?: string
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFAccessorSparseJson = {
  count: number
  indices: GLTFAccessorSparseIndicesJson
  values: GLTFAccessorSparseValuesJson
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFAccessorSparseIndicesJson = {
  bufferView: number
  byteOffset?: number
  componentType: number // 5121 (UNSIGNED_BYTE), 5123 (UNSIGNED_SHORT), 5125 (UNSIGNED_INT)
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFAccessorSparseValuesJson = {
  bufferView: number
  byteOffset?: number
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFCameraJson = {
  orthographic?: GLTFCameraOrthographicJson
  perspective?: GLTFCameraPerspectiveJson
  type: 'perspective' | 'orthographic'
  name?: string
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFCameraOrthographicJson = {
  xmag: number
  ymag: number
  zfar: number
  znear: number
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFCameraPerspectiveJson = {
  aspectRatio?: number
  yfov: number
  zfar?: number
  znear: number
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}

export type GLTFJson = {
  asset: GLTFAssetJson
  scene: number
  scenes: GLTFSceneJson[]
  nodes: GLTFNodeJson[]
  materials: GLTFMaterialJson[]
  meshes: GLTFMeshJson[]
  textures: GLTFTextureJson[]
  images: GLTFImageJson[]
  samplers: GLTFSamplerJson[]
  skins: GLTFSkinJson[]
  animations: GLTFAnimationJson[]
  cameras: GLTFCameraJson[]
  buffers: GLTFBufferJson[]
  bufferViews: GLTFBufferViewJson[]
  accessors: GLTFAccessorJson[]
  extensionsUsed?: string[]
  extensionsRequired?: string[]
  extensions?: GLTFExtensionJson
  extras?: GLTFExtrasJson
}
