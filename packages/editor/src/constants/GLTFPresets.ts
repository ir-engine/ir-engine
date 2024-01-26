import {
  DefaultModelTransformParameters as defaultParams,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'

export const LODList: ModelTransformParameters[] = [
  {
    ...defaultParams,
    src: 'Desktop - Low',
    dst: 'Desktop - Low',
    maxTextureSize: 1024
  },
  {
    ...defaultParams,
    src: 'Desktop - Medium',
    dst: 'Desktop - Medium',
    maxTextureSize: 2048
  },
  {
    ...defaultParams,
    src: 'Desktop - High',
    dst: 'Desktop - High',
    maxTextureSize: 2048
  },
  {
    ...defaultParams,
    src: 'Mobile - Low',
    dst: 'Mobile - Low',
    maxTextureSize: 512
  },
  {
    ...defaultParams,
    src: 'Mobile - High',
    dst: 'Mobile - High',
    maxTextureSize: 1024
  },
  {
    ...defaultParams,
    src: 'XR - Low',
    dst: 'XR - Low',
    maxTextureSize: 1024
  },
  {
    ...defaultParams,
    src: 'XR - Medium',
    dst: 'XR - Medium',
    maxTextureSize: 1024
  },
  {
    ...defaultParams,
    src: 'XR - High',
    dst: 'XR - High',
    maxTextureSize: 2048
  }
]
