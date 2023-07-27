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

import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three'
import { Engine } from '../ecs/classes/Engine'
import { SolvedHand } from './MotionCaptureSystem'
import { updateRigRotation } from './UpdateRig'

const objs = [] as Mesh[]
const debug = true

if (debug)
  for (let i = 0; i < 33; i++) {
    objs.push(new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial()))
    Engine?.instance?.scene.add(objs[i])
  }

const UpdateSolvedHands = (hand: SolvedHand, poseData, avatarRig, avatarTransform) => {
  // console.log('updating solved hand', hand)
  VRMHumanBoneName
  const { handSolve, handedness } = hand
  const data = handSolve
  if (data) {
    updateRigRotation(`${handedness}RingProximal`, data![`${handedness}RingProximal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}RingIntermediate`, data![`${handedness}RingIntermediate`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}RingDistal`, data![`${handedness}RingDistal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}IndexProximal`, data![`${handedness}IndexProximal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}IndexIntermediate`, data![`${handedness}IndexIntermediate`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}IndexDistal`, data![`${handedness}IndexDistal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}MiddleProximal`, data![`${handedness}MiddleProximal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}MiddleIntermediate`, data![`${handedness}MiddleIntermediate`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}MiddleDistal`, data![`${handedness}MiddleDistal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}ThumbProximal`, data![`${handedness}ThumbProximal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}ThumbIntermediate`, data![`${handedness}ThumbIntermediate`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}ThumbDistal`, data![`${handedness}ThumbDistal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}LittleProximal`, data![`${handedness}LittleProximal`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}LittleIntermediate`, data![`${handedness}LittleIntermediate`], 1, 0.3, avatarRig)
    updateRigRotation(`${handedness}LittleDistal`, data![`${handedness}LittleDistal`], 1, 0.3, avatarRig)
  }
}
export default UpdateSolvedHands
