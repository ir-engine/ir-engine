import { Bone, MathUtils, Object3D, Quaternion, Vector3 } from 'three'

import { Object3DUtils } from '../../common/functions/Object3DUtils'

const sqrEpsilon = 1e-8

/**
 * Returns angle 'a' in radians given lengths of sides of a triangle
 * @param {number} aLen
 * @param {number} bLen
 * @param {number} cLen
 * @returns angle 'a' in radians
 */
function triangleAngle(aLen: number, bLen: number, cLen: number): number {
  const c = MathUtils.clamp((bLen * bLen + cLen * cLen - aLen * aLen) / (bLen * cLen * 2), -1, 1)
  return Math.acos(c)
}

/**
 * Solves Two-Bone IK.
 * targetOffset is assumed to have no parents
 * @param {Bone} root root joint
 * @param {Bone} mid mid joint
 * @param {Bone} tip tip joint
 * @param {Object3D} target goal transform
 * @param {Object3D} hint Position of the hint
 * @param {Object3D} targetOffset Offset transform applied to the target
 * @param {number} targetPosWeight
 * @param {number} targetRotWeight
 * @param {number} hintWeight
 */
export function solveTwoBoneIK(
  root: Bone,
  mid: Bone,
  tip: Bone,
  target: Object3D,
  hint: Object3D | null,
  targetOffset: Object3D,
  targetPosWeight: number = 1,
  targetRotWeight: number = 0,
  hintWeight: number = 1
) {
  // The bone transform chain should already be updated outside this function
  // tip.updateWorldMatrix(true, false)

  targetPos.setFromMatrixPosition(target.matrixWorld).add(targetOffset.position)
  Object3DUtils.getWorldQuaternion(target, targetRot).multiply(targetOffset.quaternion)

  aPosition.setFromMatrixPosition(root.matrixWorld)
  bPosition.setFromMatrixPosition(mid.matrixWorld)
  cPosition.setFromMatrixPosition(tip.matrixWorld)

  targetPos.lerp(cPosition, 1 - targetPosWeight)

  ab.subVectors(bPosition, aPosition)
  bc.subVectors(cPosition, bPosition)
  ac.subVectors(cPosition, aPosition)
  at.subVectors(targetPos, aPosition)

  const hasHint = hint && hintWeight > 0
  if (hasHint) ah.setFromMatrixPosition(hint.matrixWorld).sub(aPosition)

  let abLength = ab.length()
  let bcLength = bc.length()
  let acLength = ac.length()
  let atLength = at.length()

  const oldAngle = triangleAngle(acLength, abLength, bcLength)
  const newAngle = triangleAngle(atLength, abLength, bcLength)
  const rotAngle = oldAngle - newAngle

  rotAxis.crossVectors(ab, bc)

  if (rotAxis.lengthSq() < sqrEpsilon) {
    hasHint ? rotAxis.crossVectors(ah, bc) : rotAxis.setScalar(0)
    rotAxis.crossVectors(at, bc)
    rotAxis.set(0, 1, 0)
  }

  rot.setFromAxisAngle(rotAxis.normalize(), rotAngle)
  Object3DUtils.premultiplyWorldQuaternion(mid, rot)

  Object3DUtils.updateParentsMatrixWorld(tip, 1)
  cPosition.setFromMatrixPosition(tip.matrixWorld)
  ac.subVectors(cPosition, aPosition)

  rot.setFromUnitVectors(acNorm.copy(ac).normalize(), atNorm.copy(at).normalize())
  Object3DUtils.premultiplyWorldQuaternion(root, rot)

  // Apply hint
  if (hasHint) {
    const acSqMag = ac.lengthSq()
    if (acSqMag > 0) {
      Object3DUtils.updateParentsMatrixWorld(tip, 2)
      bPosition.setFromMatrixPosition(mid.matrixWorld)
      cPosition.setFromMatrixPosition(tip.matrixWorld)
      ab.subVectors(bPosition, aPosition)
      ac.subVectors(cPosition, aPosition)

      acNorm.copy(ac).divideScalar(Math.sqrt(acSqMag))
      abProj.copy(ab).addScaledVector(acNorm, -ab.dot(acNorm)) // Prependicular component of vector projection
      ahProj.copy(ah).addScaledVector(acNorm, -ah.dot(acNorm))

      const maxReach = abLength + bcLength

      if (abProj.lengthSq() > maxReach * maxReach * 0.001 && ahProj.lengthSq() > 0) {
        rot.setFromUnitVectors(abProj.normalize(), ahProj.normalize())
        rot.x *= hintWeight
        rot.y *= hintWeight
        rot.z *= hintWeight
        Object3DUtils.premultiplyWorldQuaternion(root, rot)
      }
    }
  }

  // Apply tip rotation
  Object3DUtils.getWorldQuaternion(tip, tip.quaternion)
  tip.quaternion.slerp(targetRot, targetRotWeight)
  Object3DUtils.worldQuaternionToLocal(tip.quaternion, mid)
}

const targetPos = new Vector3(),
  aPosition = new Vector3(),
  bPosition = new Vector3(),
  cPosition = new Vector3(),
  rotAxis = new Vector3(),
  ab = new Vector3(),
  bc = new Vector3(),
  ac = new Vector3(),
  at = new Vector3(),
  ah = new Vector3(),
  acNorm = new Vector3(),
  atNorm = new Vector3(),
  abProj = new Vector3(),
  ahProj = new Vector3(),
  targetRot = new Quaternion(),
  rot = new Quaternion()
