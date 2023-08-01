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

import { updateRigRotation } from './UpdateRig'

import mediapipeHandNames from './MediapipeHandNames'
import { HandSolver } from './solvers/HandSolver'

const UpdateSolvedHands = (rawHand, handednesses, avatarRig, avatarTransform) => {
  if (rawHand) {
    console.log('UpdateSolvedHands', rawHand, handednesses)
    const handedness = handednesses[0]
    const hand = HandSolver.solve(rawHand, handedness?.categoryName)
    if (hand !== undefined) {
      updateRigRotation(
        `${handedness?.categoryName}Hand`,
        {
          x: hand[handedness?.categoryName + 'Wrist']?.x,
          y: hand[handedness.categoryName + 'Wrist']?.y,
          z: rawHand[mediapipeHandNames.indexOf(`WRIST`)]?.z
        },
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}RingProximal`,
        hand[handedness?.categoryName + 'RingProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}RingIntermediate`,
        hand[handedness?.categoryName + 'RingIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}RingDistal`,
        hand[handedness?.categoryName + 'RingDistal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}IndexProximal`,
        hand[handedness?.categoryName + 'IndexProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}IndexIntermediate`,
        hand[handedness?.categoryName + 'IndexIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}IndexDistal`,
        hand[handedness?.categoryName + 'IndexDistal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}MiddleProximal`,
        hand[handedness?.categoryName + 'MiddleProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}MiddleIntermediate`,
        hand[handedness?.categoryName + 'MiddleIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}MiddleDistal`,
        hand[handedness?.categoryName + 'MiddleDistal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}ThumbProximal`,
        hand[handedness?.categoryName + 'ThumbProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}ThumbIntermediate`,
        hand[handedness?.categoryName + 'ThumbIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}ThumbDistal`,
        hand[handedness?.categoryName + 'ThumbDistal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}LittleProximal`,
        hand[handedness?.categoryName + 'LittleProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}LittleIntermediate`,
        hand[handedness?.categoryName + 'LittleIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${handedness?.categoryName}LittleDistal`,
        hand[handedness?.categoryName + 'LittleDistal'],
        1,
        0.3,
        avatarRig
      )
    }
  }
}

export default UpdateSolvedHands
