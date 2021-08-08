import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { InteractionData } from '../types/InteractionTypes'

type InteractableComponentType = {
  data: InteractionData
}

export const InteractableComponent = createMappedComponent<InteractableComponentType>()