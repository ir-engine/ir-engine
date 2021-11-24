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
  showCameraHelper: boolean
}

export const DirectionalLightComponent = createMappedComponent<DirectionalLightComponentType>('DirectionalLightComponent')
