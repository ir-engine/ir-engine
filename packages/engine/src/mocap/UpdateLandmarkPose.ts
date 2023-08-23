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

import { Landmark } from '@mediapipe/holistic'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Vector3 } from 'three'
import { calcArms } from './solvers/PoseSolver/calcArms'
import { calcHips } from './solvers/PoseSolver/calcHips'
import { calcLegs } from './solvers/PoseSolver/calcLegs'
import { RestingDefault } from './solvers/utils/helpers'

const UpdateSolvedPose = (lm3d: Landmark[], lm2d: Landmark[], changes) => {
  if (!lm3d || !lm2d) return

  const hips = calcHips(lm3d, lm2d)
  const arms = calcArms(lm3d)
  const legs = calcLegs(lm3d)

  // hack: a strategy for off screen parts is to go to a rest pose
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

  // hack: estimate where ground is using feet
  const world = hips.Hips.worldPosition! as Vector3
  const hipsPos = {
    x: -world?.x,
    y: Math.min(lm3d[31].y, lm3d[32].y),
    z: -world?.z
  }

  changes[VRMHumanBoneName.Hips] = { xyz: hipsPos, euler: hips.Hips.rotation, dampener: 1, lerp: 0.07 }

  changes[VRMHumanBoneName.Chest] = { euler: hips.Spine, dampener: 0.25, lerp: 0.3 }

  changes[VRMHumanBoneName.Spine] = { xyz: hips.Spine, dampener: 0.45, lerp: 0.3 }

  changes[VRMHumanBoneName.LeftUpperArm] = { euler: arms.UpperArm.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.LeftLowerArm] = { euler: arms.LowerArm.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightUpperArm] = { euler: arms.UpperArm.r, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightLowerArm] = { euler: arms.LowerArm.r, dampener: 1, lerp: 0.3 }

  changes[VRMHumanBoneName.LeftHand] = { xyz: arms.Hand.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightHand] = { xyz: arms.Hand.r, dampener: 1, lerp: 0.3 }

  changes[VRMHumanBoneName.LeftUpperLeg] = { euler: legs.UpperLeg.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.LeftLowerLeg] = { euler: legs.LowerLeg.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightUpperLeg] = { euler: legs.UpperLeg.r, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightLowerLeg] = { euler: legs.LowerLeg.r, dampener: 1, lerp: 0.3 }
}

export default UpdateSolvedPose
