import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TriggerDetectedComponentType = {}

export const TriggerDetectedComponent = createMappedComponent<TriggerDetectedComponentType>('TriggerDetectedComponent')
