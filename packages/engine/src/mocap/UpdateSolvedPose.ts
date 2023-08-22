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
import { updateRigPosition, updateRigRotation } from './UpdateUtils'

import { RestingDefault } from './solvers/utils/helpers'

import { calcArms } from './solvers/PoseSolver/calcArms'
import { calcHips } from './solvers/PoseSolver/calcHips'
import { calcLegs } from './solvers/PoseSolver/calcLegs'

const UpdateSolvedPose = (lm3d, lm2d, position, rotation, avatarRig) => {
  const arms = calcArms(lm3d)
  const hips = calcHips(lm3d, lm2d)
  const legs = calcLegs(lm3d)

  const world = hips.Hips.worldPosition! as Vector3
  const hipsPos = {
    x: -world?.x,
    y: Math.min(lm3d[31].y, lm3d[32].y),
    z: -world?.z
  }

  {
    const rightHandOffscreen = lm3d[15].y > 0.1 || (lm3d[15].visibility ?? 0) < 0.23 || 0.995 < lm2d[15].y
    const leftHandOffscreen = lm3d[16].y > 0.1 || (lm3d[16].visibility ?? 0) < 0.23 || 0.995 < lm2d[16].y
    const leftFootOffscreen = lm3d[23].y > 0.1 || (lm3d[23].visibility ?? 0) < 0.63 || hips.Hips.position.z > -0.4
    const rightFootOffscreen = lm3d[24].y > 0.1 || (lm3d[24].visibility ?? 0) < 0.63 || hips.Hips.position.z > -0.4

    arms.UpperArm.l = arms.UpperArm.l.multiply(leftHandOffscreen ? 0 : 1)
    arms.UpperArm.l.z = leftHandOffscreen ? RestingDefault.Pose.LeftUpperArm.z : arms.UpperArm.l.z
    arms.UpperArm.r = arms.UpperArm.r.multiply(rightHandOffscreen ? 0 : 1)
    arms.UpperArm.r.z = rightHandOffscreen ? RestingDefault.Pose.RightUpperArm.z : arms.UpperArm.r.z

    arms.LowerArm.l = arms.LowerArm.l.multiply(leftHandOffscreen ? 0 : 1)
    arms.LowerArm.r = arms.LowerArm.r.multiply(rightHandOffscreen ? 0 : 1)

    arms.Hand.l = arms.Hand.l.multiply(leftHandOffscreen ? 0 : 1)
    arms.Hand.r = arms.Hand.r.multiply(rightHandOffscreen ? 0 : 1)

    legs.UpperLeg.l = legs.UpperLeg.l.multiply(rightFootOffscreen ? 0 : 1)
    legs.UpperLeg.r = legs.UpperLeg.r.multiply(leftFootOffscreen ? 0 : 1)
    legs.LowerLeg.l = legs.LowerLeg.l.multiply(rightFootOffscreen ? 0 : 1)
    legs.LowerLeg.r = legs.LowerLeg.r.multiply(leftFootOffscreen ? 0 : 1)
  }

  updateRigPosition('Hips', position, 1, 0.07, avatarRig)
  updateRigRotation('Hips', rotation, 1, 0.7, avatarRig)
  updateRigRotation('Chest', hips.Spine, 0.25, 0.3, avatarRig)
  updateRigPosition('Spine', hips.Spine, 0.45, 0.3, avatarRig)
  updateRigRotation('RightUpperArm', arms.UpperArm.r, 1, 0.3, avatarRig)
  updateRigRotation('RightLowerArm', arms.LowerArm.r, 1, 0.3, avatarRig)
  updateRigRotation('LeftUpperArm', arms.UpperArm.l, 1, 0.3, avatarRig)
  updateRigRotation('LeftLowerArm', arms.LowerArm.l, 1, 0.3, avatarRig)
  updateRigPosition('LeftHand', arms.Hand.l, 1, 0.3, avatarRig)
  updateRigPosition('RightHand', arms.Hand.r, 1, 0.3, avatarRig)
  updateRigRotation('LeftUpperLeg', legs.UpperLeg.l, 1, 0.3, avatarRig)
  updateRigRotation('LeftLowerLeg', legs.LowerLeg.l, 1, 0.3, avatarRig)
  updateRigRotation('RightUpperLeg', legs.UpperLeg.r, 1, 0.3, avatarRig)
  updateRigRotation('RightLowerLeg', legs.LowerLeg.r, 1, 0.3, avatarRig)
}

export default UpdateSolvedPose
