import type { Vector3 } from 'three'

/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Mutates and returns the data in the first vector.
 * Useful for actor rotation, as it only happens on the Y axis.
 * @param {Vector3} a Vector to construct 2D matrix from
 * @param {Vector3} b Vector to apply basis to
 */

export function applyVectorMatrixXZ(a: Vector3, b: Vector3): Vector3 {
  return a.set(a.x * b.z + a.z * b.x, b.y, a.z * b.z + -a.x * b.x)
}
