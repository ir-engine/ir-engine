import { Color, Vector2 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type DirectionalLightComponentType = {
  color: Color
  intensity: number
  castShadow: boolean
  shadowMapResolution: Vector2
  shadowBias: number
  shadowRadius: number
  cameraFar: number
  useInCSM: boolean
}

export const DirectionalLightComponent =
  createMappedComponent<DirectionalLightComponentType>('DirectionalLightComponent')

export const SCENE_COMPONENT_DIRECTIONAL_LIGHT = 'directional-light'
export const SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES = {
  color: '#ffffff' as unknown as any,
  intensity: 1,
  castShadow: true,
  shadowMapResolution: new Vector2(256, 256),
  shadowBias: 0,
  shadowRadius: 1,
  cameraFar: 100,
  useInCSM: false
} as DirectionalLightComponentType
