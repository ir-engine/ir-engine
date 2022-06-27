// Common readonly 3D Axis definitions
import { Vector3 } from 'three'

import { V_001, V_010, V_100 } from './MathConstants'

export const Axis = {
  /** X Axis (1,0,0) */
  X: V_100,
  /** Y Axis (0,1,0) */
  Y: V_010,
  /** Z Axis (0,0,1) */
  Z: V_001
}

Object.freeze(Axis)

export const Direction = {
  Right: Axis.X,
  Left: Object.freeze(new Vector3().copy(Axis.X).multiplyScalar(-1)),
  Up: Axis.Y,
  Down: Object.freeze(new Vector3().copy(Axis.Y).multiplyScalar(-1)),
  Forward: Axis.Z,
  Backward: Object.freeze(new Vector3().copy(Axis.Z).multiplyScalar(-1))
}

Object.freeze(Direction)
