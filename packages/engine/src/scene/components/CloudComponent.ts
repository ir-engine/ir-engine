import { Color, Vector2, Vector3 } from 'three'
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

export const CloudComponent = createMappedComponent<CloudComponentType>('CloudComponent')
