import { Quaternion } from 'three'

import { Q_IDENTITY } from '../../common/constants/MathConstants'

const quat = new Quaternion()
const quat2 = new Quaternion()

export const applyBoneTwist = (
  sourceBindRotationInv: Quaternion,
  sourceRotation: Quaternion,
  targetBindRotation: Quaternion,
  targetRotation: Quaternion,
  rotationAmount: number
) => {
  quat.copy(sourceBindRotationInv).multiply(sourceRotation)
  quat.set(0, quat.y, 0, quat.w).normalize()
  quat2.slerpQuaternions(Q_IDENTITY, quat, rotationAmount)
  targetRotation.copy(targetBindRotation).premultiply(quat2)
}
