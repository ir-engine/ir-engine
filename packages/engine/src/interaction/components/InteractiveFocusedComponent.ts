import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type InteractiveFocusedComponentType = {
  interacts: Entity
}

export const InteractiveFocusedComponent = createMappedComponent<InteractiveFocusedComponentType>()
