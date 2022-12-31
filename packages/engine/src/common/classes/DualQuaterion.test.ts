import assert from 'assert'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { DualQuaternion } from './DualQuaternion'

const assertApproximatelyEqual = (
  a: ArrayLike<number> | { toArray: () => number[] },
  b: ArrayLike<number> | { toArray: () => number[] },
  epsilon = 0.000001
) => {
  const arrA = 'toArray' in a ? a.toArray() : a
  const arrB = 'toArray' in b ? b.toArray() : b
  assert.equal(arrA.length, arrB.length)
  for (let i = 0; i < arrA.length; i++) {
    assert(Math.abs(arrA[i] - arrB[i]) < epsilon, `a[${i}] = ${arrA[i]} != b[${i}] = ${arrB[i]}`)
  }
}

describe('DualQuaternion', () => {
  it('should be able to set and get rotation and translation', () => {
    const dq = new DualQuaternion()
    dq.makeFromRotationTranslation(new Quaternion().setFromEuler(new Euler(1, 2, 3)), new Vector3(10, 30, 90))
    const rotation = dq.getRotation(new Quaternion())
    const translation = dq.getTranslation(new Vector3())
    assertApproximatelyEqual(rotation, new Quaternion().setFromEuler(new Euler(1, 2, 3)))
    assertApproximatelyEqual(translation, new Vector3(10, 30, 90))
  })

  it('should be able to set and get rotation from matrix', () => {
    const m = new Matrix4().makeRotationFromEuler(new Euler(1, 2, 3))
    const dq = new DualQuaternion().makeFromMatrix4(m)
    const rotation = dq.getRotation(new Quaternion())
    assertApproximatelyEqual(rotation, new Quaternion().setFromEuler(new Euler(1, 2, 3)))
  })

  it('should be able to set and get translation from matrix', () => {
    const m = new Matrix4().makeTranslation(10, 30, 90)
    const dq = new DualQuaternion().makeFromMatrix4(m)
    const translation = dq.getTranslation(new Vector3())
    assertApproximatelyEqual(translation, new Vector3(10, 30, 90))
  })

  it('should be able to set and get rotation and translation from matrix', () => {
    const m = new Matrix4().makeRotationFromEuler(new Euler(1, 2, 3)).setPosition(10, 30, 90)
    const dq = new DualQuaternion().makeFromMatrix4(m)
    const rotation = dq.getRotation(new Quaternion())
    const translation = dq.getTranslation(new Vector3())
    assertApproximatelyEqual(rotation, new Quaternion().setFromEuler(new Euler(1, 2, 3)))
    assertApproximatelyEqual(translation, new Vector3(10, 30, 90))
  })

  it('should be able to multiply dual quaternions', () => {
    const dq0 = new DualQuaternion().makeFromRotationTranslation(
      new Quaternion().setFromEuler(new Euler(1, 2, 3)),
      new Vector3(10, 30, 90)
    )
    const dq1 = new DualQuaternion().makeFromRotationTranslation(
      new Quaternion().setFromEuler(new Euler(-1, 3, 2)),
      new Vector3(30, 40, 190)
    )
    const dq2 = new DualQuaternion().makeFromRotationTranslation(
      new Quaternion().setFromEuler(new Euler(2, 3, 1.5)),
      new Vector3(5, 20, 66)
    )

    const m0 = new Matrix4().makeRotationFromEuler(new Euler(1, 2, 3)).setPosition(10, 30, 90)
    const dq0ToMat = dq0.getMatrix4(new Matrix4())
    assertApproximatelyEqual(dq0ToMat, m0)

    const m1 = new Matrix4().makeRotationFromEuler(new Euler(-1, 3, 2)).setPosition(30, 40, 190)
    const dq1ToMat = dq1.getMatrix4(new Matrix4())
    assertApproximatelyEqual(dq1ToMat, m1)

    const m2 = new Matrix4().makeRotationFromEuler(new Euler(2, 3, 1.5)).setPosition(5, 20, 66)
    const dq2ToMat = dq2.getMatrix4(new Matrix4())
    assertApproximatelyEqual(dq2ToMat, m2)

    const dq = new DualQuaternion().copy(dq0).multiply(dq1).multiply(dq2)
    const dqToMatrix = dq.getMatrix4(new Matrix4())
    const mat = new Matrix4().copy(m0).multiply(m1).multiply(m2)
    assertApproximatelyEqual(dqToMatrix, mat)

    const predq = new DualQuaternion().copy(dq0).premultiply(dq1).premultiply(dq2)
    const predqToMatrix = predq.getMatrix4(new Matrix4())
    const premat = new Matrix4().copy(m0).premultiply(m1).premultiply(m2)
    assertApproximatelyEqual(predqToMatrix, premat)
  })
})
