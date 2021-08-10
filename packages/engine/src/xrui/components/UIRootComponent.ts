import { WebLayer3D } from 'ethereal'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type UIRootComponentType = {
  layer: WebLayer3D
}

export const UIRootComponent = createMappedComponent<UIRootComponentType>()
