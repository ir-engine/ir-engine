declare global {
  namespace jest {
    interface Matchers<R> {
      toBeCloseToVector(expected, tolerance?: number): R
      toBeCloseToQuaternion(expected, tolerance?: number): R
    }
  }
}

export {}
