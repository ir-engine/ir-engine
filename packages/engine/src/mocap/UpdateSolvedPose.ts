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

import { TFVectorPose } from './solvers'
import { calcHead } from './solvers/FaceSolver/calcHead'
import { calcArms } from './solvers/PoseSolver/calcArms'
import { calcHips } from './solvers/PoseSolver/calcHips'
import { calcLegs } from './solvers/PoseSolver/calcLegs'

const UpdateSolvedPose = (rawPose, pose, avatarRig, avatarTransform) => {
  if (rawPose) {
    // const poseData = PoseSolver.solve(rawPose, pose)
    // console.log(poseData)
    const headCalc = calcHead(pose)

    updateRigPosition('Head', headCalc?.position, 1, 0.7, avatarRig)
    updateRigRotation('Neck', headCalc?.degrees, 1, 0.7, avatarRig)

    const hipsCalc = calcHips(rawPose, pose)
    const world = hipsCalc?.Hips?.worldPosition || new Vector3(0, 0, 0)
    const hipsPos = {
      x: -world?.x, // Reverse direction
      y: world?.y + 1, // Add a bit of height
      z: -world?.z // Reverse direction
    }
    updateRigPosition('Hips', hipsPos, 1, 0.07, avatarRig)

    updateRigRotation('Hips', hipsCalc!.Hips.rotation, 1, 0.7, avatarRig)

    updateRigRotation('Chest', hipsCalc!.Spine, 0.25, 0.3, avatarRig)

    updateRigPosition('Spine', hipsCalc!.Spine, 0.45, 0.3, avatarRig)

    const arms = calcArms(rawPose as TFVectorPose)
    updateRigRotation('RightUpperArm', arms!.UpperArm.r, 1, 0.3, avatarRig)

    updateRigRotation('RightLowerArm', arms!.LowerArm.r, 1, 0.3, avatarRig)

    updateRigRotation('LeftUpperArm', arms!.UpperArm.l, 1, 0.3, avatarRig)

    updateRigRotation('LeftLowerArm', arms!.LowerArm.l, 1, 0.3, avatarRig)

    updateRigPosition('LeftHand', arms?.Hand?.l, 1, 0.3, avatarRig)
    updateRigPosition('RightHand', arms?.Hand?.r, 1, 0.3, avatarRig)

    const legs = calcLegs(rawPose as TFVectorPose)
    updateRigRotation('LeftUpperLeg', legs!.UpperLeg?.l, 1, 0.3, avatarRig)
    updateRigRotation('LeftLowerLeg', legs!.LowerLeg?.l, 1, 0.3, avatarRig)

    updateRigRotation('RightUpperLeg', legs!.UpperLeg?.r, 1, 0.3, avatarRig)
    updateRigRotation('RightLowerLeg', legs!.LowerLeg?.r, 1, 0.3, avatarRig)
  }
}

export default UpdateSolvedPose
