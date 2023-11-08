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
