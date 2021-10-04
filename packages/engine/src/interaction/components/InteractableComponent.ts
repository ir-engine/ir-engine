import { createMappedComponent } from '../../ecs/ComponentFunctions'
import { InteractionData } from '../types/InteractionTypes'

export type InteractableComponentType = {
  data: InteractionData
}

export const InteractableComponent = createMappedComponent<InteractableComponentType>('InteractableComponent')
