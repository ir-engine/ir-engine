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

import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { onInteract } from '../avatar/systems/AvatarInputSystem'
import { EngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'

export type MotionCaptureActionPoses = 'sit' | 'stand' | 'none'
export type MotionCaptureStates = 'sitting' | 'none'

export const PoseState = defineState({
  name: 'PoseState',
  initial: () => {
    return 'none' as MotionCaptureStates
  }
})

const minSeatedAngle = 1.25, //radians
  poseHoldTime = 0.5 //seconds
let poseHoldTimer = 0

export const evaluatePose = (entity: Entity) => {
  const rig = getComponent(entity, AvatarRigComponent).rig
  const deltaSeconds = getState(EngineState).deltaSeconds
  const poseState = getMutableState(PoseState)
  if (!MotionCaptureRigComponent.solvingLowerBody[entity]) return

  const getLegsSeatedChange = (toState: MotionCaptureStates): boolean => {
    let metTargetStateAngle =
      rig.rightUpperLeg.node.quaternion.angleTo(rig.spine.node.quaternion) < minSeatedAngle &&
      rig.leftUpperLeg.node.quaternion.angleTo(rig.spine.node.quaternion) < minSeatedAngle
    metTargetStateAngle = toState == 'sitting' ? metTargetStateAngle : !metTargetStateAngle

    if (!metTargetStateAngle || poseState.value == toState) return false

    poseHoldTimer += deltaSeconds
    if (poseHoldTimer > poseHoldTime) {
      poseState.set(toState)
      poseHoldTimer = 0
      return true
    }

    return false
  }

  if (getLegsSeatedChange('sitting')) onInteract('none', 'sit')
  if (getLegsSeatedChange('none')) onInteract('none', 'stand')
}
