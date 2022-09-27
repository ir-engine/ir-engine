import { Color, SpotLight, Vector2 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SpotLightComponentType = {
  color: Color
  intensity: number
  range: number
  angle: number
  penumbra: number
  decay: number
  castShadow: boolean
  shadowMapResolution: Vector2
  shadowBias: number
  shadowRadius: number
  light?: SpotLight
}

export const SpotLightComponent = createMappedComponent<SpotLightComponentType>('SpotLightComponent')

export const SCENE_COMPONENT_SPOT_LIGHT = 'spot-light'
export const SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES = {
  color: 0xffffff,
  intensity: 10,
  range: 0,
  decay: 2,
  angle: Math.PI / 3,
  penumbra: 1,
  castShadow: true,
  shadowMapResolution: [256, 256],
  shadowBias: 0,
  shadowRadius: 1
}
