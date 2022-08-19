import { Color } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type HemisphereLightComponentType = {
  skyColor: Color
  groundColor: Color
  intensity: number
}

export const HemisphereLightComponent = createMappedComponent<HemisphereLightComponentType>('HemisphereLightComponent')

export const SCENE_COMPONENT_HEMISPHERE_LIGHT = 'hemisphere-light'
export const SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES = {
  skyColor: '#ffffff',
  groundColor: '#ffffff',
  intensity: 1
}
