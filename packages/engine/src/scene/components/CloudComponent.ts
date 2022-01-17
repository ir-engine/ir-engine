import { Color, Vector2, Vector3 } from 'three'
import { ComponentSchema, PropertyType } from '../../common/functions/deserializers'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type CloudComponentType = {
  texture: string
  worldScale: Vector3
  dimensions: Vector3
  noiseZoom: Vector3
  noiseOffset: Vector3
  spriteScaleRange: Vector2
  fogColor: Color
  fogRange: Vector2
}

export const CloudSchema: ComponentSchema<CloudComponentType> = {
  texture: {
    type: PropertyType.STRING,
    defaultValue: '/clouds/cloud.png'
  },
  worldScale: {
    type: PropertyType.VECTOR3,
    defaultValue: new Vector3(1000, 150, 1000)
  },
  dimensions: {
    type: PropertyType.VECTOR3,
    defaultValue: new Vector3(8, 4, 8)
  },
  noiseZoom: {
    type: PropertyType.VECTOR3,
    defaultValue: new Vector3(7, 11, 7)
  },
  noiseOffset: {
    type: PropertyType.VECTOR3,
    defaultValue: new Vector3(0, 4000, 3137)
  },
  spriteScaleRange: {
    type: PropertyType.VECTOR2,
    defaultValue: new Vector2(50, 100)
  },
  fogColor: {
    type: PropertyType.COLOR,
    defaultValue: new Color(0x4584b4)
  },
  fogRange: {
    type: PropertyType.VECTOR2,
    defaultValue: new Vector2(-100, 3000)
  }
}

export const CloudComponent = createMappedComponent<CloudComponentType>('CloudComponent')
