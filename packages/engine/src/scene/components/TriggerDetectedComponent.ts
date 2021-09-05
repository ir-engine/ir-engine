import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type TriggerDetectedComponentType = {
  colliderEntity: any
}

export const TriggerDetectedComponent = createMappedComponent<TriggerDetectedComponentType>()
