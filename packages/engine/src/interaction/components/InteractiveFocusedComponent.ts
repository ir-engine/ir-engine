import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type InteractiveFocusedComponentType = {
  interacts: Entity
}

export const InteractiveFocusedComponent = createMappedComponent<InteractiveFocusedComponentType>()