import { Bone, Matrix4, Object3D, Quaternion, Vector3 } from 'three'

import { Object3DUtils } from '../../common/functions/Object3DUtils'
import { Engine } from '../../ecs/classes/Engine'

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

/**
 * Hip squat IK solver
 * A function that uses the avatar's head Y position to move the hips up and down, keeping feet flat to the ground and solving leg IK using a three bone solver.
 */

export function solveHipIK(hips: Bone, headTarget: Object3D, head: Bone) {
  const headY = head.getWorldPosition(new Vector3()).y
  const hipsY = hips.getWorldPosition(new Vector3()).y
  const headTargetY = Math.sin(Engine.instance.currentWorld.elapsedSeconds) * 0.25 + 0.75
  // const headTargetY = headTarget.getWorldPosition(new Vector3()).y
  const delta = headY - headTargetY - hipsY

  console.log(headTargetY, headY, hipsY, delta)

  hips.position.y += delta

  /** create a simple pivot to simulate hips and  */
}
