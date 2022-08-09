import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type InteractorComponentType = {
  focusedInteractive: Entity | null
  frustumCameraEntity: Entity
  subFocusedArray: Entity[]
}

export const InteractorComponent = createMappedComponent<InteractorComponentType>('InteractorComponent')
