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

import { getState, none } from '@etherealengine/hyperflux'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { EngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../ecs/functions/ComponentFunctions'
import { MotionCapturePoseComponent } from './MotionCapturePoseComponent'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'

export type MotionCapturePoses = 'sitting' | 'standing'
/**todo: this can be filled out with hold/end data for the pose */
export type MotionCapturePoseState = { begun: boolean }

const minSeatedAngle = 1.25, //radians
  poseHoldTime = 0.5 //seconds
let poseHoldTimer = 0

export const evaluatePose = (entity: Entity) => {
  const rig = getComponent(entity, AvatarRigComponent).rig
  const deltaSeconds = getState(EngineState).deltaSeconds
  const pose = getMutableComponent(entity, MotionCapturePoseComponent)
  if (MotionCaptureRigComponent.lowerBodySolveFactor[entity] < 1) return 'none'

  /**Detect if our legs pose has changed by their angle */
  const getLegsSeatedChange = (toPose: MotionCapturePoses): boolean => {
    let metTargetStateAngle =
      rig.rightUpperLeg.node.quaternion.angleTo(rig.spine.node.quaternion) < minSeatedAngle &&
      rig.leftUpperLeg.node.quaternion.angleTo(rig.spine.node.quaternion) < minSeatedAngle
    metTargetStateAngle = toPose == 'sitting' ? !metTargetStateAngle : metTargetStateAngle

    if (!metTargetStateAngle || pose[toPose].value) return false

    poseHoldTimer += deltaSeconds
    if (poseHoldTimer > poseHoldTime) {
      console.log(toPose)
      //remove old pose
      pose[toPose === 'standing' ? 'sitting' : 'standing'].set(none)
      poseHoldTimer = 0
      return true
    }

    return false
  }

  /**if we find a change in pose, set a new pose
   * otherwise, set the begun property to false */
  if (getLegsSeatedChange('sitting')) pose['sitting'].set({ begun: true })
  else if (pose.sitting.value && pose.sitting.begun.value) pose.sitting.begun.set(false)

  if (getLegsSeatedChange('standing')) pose['standing'].set({ begun: true })
  else if (pose.standing.value && pose.standing.begun.value) pose.standing.begun.set(false)
}
