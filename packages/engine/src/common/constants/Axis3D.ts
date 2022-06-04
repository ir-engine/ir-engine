// Common readonly 3D Axis definitions
import { Vector3 } from 'three'

export const Axis = {
  /** X Axis (1,0,0) */
  X: Object.freeze(new Vector3(1, 0, 0)),
  /** Y Axis (0,1,0) */
  Y: Object.freeze(new Vector3(0, 1, 0)),
  /** Z Axis (0,0,1) */
  Z: Object.freeze(new Vector3(0, 0, 1))
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
