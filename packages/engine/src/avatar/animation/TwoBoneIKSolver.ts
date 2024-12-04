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

import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Bone, MathUtils, Matrix4, Mesh, Object3D, Quaternion, Vector3 } from 'three'

import { Entity, getComponent } from '@ir-engine/ecs'
import { Vector3_One } from '@ir-engine/spatial/src/common/constants/MathConstants'

import { AvatarRigComponent, Matrices } from '../components/AvatarAnimationComponent'
import { NormalizedBoneComponent } from '../components/NormalizedBoneComponent'

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

//mutates target position to constrain it to max distance
const distVector = new Vector3()
export function constrainTargetPosition(targetPosition: Vector3, constraintCenter: Vector3, distance: number) {
  distVector.subVectors(targetPosition, constraintCenter)
  distVector.clampLength(0, distance)
  targetPosition.copy(constraintCenter).add(distVector)
}

const hintHelpers = {} as Record<string, Mesh>

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
  parentMatrix: Matrix4,
  root: Matrices,
  mid: Matrices,
  tip: Matrices,
  targetPosition: Vector3, // world space
  targetRotation: Quaternion, // world space
  hint: Vector3 | null = null
) {
  targetPos.copy(targetPosition)
  targetRot.copy(targetRotation)

  root.world.multiplyMatrices(parentMatrix, root.local)
  rootBoneWorldPosition.setFromMatrixPosition(root.world)

  mid.world.multiplyMatrices(root.world, mid.local)
  midBoneWorldPosition.setFromMatrixPosition(mid.world)

  tip.world.multiplyMatrices(mid.world, tip.local)
  tipBoneWorldPosition.setFromMatrixPosition(tip.world)

  rootToMidVector.subVectors(midBoneWorldPosition, rootBoneWorldPosition)
  midToTipVector.subVectors(tipBoneWorldPosition, midBoneWorldPosition)
  rootToTipVector.subVectors(tipBoneWorldPosition, rootBoneWorldPosition)
  rootToTargetVector.subVectors(targetPos, rootBoneWorldPosition)

  const rootToMidLength = rootToMidVector.length()
  const midToTipLength = midToTipVector.length()
  const rootToTipLength = rootToTipVector.length()
  const maxLength = rootToMidLength + midToTipLength
  if (rootToTargetVector.lengthSq() > maxLength * maxLength) {
    rootToTargetVector.normalize().multiplyScalar((rootToMidLength + midToTipLength) * 0.999)
  }

  const rootToTargetLength = rootToTargetVector.length()

  const oldAngle = triangleAngle(rootToTipLength, rootToMidLength, midToTipLength)
  const newAngle = triangleAngle(rootToTargetLength, rootToMidLength, midToTipLength)
  const rotAngle = oldAngle - newAngle

  rotAxis.crossVectors(rootToMidVector, midToTipVector)

  worldBoneRotation.setFromAxisAngle(rotAxis.normalize(), rotAngle)
  const midWorldRot = getWorldQuaternion(mid.world, new Quaternion())
  midWorldRot.premultiply(worldBoneRotation)
  worldQuaternionToLocal(midWorldRot, root.world)
  mid.local.compose(position.setFromMatrixPosition(mid.local), midWorldRot, Vector3_One)
  mid.world.multiplyMatrices(root.world, mid.local)
  tip.world.multiplyMatrices(mid.world, tip.local)

  worldBoneRotation.setFromUnitVectors(
    acNorm.copy(rootToTipVector).normalize(),
    atNorm.copy(rootToTargetVector).normalize()
  )

  const rootWorldRot = getWorldQuaternion(root.world, new Quaternion())
  rootWorldRot.premultiply(worldBoneRotation)
  worldQuaternionToLocal(rootWorldRot, parentMatrix)
  root.local.compose(position.setFromMatrixPosition(root.local), rootWorldRot, Vector3_One)

  /** Apply hint */
  if (hint) {
    if (rootToTipLength > 0) {
      mid.world.multiplyMatrices(root.world, mid.local)
      tip.world.multiplyMatrices(mid.world, tip.local)
      root.world.multiplyMatrices(parentMatrix, root.local)

      midBoneWorldPosition.setFromMatrixPosition(mid.world)
      tipBoneWorldPosition.setFromMatrixPosition(tip.world)
      rootToMidVector.subVectors(midBoneWorldPosition, rootBoneWorldPosition)
      rootToTipVector.subVectors(tipBoneWorldPosition, rootBoneWorldPosition)
      rootToHintVector.copy(hint).sub(rootBoneWorldPosition)

      acNorm.copy(rootToTipVector).divideScalar(rootToTipLength)
      abProj.copy(rootToMidVector).addScaledVector(acNorm, -rootToMidVector.dot(acNorm)) // Prependicular component of vector projection
      ahProj.copy(rootToHintVector).addScaledVector(acNorm, -rootToHintVector.dot(acNorm))

      if (ahProj.lengthSq() > 0) {
        worldBoneRotation.setFromUnitVectors(abProj, ahProj)
        const rootWorldRot = getWorldQuaternion(root.world, new Quaternion())
        rootWorldRot.premultiply(worldBoneRotation)
        worldQuaternionToLocal(rootWorldRot, parentMatrix)
        root.local.compose(position.setFromMatrixPosition(root.local), rootWorldRot, Vector3_One)
      }
    }
  }
  /** Apply tip rotation */
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
  position = new Vector3()

const nodeQuaternion = new Quaternion()
export const blendIKChain = (entity: Entity, bones: VRMHumanBoneName[], weight) => {
  const rigComponent = getComponent(entity, AvatarRigComponent)

  for (const bone of bones) {
    const boneMatrices = rigComponent.ikMatrices[bone]
    if (boneMatrices) {
      const node = getComponent(rigComponent.bonesToEntities[bone], NormalizedBoneComponent)
      nodeQuaternion.setFromRotationMatrix(boneMatrices.local)
      node.quaternion.fastSlerp(nodeQuaternion, weight)
    }
  }
}
