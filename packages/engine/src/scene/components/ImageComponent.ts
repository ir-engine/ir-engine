import { DoubleSide, Side } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ImageAlphaMode, ImageAlphaModeType, ImageProjection, ImageProjectionType } from '../classes/ImageUtils'

export type ImageComponentType = {
  imageSource: string
  alphaMode: ImageAlphaModeType
  alphaCutoff: number
  projection: ImageProjectionType
  side: Side
}

export const ImageComponent = createMappedComponent<ImageComponentType>('ImageComponent')

export const SCENE_COMPONENT_IMAGE = 'image'
export const SCENE_COMPONENT_IMAGE_DEFAULT_VALUES = {
  imageSource: '',
  alphaMode: ImageAlphaMode.Opaque,
  alphaCutoff: 0.5,
  projection: ImageProjection.Flat,
  side: DoubleSide
}
