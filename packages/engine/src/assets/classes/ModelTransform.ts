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

export type ParameterOverride<T> = OpaqueType<'ParameterOverride'> & {
  enabled: boolean
  parameters: T
}

export function extractParameters<T>(parameters: ParameterOverride<T>) {
  if (!parameters.enabled) return {}
  if (typeof parameters.parameters === 'object' && !Array.isArray(parameters.parameters)) {
    return Object.fromEntries(
      Object.entries(parameters.parameters as object).map(([key, value]: [string, ParameterOverride<any>]) => {
        if (value.__opaqueType === 'ParameterOverride') {
          if (value.enabled) return [key, extractParameters(value)]
          else return []
        } else return [key, value]
      })
    )
  } else if (Array.isArray(parameters.parameters)) {
    return [
      ...parameters.parameters.map((value) => {
        if (value.__opaqueType === 'ParameterOverride') {
          if (value.enabled) return [extractParameters(value)]
          else return []
        } else return [value]
      })
    ]
  } else return parameters.parameters
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

export type ExtractedImageTransformParameters = {
  flipY: boolean
  linear: boolean
  maxTextureSize: number
  textureFormat: 'default' | 'jpg' | 'ktx2' | 'png' | 'webp'
  textureCompressionType: 'etc1' | 'uastc'
  textureCompressionQuality: number
}

export type GeometryTransformParameters = ResourceParameters<{
  weld: ParameterOverride<number>
  dracoCompression: ParameterOverride<DracoOptions>
}>

export type ResourceTransforms = {
  geometries: GeometryTransformParameters[]
  images: ImageTransformParameters[]
}

export type ModelTransformParameters = ExtractedImageTransformParameters & {
  dst: string
  resourceUri: string
  instance: boolean
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
  modelFormat: 'glb' | 'gltf'

  resources: ResourceTransforms
}

export const DefaultModelTransformParameters: ModelTransformParameters = {
  dst: '',
  resourceUri: '',
  modelFormat: 'gltf',
  instance: true,
  dedup: true,
  prune: true,
  reorder: true,
  resample: true,
  weld: {
    enabled: true,
    tolerance: 0.001
  },
  dracoCompression: {
    enabled: true,
    options: {
      method: 'sequential',
      encodeSpeed: 0,
      decodeSpeed: 0,
      quantizePosition: 14,
      quantizeNormal: 8,
      quantizeColor: 8,
      quantizeTexcoord: 12,
      quantizeGeneric: 16,
      quantizationVolume: 'mesh'
    }
  },
  textureFormat: 'ktx2',
  textureCompressionType: 'etc1',
  flipY: true,
  linear: true,
  textureCompressionQuality: 128,
  maxTextureSize: 1024,
  resources: {
    geometries: [],
    images: []
  }
}
