import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type TriggerDetectedComponentType = {}

export const TriggerDetectedComponent = createMappedComponent<TriggerDetectedComponentType>('TriggerDetectedComponent')
