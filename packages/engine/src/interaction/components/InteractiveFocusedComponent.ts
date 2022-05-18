import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type InteractiveFocusedComponentType = {
  interacts: Entity
}

export const InteractiveFocusedComponent =
  createMappedComponent<InteractiveFocusedComponentType>('InteractiveFocusedComponent')
