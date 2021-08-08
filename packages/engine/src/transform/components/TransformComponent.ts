import { Vector3, Quaternion } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}

export const TransformComponent = createMappedComponent<TransformComponentType>()