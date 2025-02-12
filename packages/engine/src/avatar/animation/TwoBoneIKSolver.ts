/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { MathUtils, Matrix4, Quaternion, Vector3 } from 'three'

import { Entity, getComponent } from '@ir-engine/ecs'
import { Vector3_One } from '@ir-engine/spatial/src/common/constants/MathConstants'

import { Matrices } from '../components/AvatarAnimationComponent'
import { IKMatrixComponent } from '../components/AvatarIKComponents'
import { NormalizedBoneComponent } from '../components/NormalizedBoneComponent'

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

//mutates target position to constrain it to max distance
const distVector = new Vector3()
export function constrainTargetPosition(targetPosition: Vector3, constraintCenter: Vector3, distance: number) {
  distVector.subVectors(targetPosition, constraintCenter)
  distVector.clampLength(0, distance)
  targetPosition.copy(constraintCenter).add(distVector)
}
/**
 * Solves Two-Bone IK.
 * targetOffset is assumed to have no parents
 * @param {Matrix4} root the normalized parent bone's matrix, tethers the ik solve to the rig
 * @param {Matrices} root the root bone matrices from the ikComponent
 * @param {Matrices} mid the mid bone matrices from the ikComponent
 * @param {Matrices} tip the tip bone matrices from the ikComponent
 * @param {Vector3} targetPosition the target position in world space
 * @param {Quaternion} targetRotation the target rotation in world space to apply to the tip
 * @param {Vector3} hint the hint position in world space, no hint will be applied if null
 */
export function solveTwoBoneIK(
  parentMatrix: Matrix4,
  root: Matrices,
  mid: Matrices,
  tip: Matrices,
  targetPosition: Vector3,
  targetRotation: Quaternion,
  hint: Vector3 | null = null
) {
  // copy target position and rotation to avoid mutating the original
  targetPos.copy(targetPosition)
  targetRot.copy(targetRotation)

  // propagate world matrices
  root.world.multiplyMatrices(parentMatrix, root.local)
  rootBoneWorldPosition.setFromMatrixPosition(root.world)

  mid.world.multiplyMatrices(root.world, mid.local)
  midBoneWorldPosition.setFromMatrixPosition(mid.world)

  tip.world.multiplyMatrices(mid.world, tip.local)
  tipBoneWorldPosition.setFromMatrixPosition(tip.world)

  // calculate vectors between bones and target
  rootToMidVector.subVectors(midBoneWorldPosition, rootBoneWorldPosition)
  midToTipVector.subVectors(tipBoneWorldPosition, midBoneWorldPosition)
  rootToTipVector.subVectors(tipBoneWorldPosition, rootBoneWorldPosition)
  rootToTargetVector.subVectors(targetPos, rootBoneWorldPosition)

  // get lengths between root to mid, mid to tip and root to tip
  const rootToMidLength = rootToMidVector.length()
  const midToTipLength = midToTipVector.length()
  const rootToTipLength = rootToTipVector.length()

  // check if target is out of reach to avoid popping
  const maxLength = rootToMidLength + midToTipLength
  let rootToTargetLength = rootToTargetVector.length()
  if (rootToTargetLength > maxLength) {
    rootToTargetVector.normalize().multiplyScalar((rootToMidLength + midToTipLength) * 0.999)
    rootToTargetLength = rootToTargetVector.length()
  }

  // calculate the triangle angle
  const oldAngle = triangleAngle(rootToTipLength, rootToMidLength, midToTipLength)
  const newAngle = triangleAngle(rootToTargetLength, rootToMidLength, midToTipLength)
  const rotAngle = oldAngle - newAngle

  // calculate the rotation axis and use for the world mid bone rotation from the angle
  rotAxis.crossVectors(rootToMidVector, midToTipVector)
  worldBoneRotation.setFromAxisAngle(rotAxis.normalize(), rotAngle)
  // apply the rotation to the mid bone in world space and convert back to local
  const midWorldRot = getWorldQuaternion(mid.world, new Quaternion())
  midWorldRot.premultiply(worldBoneRotation)
  worldQuaternionToLocal(midWorldRot, root.world)
  mid.local.compose(position.setFromMatrixPosition(mid.local), midWorldRot, Vector3_One)
  // propagate the new world matrices
  mid.world.multiplyMatrices(root.world, mid.local)
  tip.world.multiplyMatrices(mid.world, tip.local)

  // calculate the rotation from the root to the target
  worldBoneRotation.setFromUnitVectors(
    acNorm.copy(rootToTipVector).normalize(),
    atNorm.copy(rootToTargetVector).normalize()
  )
  //apply the rotation to the root bone in world space and convert back to local
  getWorldQuaternion(root.world, rootWorldRotation)
  rootWorldRotation.premultiply(worldBoneRotation)
  worldQuaternionToLocal(rootWorldRotation, parentMatrix)
  root.local.compose(position.setFromMatrixPosition(root.local), rootWorldRotation, Vector3_One)

  // apply hint if available
  if (hint) {
    root.world.multiplyMatrices(parentMatrix, root.local)

    // calculate vectors from root to hint and root to tip
    rootToHintVector.copy(hint).sub(rootBoneWorldPosition)
    acNorm.subVectors(rootBoneWorldPosition, tipBoneWorldPosition).normalize()

    // project rootToMidVector and rootToHintVector onto plane perpendicular to acNorm
    abProj.copy(rootToMidVector).addScaledVector(acNorm, -rootToMidVector.dot(acNorm))
    ahProj.copy(rootToHintVector).addScaledVector(acNorm, -rootToHintVector.dot(acNorm))

    if (ahProj.lengthSq() > 0) {
      // rotate abProj to ahProj
      worldBoneRotation.setFromUnitVectors(abProj.normalize(), ahProj.normalize())
      // apply root world rotation to the new world bone rotation
      getWorldQuaternion(root.world, rootWorldRotation)
      rootWorldRotation.premultiply(worldBoneRotation)
      // convert back to local space for the root node
      worldQuaternionToLocal(rootWorldRotation, parentMatrix)
      root.local.compose(position.setFromMatrixPosition(root.local), rootWorldRotation, Vector3_One)
    }
  }

  //apply tip rotation
  worldQuaternionToLocal(targetRot, mid.world)
  tip.local.compose(position.setFromMatrixPosition(tip.local), targetRot, Vector3_One)
}

const _v1 = new Vector3()
const _m1 = new Matrix4()
const getWorldQuaternion = (matrix: Matrix4, outQuaternion: Quaternion): Quaternion => {
  const te = matrix.elements

  let sx = _v1.set(te[0], te[1], te[2]).length()
  const sy = _v1.set(te[4], te[5], te[6]).length()
  const sz = _v1.set(te[8], te[9], te[10]).length()

  // if determine is negative, we need to invert one scale
  const det = matrix.determinant()
  if (det < 0) sx = -sx

  // scale the rotation part
  _m1.copy(matrix)

  const invSX = 1 / sx
  const invSY = 1 / sy
  const invSZ = 1 / sz

  _m1.elements[0] *= invSX
  _m1.elements[1] *= invSX
  _m1.elements[2] *= invSX

  _m1.elements[4] *= invSY
  _m1.elements[5] *= invSY
  _m1.elements[6] *= invSY

  _m1.elements[8] *= invSZ
  _m1.elements[9] *= invSZ
  _m1.elements[10] *= invSZ

  outQuaternion.setFromRotationMatrix(_m1)

  return outQuaternion
}

const _quat = new Quaternion()
const worldQuaternionToLocal = (quaternion: Quaternion, parent: Matrix4 | null): Quaternion => {
  if (!parent) return quaternion
  const parentQuatInverse = getWorldQuaternion(parent, _quat).invert()
  quaternion.premultiply(parentQuatInverse)
  return quaternion
}

const targetPos = new Vector3(),
  rootBoneWorldPosition = new Vector3(),
  midBoneWorldPosition = new Vector3(),
  tipBoneWorldPosition = new Vector3(),
  worldBoneRotation = new Quaternion(),
  rotAxis = new Vector3(),
  rootToMidVector = new Vector3(),
  midToTipVector = new Vector3(),
  rootToTipVector = new Vector3(),
  rootToTargetVector = new Vector3(),
  rootToHintVector = new Vector3(),
  acNorm = new Vector3(),
  atNorm = new Vector3(),
  abProj = new Vector3(),
  ahProj = new Vector3(),
  targetRot = new Quaternion(),
  position = new Vector3(),
  rootWorldRotation = new Quaternion()

const nodeQuaternion = new Quaternion()
export const blendIKChain = (bones: Entity[], weight) => {
  for (const bone of bones) {
    const node = getComponent(bone, NormalizedBoneComponent)
    const ikMatrix = getComponent(bone, IKMatrixComponent).local
    nodeQuaternion.setFromRotationMatrix(ikMatrix)
    node.quaternion.fastSlerp(nodeQuaternion, weight)
  }
}
