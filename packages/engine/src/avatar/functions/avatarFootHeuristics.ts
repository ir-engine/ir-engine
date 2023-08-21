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
import { Vector3 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ikTargets } from '../animation/Util'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

const walkDirection = new Vector3()
const stepDirection = new Vector3()
const nextStep = new Vector3()
let currentStep = ikTargets.leftFoot
//step threshold should be a function of leg length
//walk threshold to determine when to move the feet back into standing position, should be
export const setIkFootTarget = (stepThreshold: number, walkThreshold: number) => {
  const { localClientEntity, userId } = Engine.instance

  const feet = {
    rightFoot: UUIDComponent.entitiesByUUID[userId + ikTargets.rightFoot],
    leftFoot: UUIDComponent.entitiesByUUID[userId + ikTargets.leftFoot]
  }
  const playerTransform = getComponent(localClientEntity, TransformComponent)
  const playerSpeed = getComponent(localClientEntity, AvatarControllerComponent).speedVelocity * 2500
  for (const [key, foot] of Object.entries(feet)) {
    if (!foot || key != currentStep) continue
    const ikTransform = getComponent(foot, TransformComponent)
    //calculate walk direction
    walkDirection.subVectors(ikTransform.position, playerTransform.position)

    const ikDistanceSqFromPlayer = walkDirection.lengthSq()

    //get distance from the next step position
    const ikDistanceSqFromWalkTarget = stepDirection.subVectors(ikTransform.position, nextStep).lengthSq()

    //interpolate foot to next step position
    ikTransform.position.lerp(nextStep, getState(EngineState).deltaSeconds * (2.5 + playerSpeed))

    //if the foot is further than the foot threshold
    if (ikDistanceSqFromPlayer > stepThreshold * stepThreshold) {
      nextStep.copy(playerTransform.position).sub(walkDirection.multiplyScalar(stepThreshold * stepThreshold))
    }

    //if we're at the target, switch to the other foot
    if (ikDistanceSqFromWalkTarget < 0.025) {
      currentStep = key == ikTargets.leftFoot ? ikTargets.rightFoot : ikTargets.leftFoot
    }
  }
}
