import { Color, Vector2 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type HemisphereLightComponentType = {
  dirty: boolean
  skyColor: Color
  groundColor: Color
  intensity: number
}

export const HemisphereLightComponent = createMappedComponent<HemisphereLightComponentType>('HemisphereLightComponent')
