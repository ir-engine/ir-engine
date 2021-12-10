import { Color } from 'three'
import { ComponentName } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type HemisphereLightComponentType = {
  skyColor: Color
  groundColor: Color
  intensity: number
}

export const HemisphereLightComponent = createMappedComponent<HemisphereLightComponentType>(
  ComponentName.HEMISPHERE_LIGHT
)
