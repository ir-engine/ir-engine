import { Color, PointLight, Vector2 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PointLightComponentType = {
  color: Color
  intensity: number
  range: number
  decay: number
  castShadow: boolean
  shadowMapResolution: Vector2
  shadowBias: number
  shadowRadius: number
  light?: PointLight
}

export const PointLightComponent = createMappedComponent<PointLightComponentType>('PointLightComponent')

export const SCENE_COMPONENT_POINT_LIGHT = 'point-light'
export const SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES = {
  color: '#ffffff',
  intensity: 1,
  range: 0,
  decay: 2,
  castShadow: true,
  shadowMapResolution: [256, 256],
  shadowBias: 0.5,
  shadowRadius: 1
}
