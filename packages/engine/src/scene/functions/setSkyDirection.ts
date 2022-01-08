import { Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'

export const setSkyDirection = (direction: Vector3) => {
  Engine.csm?.lightDirection.copy(direction).multiplyScalar(-1)
}
