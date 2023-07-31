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

import { updateRigPosition, updateRigRotation } from './UpdateRig'

import { TPose } from './solvers'

const debug = true
const dampener = 1

const UpdateSolvedPose = (data: TPose, hipsPos, avatarRig, avatarTransform) => {
  if (data) {
    console.log('updating solved pose', data)
    // const engineState = getState(EngineState)
    // const lerpAmount = engineState.deltaSeconds * 10

    updateRigRotation('Hips', data!.Hips.rotation, 1, 0.7, avatarRig)
    updateRigPosition('Hips', data!.Hips.position, 1, 0.07, avatarRig)

    updateRigRotation('Chest', data!.Spine, 0.25, 0.3, avatarRig)

    updateRigPosition('Spine', data!.Spine, 0.45, 0.3, avatarRig)

    updateRigRotation('RightUpperArm', data!.RightUpperArm, 1, 0.3, avatarRig)
    updateRigRotation('RightLowerArm', data!.RightLowerArm, 1, 0.3, avatarRig)
    updateRigRotation('LeftUpperArm', data!.LeftUpperArm, 1, 0.3, avatarRig)
    updateRigRotation('LeftLowerArm', data!.LeftLowerArm, 1, 0.3, avatarRig)

    updateRigRotation('LeftUpperLeg', data!.LeftUpperLeg, 1, 0.3, avatarRig)
    updateRigRotation('LeftLowerLeg', data!.LeftLowerLeg, 1, 0.3, avatarRig)
    updateRigRotation('RightUpperLeg', data!.RightUpperLeg, 1, 0.3, avatarRig)
    updateRigRotation('RightLowerLeg', data!.RightLowerLeg, 1, 0.3, avatarRig)

    updateRigPosition('LeftHand', data!.LeftHand, 1, 0.3, avatarRig)
    updateRigPosition('RightHand', data!.RightHand, 1, 0.3, avatarRig)
  }
}

export default UpdateSolvedPose
