// Common readonly 3D Axis definitions
import { Vector3 } from 'three'

/** X Axis (1,0,0) */
export const X = Object.freeze(new Vector3(1, 0, 0))
/** Y Axis (0,1,0) */
export const Y = Object.freeze(new Vector3(0, 1, 0))
/** Z Axis (0,0,1) */
export const Z = Object.freeze(new Vector3(0, 0, 1))

export const Right = X
export const Left = Object.freeze(new Vector3().copy(Right).multiplyScalar(-1))
export const Up = Y
export const Down = Object.freeze(new Vector3().copy(Up).multiplyScalar(-1))
export const Forward = Z
export const Backward = Object.freeze(new Vector3().copy(Forward).multiplyScalar(-1))
