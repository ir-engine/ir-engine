import { DracoOptions, QuantizeOptions } from '@gltf-transform/functions'
import { BufferGeometry, Material, Texture } from 'three'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'

export type GLTFPackOptions = {
  meshopt?: boolean
  basisU?: boolean
  instancing?: boolean
  mergeNodes?: boolean
  mergeMaterials?: boolean
}

export type ResourceID = OpaqueType<'ResourceID'> & string

export type ParameterOverride<T> = {
  enabled: boolean
  parameters: T
}

export type ResourceParameters<T> = ParameterOverride<T> & {
  resourceId: ResourceID
}

export type ImageTransformParameters = ResourceParameters<{
  flipY: ParameterOverride<boolean>
  maxTextureSize: ParameterOverride<number>
  textureFormat: ParameterOverride<'default' | 'jpg' | 'ktx2' | 'png' | 'webp'>
  textureCompressionType: ParameterOverride<'etc1' | 'uastc'>
  textureCompressionQuality: ParameterOverride<number>
}>

export type GeometryTransformParameters = ResourceParameters<{
  weld: ParameterOverride<number>
  dracoCompression: ParameterOverride<DracoOptions>
}>

export type ResourceTransforms = {
  geometries: GeometryTransformParameters[]
  images: ImageTransformParameters[]
}

export type ModelTransformParameters = {
  dedup: boolean
  prune: boolean
  reorder: boolean
  resample: boolean
  weld: {
    enabled: boolean
    tolerance: number
  }
  dracoCompression: {
    enabled: boolean
    options: DracoOptions
  }

  textureFormat: 'default' | 'jpg' | 'ktx2' | 'png' | 'webp'
  textureCompressionType: 'etc1' | 'uastc'
  flipY: boolean
  textureCompressionQuality: number
  maxTextureSize: number
  modelFormat: 'glb' | 'gltf'

  resources: ResourceTransforms
}
