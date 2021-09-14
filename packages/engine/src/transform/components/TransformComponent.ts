import { Vector3, Quaternion } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}

export const TransformComponent = createMappedComponent<TransformComponentType>('TransformComponent')
