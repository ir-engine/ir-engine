import { Bone, Matrix4, Quaternion, Vector3 } from 'three'

import { Object3DUtils } from '../../common/functions/Object3DUtils'

const toLocalQuat = new Quaternion(),
  rotation = new Quaternion(),
  boneFwd = new Vector3(),
  targetDir = new Vector3(),
  deltaTarget = new Vector3()

/**
 * Extracts forward vector from Matrix4
 * @param matrix
 * @param outVec
 * @returns
 */
export function getForwardVector(matrix: Matrix4, outVec: Vector3): Vector3 {
  const e = matrix.elements
  outVec.set(e[8], e[9], e[10]).normalize()
  return outVec
}

/**
 * Look-at IK solver
 * @param bone Bone to solve rotation for
 * @param forward Direction to look at
 * @param rotationClamp Maximum angle between bone's parent forward and direction vectors, setting it to zero will ignore the limit
 * @returns
 */
export function solveLookIK(bone: Bone, forward: Vector3, rotationClamp: number = 0) {
  if (!bone || !bone.parent) return

  Object3DUtils.getWorldQuaternion(bone.parent, toLocalQuat)
  toLocalQuat.invert()

  getForwardVector(bone.parent.matrix, boneFwd)
  targetDir.copy(forward).applyQuaternion(toLocalQuat)
  const angle = Math.acos(boneFwd.dot(targetDir))

  if (rotationClamp > 0 && angle > rotationClamp) {
    deltaTarget.copy(targetDir).sub(boneFwd)
    // clamp delta target to within the ratio
    deltaTarget.multiplyScalar(rotationClamp / angle)
    // set new target
    targetDir.copy(boneFwd).add(deltaTarget).normalize()
  }

  bone.quaternion.premultiply(rotation.setFromUnitVectors(boneFwd, targetDir))
}
