import { Color } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { PropertyType, ComponentSchema } from '../../common/functions/deserializers'

export type AmbientLightComponentType = {
  color: Color
  intensity: number
}

export const AmbientLightSchema: ComponentSchema<AmbientLightComponentType> = {
  color: {
    type: PropertyType.COLOR,
    defaultValue: new Color('#ffffff')
  },
  intensity: {
    type: PropertyType.NUMBER,
    min: 0,
    steps: [0.1, 1, 10],
    unit: 'cd',
    defaultValue: 1
  }
}

export const AmbientLightComponent = createMappedComponent<AmbientLightComponentType>('AmbientLightComponent')
