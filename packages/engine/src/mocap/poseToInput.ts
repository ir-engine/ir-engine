/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getComponent, getMutableComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState, none } from '@ir-engine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { NormalizedBoneComponent } from '../avatar/components/NormalizedBoneComponent'
import { MotionCapturePoseComponent } from './MotionCapturePoseComponent'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'

export type MotionCapturePoses = 'sitting' | 'standing'
/**todo: this can be filled out with hold/end data for the pose */
export type MotionCapturePoseState = { begun: boolean }

const minSeatedAngle = 1.25, //radians
  poseHoldTime = 0.25 //seconds
let poseHoldTimer = 0

export const evaluatePose = (entity: Entity) => {
  const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
  if (!rig.hips) return

  const deltaSeconds = getState(ECSState).deltaSeconds

  if (!hasComponent(entity, MotionCapturePoseComponent)) setComponent(entity, MotionCapturePoseComponent)

  const pose = getMutableComponent(entity, MotionCapturePoseComponent)

  if (!MotionCaptureRigComponent.solvingLowerBody[entity]) return 'none'

  const rightUpperLeg = getComponent(rig.rightUpperLeg, NormalizedBoneComponent).quaternion
  const leftUpperLeg = getComponent(rig.leftUpperLeg, NormalizedBoneComponent).quaternion
  const spine = getComponent(rig.spine, NormalizedBoneComponent).quaternion
  /**Detect if our legs pose has changed by their angle */
  const getLegsSeatedChange = (toPose: MotionCapturePoses): boolean => {
    let metTargetStateAngle =
      rightUpperLeg.angleTo(spine) < minSeatedAngle && leftUpperLeg.angleTo(spine) < minSeatedAngle
    metTargetStateAngle = toPose == 'sitting' ? !metTargetStateAngle : metTargetStateAngle

    if (!metTargetStateAngle || pose[toPose].value) return false

    poseHoldTimer += deltaSeconds
    if (poseHoldTimer > poseHoldTime) {
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
