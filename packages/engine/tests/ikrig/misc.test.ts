import { Quaternion, Vector3 } from 'three'
import { FORWARD, UP } from '../../src/ikrig/constants/Vector3Constants'
import { applySwingAndTwist, computeSwingAndTwist } from '../../src/ikrig/functions/IKFunctions'

test('twist swing', () => {
  // const qPose = new Quaternion(-0.4829629063606262, 0.2999502122402191, -0.129409521818161, 0.8124222159385681)
  // const qTPose = new Quaternion()
  // current frame quaternion
  const qATPose = new Quaternion(-0.06047876164010382, 1.2979864261117819e-8, 4.4180032320538633e-7, 0.9981694843012805)
  const qAPose = new Quaternion(-0.049234336596575404, -0.02433079944441424, -0.0014453285286276222, 0.9984898113270149)
  // tpose/zero frame quaternion
  const qTPose = new Quaternion(-0.06047876164010382, 1.2979864261117819e-8, 4.4180032320538633e-7, 0.9981694843012805)

  const qTPoseInvert = qTPose.clone().invert()
  const altForward = FORWARD.clone().applyQuaternion(qTPoseInvert)
  const altUp = UP.clone().applyQuaternion(qTPoseInvert)
  //const originalForward = FORWARD.clone().applyQuaternion(qPose)

  const st = computeSwingAndTwist(qAPose, qATPose, FORWARD, UP)

  const quaternionFromSwingTwist = new Quaternion()
  applySwingAndTwist(quaternionFromSwingTwist, st.swing, st.twist, altForward)

  console.log('h', quaternionFromSwingTwist.toArray())
  console.log('w', qAPose.toArray())

  expect(quaternionFromSwingTwist.x).toBeCloseTo(qAPose.x, 4)
  expect(quaternionFromSwingTwist.y).toBeCloseTo(qAPose.y, 4)
  expect(quaternionFromSwingTwist.z).toBeCloseTo(qAPose.z, 4)
  expect(quaternionFromSwingTwist.w).toBeCloseTo(qAPose.w, 4)
})
