import { WebLayer3DContent } from 'ethereal'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type UIRootComponentType = {
  layer: WebLayer3DContent
}

export const UIRootComponent = createMappedComponent<UIRootComponentType>()