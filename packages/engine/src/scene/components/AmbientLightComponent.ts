import { AmbientLight, Color } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AmbientLightComponentType = {
  color: Color
  intensity: number
  light?: AmbientLight
}

export const AmbientLightComponent = createMappedComponent<AmbientLightComponentType>('AmbientLightComponent')

export const SCENE_COMPONENT_AMBIENT_LIGHT = 'ambient-light'
export const SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES = {
  color: '#ffffff',
  intensity: 1
}
