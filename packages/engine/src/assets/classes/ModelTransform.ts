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
  reorder: boolean

  weld: {
    enabled: boolean
    tolerance: number
  }
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
  textureCompressionType: 'etc1' | 'uastc'
  textureCompressionQuality: number
  maxTextureSize: number
  modelFormat: 'glb' | 'gltf'
}
