import { Vector3 } from 'three'
import { useEngine } from '../../ecs/classes/Engine'

export const setSkyDirection = (direction: Vector3) => {
  useEngine().csm?.lightDirection.copy(direction).multiplyScalar(-1)
}
