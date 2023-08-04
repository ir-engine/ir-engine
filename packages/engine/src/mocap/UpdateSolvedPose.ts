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
import { TFVectorPose, Vector } from './solvers'
import { calcArms } from './solvers/PoseSolver/calcArms'
import { calcHips } from './solvers/PoseSolver/calcHips'
import { calcLegs } from './solvers/PoseSolver/calcLegs'

const UpdateSolvedPose = (rawPose, pose, avatarRig, avatarTransform) => {
  if (rawPose) {
    // const poseData = PoseSolver.solve(rawPose, pose)
    // console.log(poseData)

    const hipsCalc = calcHips(rawPose, pose)
    const arms = calcArms(rawPose as TFVectorPose)
    const legs = calcLegs(rawPose as TFVectorPose)

    const leftFoot = Vector.fromArray(rawPose[MediapipePoseNames.indexOf('left heel')])
    const rightFoot = Vector.fromArray(rawPose[MediapipePoseNames.indexOf('right heel')])
    // console.log(leftFoot.y, rightFoot.y)
    // foot y is how far below the hip center the foot is, with positive being downwards
    const lowerFoot = Math.min(leftFoot.y, rightFoot.y)

    const world = hipsCalc.Hips.worldPosition! as Vector3
    const hipsPos = {
      x: world?.x,
      y: lowerFoot,
      z: world?.z
    }

    // const Head = avatarRig.vrm.humanoid!.getNormalizedBoneNode(VRMHumanBoneName['Head'])

    // const lookTarget = new Vector3(
    //   (rawPose[MediapipePoseNames.indexOf('left ear')].x + rawPose[MediapipePoseNames.indexOf('right ear')].x) / 2,
    //   (rawPose[MediapipePoseNames.indexOf('left ear')].y + rawPose[MediapipePoseNames.indexOf('right ear')].y) / 2,
    //   (rawPose[MediapipePoseNames.indexOf('left ear')].z + rawPose[MediapipePoseNames.indexOf('right ear')].z) / 2
    // )

    // avatarRig.humanoid.lookTarget.lerp(lookTarget, 0.1)
    //   .multiplyScalar(-1)
    //   .applyQuaternion(avatarTransform.rotation)
    //   .add(new Vector3(hipsPos.x, hipsPos.y, hipsPos.z))

    // updateRigPosition('Head', headPos, 1, 0.7, avatarRig)
    // updateRigRotation('Head', headCalc, 1, 0.7, avatarRig)

    updateRigPosition('Hips', hipsPos, 1, 0.07, avatarRig)

    updateRigRotation('Hips', hipsCalc.Hips.rotation, 1, 0.7, avatarRig)

    updateRigRotation('Chest', hipsCalc.Spine, 0.25, 0.3, avatarRig)

    updateRigPosition('Spine', hipsCalc.Spine, 0.45, 0.3, avatarRig)

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
}

export default UpdateSolvedPose
