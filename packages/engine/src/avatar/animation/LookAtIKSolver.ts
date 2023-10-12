/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
export function solveLookIK(bone: Bone, forward: Vector3, rotationClamp = 0.785398) {
  if (!bone || !bone.parent) return

  Object3DUtils.getWorldQuaternion(bone.parent, toLocalQuat) // can this be replaces with a matrix rotation?
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
