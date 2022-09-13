import { Color, Vector2, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Clouds } from '../classes/Clouds'

export type CloudComponentType = {
  texture: string
  worldScale: Vector3
  dimensions: Vector3
  noiseZoom: Vector3
  noiseOffset: Vector3
  spriteScaleRange: Vector2
  fogColor: Color
  fogRange: Vector2
  clouds?: Clouds
}

export const CloudComponent = createMappedComponent<CloudComponentType>('CloudComponent')

export const SCENE_COMPONENT_CLOUD = 'cloud'
export const SCENE_COMPONENT_CLOUD_DEFAULT_VALUES = {
  texture: '/clouds/cloud.png',
  worldScale: { x: 1000, y: 150, z: 1000 },
  dimensions: { x: 8, y: 4, z: 8 },
  noiseZoom: { x: 7, y: 11, z: 7 },
  noiseOffset: { x: 0, y: 4000, z: 3137 },
  spriteScaleRange: { x: 50, y: 100 },
  fogColor: 0x4584b4,
  fogRange: { x: -100, y: 3000 }
}
