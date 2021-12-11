import { Color } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type HemisphereLightComponentType = {
  skyColor: Color
  groundColor: Color
  intensity: number
}

export const HemisphereLightComponent = createMappedComponent<HemisphereLightComponentType>('HemisphereLightComponent')
