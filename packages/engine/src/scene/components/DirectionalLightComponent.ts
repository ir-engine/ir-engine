import { Color, DirectionalLight, Vector2 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type DirectionalLightComponentType = {
  light: DirectionalLight
  color: Color
  intensity: number
  castShadow: boolean
  shadowMapResolution: Vector2
  shadowBias: number
  shadowRadius: number
  cameraFar: number
  showCameraHelper: boolean
}

export const DirectionalLightComponent =
  createMappedComponent<DirectionalLightComponentType>('DirectionalLightComponent')
