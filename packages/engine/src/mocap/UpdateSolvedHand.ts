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
import { LEFT, RIGHT } from './solvers/constants'

const UpdateSolvedHand = (rawHand, handedness, avatarRig, avatarTransform) => {
  if (rawHand) {
    const side = handedness === 'Left' ? LEFT : RIGHT
    const hand = HandSolver.solve(rawHand, side)
    if (hand !== undefined) {
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}Hand`,
        {
          x: hand[handedness + 'Wrist']?.x,
          y: hand[handedness + 'Wrist']?.y,
          z: rawHand[mediapipeHandNames.indexOf(`WRIST`)]?.z
        },
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}RingProximal`,
        hand[handedness + 'RingProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}RingIntermediate`,
        hand[handedness + 'RingIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}RingDistal`,
        hand[handedness + 'RingDistal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}IndexProximal`,
        hand[handedness + 'IndexProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}IndexIntermediate`,
        hand[handedness + 'IndexIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}IndexDistal`,
        hand[handedness + 'IndexDistal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}MiddleProximal`,
        hand[handedness + 'MiddleProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}MiddleIntermediate`,
        hand[handedness + 'MiddleIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}MiddleDistal`,
        hand[handedness + 'MiddleDistal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}ThumbProximal`,
        hand[handedness + 'ThumbProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}ThumbIntermediate`,
        hand[handedness + 'ThumbIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}ThumbDistal`,
        hand[handedness + 'ThumbDistal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}LittleProximal`,
        hand[handedness + 'LittleProximal'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}LittleIntermediate`,
        hand[handedness + 'LittleIntermediate'],
        1,
        0.3,
        avatarRig
      )
      updateRigRotation(
        `${side === 'Right' ? 'Left' : 'Right'}LittleDistal`,
        hand[handedness + 'LittleDistal'],
        1,
        0.3,
        avatarRig
      )
    }
  }
}

export default UpdateSolvedHand
