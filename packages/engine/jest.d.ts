import { Vector3, Quaternion } from 'three'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeCloseToVector(expected: Vector3, tolerance?: number): R
      toBeCloseToQuaternion(expected: Quaternion, tolerance?: number): R
    }
  }
}

export {}
