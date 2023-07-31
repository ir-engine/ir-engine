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

import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'

export const motionCaptureHeadSuffix = '_motion_capture_head'
export const motionCaptureLeftHandSuffix = '_motion_capture_left_hand'
export const motionCaptureRightHandSuffix = '_motion_capture_right_hand'

const objs = [] as Mesh[]
const debug = true

if (debug)
  for (let i = 0; i < 33; i++) {
    objs.push(new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial()))
    Engine?.instance?.scene.add(objs[i])
  }

const UpdateRawHands = (data, hipsPos, avatarRig, avatarTransform) => {
  if (data) {
    const engineState = getState(EngineState)

    const leftHand = avatarRig?.vrm?.humanoid?.getRawBone('leftHand')?.node
    const rightHand = avatarRig?.vrm?.humanoid?.getRawBone('rightHand')?.node
  }
}

export default UpdateRawHands
