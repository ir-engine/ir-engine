import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type WaterComponentType = {}

export const WaterComponent = createMappedComponent<WaterComponentType>('WaterComponent')
