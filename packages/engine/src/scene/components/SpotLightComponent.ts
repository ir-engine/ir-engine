import { Color, Vector2 } from 'three'
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
}

export const SpotLightComponent = createMappedComponent<SpotLightComponentType>('SpotLightComponent')
