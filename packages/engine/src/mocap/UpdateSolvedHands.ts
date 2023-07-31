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

import { getState } from '@etherealengine/hyperflux'
import { EngineState } from '../ecs/classes/EngineState'
import { SolvedHand } from './MotionCaptureSystem'
import { updateRigRotation } from './UpdateRig'

const UpdateSolvedHands = (hand: SolvedHand, poseData, avatarRig, avatarTransform) => {
  const engineState = getState(EngineState)
  const { handSolve, handedness } = hand
  const data = handSolve
  if (data) {
    updateRigRotation(
      `${handedness?.categoryName}RingProximal`,
      data![`${handedness?.categoryName}RingProximal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}RingIntermediate`,
      data![`${handedness?.categoryName}RingIntermediate`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}RingDistal`,
      data![`${handedness?.categoryName}RingDistal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}IndexProximal`,
      data![`${handedness?.categoryName}IndexProximal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}IndexIntermediate`,
      data![`${handedness?.categoryName}IndexIntermediate`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}IndexDistal`,
      data![`${handedness?.categoryName}IndexDistal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}MiddleProximal`,
      data![`${handedness?.categoryName}MiddleProximal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}MiddleIntermediate`,
      data![`${handedness?.categoryName}MiddleIntermediate`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}MiddleDistal`,
      data![`${handedness?.categoryName}MiddleDistal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}ThumbProximal`,
      data![`${handedness?.categoryName}ThumbProximal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}ThumbIntermediate`,
      data![`${handedness?.categoryName}ThumbIntermediate`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}ThumbDistal`,
      data![`${handedness?.categoryName}ThumbDistal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}LittleProximal`,
      data![`${handedness?.categoryName}LittleProximal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}LittleIntermediate`,
      data![`${handedness?.categoryName}LittleIntermediate`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
    updateRigRotation(
      `${handedness?.categoryName}LittleDistal`,
      data![`${handedness?.categoryName}LittleDistal`],
      engineState.deltaSeconds * 10,
      0,
      avatarRig
    )
  }
}
export default UpdateSolvedHands
