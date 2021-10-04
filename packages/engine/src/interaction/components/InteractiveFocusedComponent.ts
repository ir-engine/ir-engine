import { Entity } from '../../ecs/Entity'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type InteractiveFocusedComponentType = {
  interacts: Entity
}

export const InteractiveFocusedComponent =
  createMappedComponent<InteractiveFocusedComponentType>('InteractiveFocusedComponent')
