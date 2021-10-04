import { Vector3 } from 'three'
import { Engine } from '../../ecs/Engine'

export const setSkyDirection = (direction: Vector3) => {
  Engine.csm?.lightDirection.copy(direction).multiplyScalar(-1)
}
