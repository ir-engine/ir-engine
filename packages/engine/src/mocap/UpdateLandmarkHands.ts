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

import { Landmark } from '@mediapipe/holistic'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Euler } from 'three'
import { HandSolver } from './solvers/HandSolver'
import { LEFT, RIGHT } from './solvers/Types'

export default function UpdateLandmarkHands(leftHandLandmarks: Landmark[], rightHandLandmarks: Landmark[], changes) {
  const dampener = 1
  const lerp = 0.03

  if (leftHandLandmarks) {
    const side = LEFT
    const solved = HandSolver.solve(leftHandLandmarks, side)
    if (solved) {
      const euler = new Euler(solved[side + 'Wrist']?.x, solved[side + 'Wrist']?.y, solved[0]?.z)
      changes[VRMHumanBoneName.LeftHand] = { euler, dampener, lerp }

      changes[VRMHumanBoneName.LeftThumbProximal] = { euler: solved[side + 'ThumbProximal'], dampener, lerp }
      changes[VRMHumanBoneName.LeftThumbMetacarpal] = { euler: solved[side + 'ThumbIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.LeftThumbDistal] = { euler: solved[side + 'ThumbDistal'], dampener, lerp }

      changes[VRMHumanBoneName.LeftIndexProximal] = { euler: solved[side + 'IndexProximal'], dampener, lerp }
      changes[VRMHumanBoneName.LeftIndexIntermediate] = { euler: solved[side + 'IndexIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.LeftIndexDistal] = { euler: solved[side + 'IndexDistal'], dampener, lerp }

      changes[VRMHumanBoneName.LeftMiddleProximal] = { euler: solved[side + 'MiddleProximal'], dampener, lerp }
      changes[VRMHumanBoneName.LeftMiddleIntermediate] = { euler: solved[side + 'MiddleIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.LeftMiddleDistal] = { euler: solved[side + 'MiddleDistal'], dampener, lerp }

      changes[VRMHumanBoneName.LeftRingProximal] = { euler: solved[side + 'RingProximal'], dampener, lerp }
      changes[VRMHumanBoneName.LeftRingIntermediate] = { euler: solved[side + 'RingIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.LeftRingDistal] = { euler: solved[side + 'RingDistal'], dampener, lerp }

      changes[VRMHumanBoneName.LeftLittleProximal] = { euler: solved[side + 'LittleProximal'], dampener, lerp }
      changes[VRMHumanBoneName.LeftLittleIntermediate] = { euler: solved[side + 'LittleIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.LeftLittleDistal] = { euler: solved[side + 'LittleDistal'], dampener, lerp }
    }
  }

  if (rightHandLandmarks) {
    const side = RIGHT
    const solved = HandSolver.solve(rightHandLandmarks, side)
    if (solved) {
      const euler = new Euler(solved[side + 'Wrist']?.x, solved[side + 'Wrist']?.y, solved[0]?.z)
      changes[VRMHumanBoneName.RightHand] = { euler, dampener, lerp }

      changes[VRMHumanBoneName.RightThumbProximal] = { euler: solved[side + 'ThumbProximal'], dampener, lerp }
      changes[VRMHumanBoneName.RightThumbMetacarpal] = { euler: solved[side + 'ThumbIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.RightThumbDistal] = { euler: solved[side + 'ThumbDistal'], dampener, lerp }

      changes[VRMHumanBoneName.RightIndexProximal] = { euler: solved[side + 'IndexProximal'], dampener, lerp }
      changes[VRMHumanBoneName.RightIndexIntermediate] = { euler: solved[side + 'IndexIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.RightIndexDistal] = { euler: solved[side + 'IndexDistal'], dampener, lerp }

      changes[VRMHumanBoneName.RightMiddleProximal] = { euler: solved[side + 'MiddleProximal'], dampener, lerp }
      changes[VRMHumanBoneName.RightMiddleIntermediate] = { euler: solved[side + 'MiddleIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.RightMiddleDistal] = { euler: solved[side + 'MiddleDistal'], dampener, lerp }

      changes[VRMHumanBoneName.RightRingProximal] = { euler: solved[side + 'RingProximal'], dampener, lerp }
      changes[VRMHumanBoneName.RightRingIntermediate] = { euler: solved[side + 'RingIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.RightRingDistal] = { euler: solved[side + 'RingDistal'], dampener, lerp }

      changes[VRMHumanBoneName.RightLittleProximal] = { euler: solved[side + 'LittleProximal'], dampener, lerp }
      changes[VRMHumanBoneName.RightLittleIntermediate] = { euler: solved[side + 'LittleIntermediate'], dampener, lerp }
      changes[VRMHumanBoneName.RightLittleDistal] = { euler: solved[side + 'LittleDistal'], dampener, lerp }
    }
  }
}
