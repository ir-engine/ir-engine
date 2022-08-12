import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

export const compareArrays = (arr1, arr2, tolerance) => {
  if (tolerance) {
    arr1.forEach((val, i) => {
      assert(Math.abs(arr2[i] - val) < tolerance)
    })
  } else {
    arr1.forEach((val, i) => {
      assert.equal(val, arr2[i])
    })
  }
}

export const equalsEpsilon = (v1: number, v2: number, epsilon = 0.001) => {
  return Math.abs(v1 - v2) < epsilon
}

export const vector3EqualsEpsilon = (v1: Vector3, v2: Vector3, epsilon = 0.001) => {
  return equalsEpsilon(v1.x, v2.x, epsilon) && equalsEpsilon(v1.y, v2.y, epsilon) && equalsEpsilon(v1.z, v2.z, epsilon)
}

export const quaternionEqualsEpsilon = (q1: Quaternion, q2: Quaternion, epsilon = 0.001) => {
  return (
    equalsEpsilon(q1.x, q2.x, epsilon) &&
    equalsEpsilon(q1.y, q2.y, epsilon) &&
    equalsEpsilon(q1.z, q2.z, epsilon) &&
    equalsEpsilon(q1.w, q2.w, epsilon)
  )
}

export const roundNumberToPlaces = (number: number, places = 2) => {
  return Math.pow(10, -places) * Math.round(number * Math.pow(10, places))
}

const vec3 = new Vector3()
export const roundVectorToPlaces = (vector: { x: number; y: number; z: number }, places = 2) => {
  return vec3.set(
    roundNumberToPlaces(vector.x, places),
    roundNumberToPlaces(vector.y, places),
    roundNumberToPlaces(vector.z, places)
  )
}
