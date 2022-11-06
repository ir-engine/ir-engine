import { DracoOptions, QuantizeOptions } from '@gltf-transform/functions'

export type GLTFPackOptions = {
  meshopt?: boolean
  basisU?: boolean
  instancing?: boolean
  mergeNodes?: boolean
  mergeMaterials?: boolean
}

export type ModelTransformParameters = {
  dedup: boolean
  prune: boolean
  dracoCompression: {
    enabled: boolean
    options: DracoOptions
  }
  meshQuantization: {
    enabled: boolean
    options: QuantizeOptions
  }
  gltfPack: {
    enabled: boolean
    options: GLTFPackOptions
  }
  textureFormat: 'default' | 'jpg' | 'ktx2' | 'png' | 'webp'
  maxTextureSize: number
  modelFormat: 'glb' | 'gltf'
}
