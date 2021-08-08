import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type InteractorComponentType = {
  focusedInteractive: Entity
  subFocusedArray: any[]
}

export const InteractorComponent = createMappedComponent<InteractorComponentType>()