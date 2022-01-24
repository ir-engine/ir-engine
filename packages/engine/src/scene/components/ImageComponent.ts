import { Side } from 'three'
import { ImageAlphaModeType, ImageProjectionType } from '../classes/ImageUtils'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ImageComponentType = {
  imageSource: string
  alphaMode: ImageAlphaModeType
  alphaCutoff: number
  projection: ImageProjectionType
  side: Side
  error?: string
}

export const ImageComponent = createMappedComponent<ImageComponentType>('ImageComponent')
