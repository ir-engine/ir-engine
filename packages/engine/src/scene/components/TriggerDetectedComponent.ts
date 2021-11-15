import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TriggerDetectedComponentType = {
  triggerEntity: Entity
}

export const TriggerDetectedComponent = createMappedComponent<TriggerDetectedComponentType>('TriggerDetectedComponent')
