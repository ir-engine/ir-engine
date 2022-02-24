import { Side } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ImageAlphaModeType, ImageProjectionType } from '../classes/ImageUtils'

export type ImageComponentType = {
  imageSource: string
  alphaMode: ImageAlphaModeType
  alphaCutoff: number
  projection: ImageProjectionType
  side: Side
}

export const ImageComponent = createMappedComponent<ImageComponentType>('ImageComponent')
