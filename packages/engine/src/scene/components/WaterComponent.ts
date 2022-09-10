import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Water } from '../classes/Water'

export const WaterComponent = createMappedComponent<{ water: Water }>('WaterComponent')

export const SCENE_COMPONENT_WATER = 'water'
