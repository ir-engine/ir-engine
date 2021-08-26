import { Quaternion, Vector3 } from 'three'
import { FORWARD, UP } from '../../src/ikrig/constants/Vector3Constants'

test('twist swing', () => {
  const qOriginal = new Quaternion(-0.4829629063606262, 0.2999502122402191, -0.129409521818161, 0.8124222159385681)
  const qTarget = new Quaternion()
  const originalForward = FORWARD.clone().applyQuaternion(qOriginal)

  const st = computeSwingAndTwist(qTarget, qOriginal, FORWARD, UP)

  const quaternionFromSwingTwist = new Quaternion()
  apply(quaternionFromSwingTwist, st.swing, st.twist, originalForward)

  expect(quaternionFromSwingTwist.x).toBeCloseTo(qOriginal.x, 4)
  expect(quaternionFromSwingTwist.y).toBeCloseTo(qOriginal.y, 4)
  expect(quaternionFromSwingTwist.z).toBeCloseTo(qOriginal.z, 4)
  expect(quaternionFromSwingTwist.w).toBeCloseTo(qOriginal.w, 4)
})

function computeSwingAndTwist(target: Quaternion, source: Quaternion, forward, up) {
  const quatInverse = target.clone().invert(),
    altForward = forward.clone().applyQuaternion(quatInverse),
    altUp = up.clone().applyQuaternion(quatInverse)

  const poseForward = new Vector3().copy(altForward).applyQuaternion(source),
    poseUp = new Vector3().copy(altUp).applyQuaternion(source)

  const swing = new Quaternion()
    .setFromUnitVectors(forward, poseForward) // First we create a swing rotation from one dir to the other.
    .multiply(target) // Then we apply it to the TBone Rotation, this will do a FWD Swing which will create

  // a new Up direction based on only swing.
  const swing_up = up.clone().applyQuaternion(swing)
  let twist = swing_up.angleTo(poseUp)

  const swing_lft = swing_up.clone().cross(poseForward)
  const vec3Dot = swing_lft.clone().dot(poseUp)
  if (vec3Dot >= 0) twist = -twist

  return { swing, twist }
}

function apply(target: Quaternion, swing: Quaternion, twist: number, originalForward: Vector3) {
  target.premultiply(swing) // PreMultiply our swing rotation to our target's current rotation.

  const twistQ = new Quaternion().setFromAxisAngle(originalForward, twist)
  target.premultiply(twistQ)
}
