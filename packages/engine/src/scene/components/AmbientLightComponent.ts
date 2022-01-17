import { Color } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AmbientLightComponentType = {
  color: Color
  intensity: number
}

export const AmbientLightComponent = createMappedComponent<AmbientLightComponentType>('AmbientLightComponent')
