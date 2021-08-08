import { WebLayer3DContent } from 'ethereal'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type UIComponentType = {
  layer: WebLayer3DContent
}

export const UIComponent = createMappedComponent<UIComponentType>()