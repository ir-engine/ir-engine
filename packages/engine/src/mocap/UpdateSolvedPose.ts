/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

import { Vector3 } from 'three'
import { updateRigPosition, updateRigRotation } from './UpdateRig'

import MediapipePoseNames from './MediapipePoseNames'
import { TPose, Vector } from './solvers'

import { PoseSolver } from './solvers/PoseSolver'

const UpdateSolvedPose = (rawPose, pose, hipsPos, avatarRig, avatarTransform) => {
  if (rawPose) {
    const poseData = PoseSolver.solve(rawPose, pose) as TPose

    const {
      RightUpperArm,
      RightLowerArm,
      LeftUpperArm,
      LeftLowerArm,
      RightHand,
      LeftHand,
      RightUpperLeg,
      RightLowerLeg,
      LeftUpperLeg,
      LeftLowerLeg,
      Hips,
      Spine
    } = poseData

    const leftFoot = Vector.fromArray(rawPose[MediapipePoseNames.indexOf('left_heel')])
    const rightFoot = Vector.fromArray(rawPose[MediapipePoseNames.indexOf('right_heel')])

    // foot y is how far below the hip center the foot is, with positive being downwards
    const lowerFoot = Math.min(leftFoot.y, rightFoot.y)

    const world = Hips.worldPosition! as Vector3
    const hipsPos = {
      x: world?.x,
      y: lowerFoot,
      z: world?.z
    }

    updateRigPosition('Hips', hipsPos, 1, 0.07, avatarRig)

    updateRigRotation('Hips', Hips.rotation, 1, 0.7, avatarRig)

    updateRigRotation('Chest', Spine, 0.25, 0.3, avatarRig)

    updateRigPosition('Spine', Spine, 0.45, 0.3, avatarRig)

    updateRigRotation('RightUpperArm', RightUpperArm, 1, 0.3, avatarRig)

    updateRigRotation('RightLowerArm', RightLowerArm, 1, 0.3, avatarRig)

    updateRigRotation('LeftUpperArm', LeftUpperArm, 1, 0.3, avatarRig)

    updateRigRotation('LeftLowerArm', LeftLowerArm, 1, 0.3, avatarRig)

    updateRigPosition('LeftHand', LeftHand, 1, 0.3, avatarRig)
    updateRigPosition('RightHand', RightHand, 1, 0.3, avatarRig)

    updateRigRotation('LeftUpperLeg', LeftUpperLeg, 1, 0.3, avatarRig)
    updateRigRotation('LeftLowerLeg', LeftLowerLeg, 1, 0.3, avatarRig)

    updateRigRotation('RightUpperLeg', RightUpperLeg, 1, 0.3, avatarRig)
    updateRigRotation('RightLowerLeg', RightLowerLeg, 1, 0.3, avatarRig)
  }
}

export default UpdateSolvedPose
