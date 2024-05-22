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

import { Euler, MathUtils, Quaternion, Vector3 } from 'three'

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { Vector3_Up } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'

import { ikTargets } from '../animation/Util'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'

const walkDirection = new Vector3()
const stepDirection = new Vector3()
/** @todo @deprecated put in a component */
const nextSteps = {} as {
  [key: Entity]: {
    [key: string]: { position: Vector3; rotation: Quaternion }
  }
}
const footOffset = new Vector3()
const ikTargetToPlayer = new Vector3()
const offset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
const quat = new Quaternion()
let currentStep = ikTargets.leftFoot
const speedMultiplier = 2

//step threshold should be a function of leg length
//walk threshold to determine when to move the feet back into standing position, should be
export const setIkFootTarget = (userID: UserID, delta: number) => {
  const selfAvatarEntity = AvatarComponent.getUserAvatarEntity(userID)

  const leftFootEntity = UUIDComponent.getEntityByUUID((userID + ikTargets.leftFoot) as EntityUUID)
  const rightFootEntity = UUIDComponent.getEntityByUUID((userID + ikTargets.rightFoot) as EntityUUID)

  if (!leftFootEntity || !rightFootEntity) return

  const leftFootTargetBlendWeight = AvatarIKTargetComponent.blendWeight[leftFootEntity]
  const rightFootTargetBlendWeight = AvatarIKTargetComponent.blendWeight[rightFootEntity]
  if (!leftFootTargetBlendWeight || !rightFootTargetBlendWeight) return

  /** quick fix - set feet to under the avtar and slide around */
  const avatarTransform = getComponent(selfAvatarEntity, TransformComponent)
  const avatar = getComponent(selfAvatarEntity, AvatarComponent)

  const leftFootTransform = getComponent(leftFootEntity, TransformComponent)
  leftFootTransform.position
    .set(avatar.footGap, avatar.footHeight, 0)
    .applyQuaternion(avatarTransform.rotation)
    .add(avatarTransform.position)
  leftFootTransform.rotation.copy(avatarTransform.rotation)

  const rightFootTransform = getComponent(rightFootEntity, TransformComponent)
  rightFootTransform.position
    .set(-avatar.footGap, avatar.footHeight, 0)
    .applyQuaternion(avatarTransform.rotation)
    .add(avatarTransform.position)
  rightFootTransform.rotation.copy(avatarTransform.rotation)

  /** @todo new implementation */
  return

  const stepThresholdSq = avatar.lowerLegLength * avatar.lowerLegLength
  const stepDistance = 0.1

  const feet = {
    [ikTargets.rightFoot]: UUIDComponent.getEntityByUUID((userID + ikTargets.rightFoot) as EntityUUID),
    [ikTargets.leftFoot]: UUIDComponent.getEntityByUUID((userID + ikTargets.leftFoot) as EntityUUID)
  }

  const playerRigidbody = getComponent(selfAvatarEntity, RigidBodyComponent)

  /**calculate foot offset so both feet aren't at the transform's center */
  const calculateFootOffset = () => {
    footOffset.set(currentStep == ikTargets.leftFoot ? avatar.footGap : -avatar.footGap, 0, 0)
    footOffset.applyQuaternion(playerRigidbody.rotation)
    footOffset.add(playerRigidbody.position)
    return footOffset
  }

  const nextStep = nextSteps[selfAvatarEntity]
  if (!nextStep)
    nextSteps[selfAvatarEntity] = {
      [ikTargets.rightFoot]: { position: new Vector3(), rotation: new Quaternion() },
      [ikTargets.leftFoot]: { position: new Vector3(), rotation: new Quaternion() }
    }

  for (const [key, foot] of Object.entries(feet)) {
    const ikTransform = getComponent(foot, TransformComponent)
    if (ikTransform.position.x + ikTransform.position.y + ikTransform.position.z == 0) {
      ikTransform.position.copy(calculateFootOffset())
      continue
    }
    if (!foot || key != currentStep) continue

    calculateFootOffset()

    //calculate movement direction and use it to get speed
    walkDirection.subVectors(playerRigidbody.position, playerRigidbody.previousPosition).setY(0)
    const playerDisplacement = walkDirection.length()

    //get distance from the player
    const ikDistanceSqFromPlayer = ikTargetToPlayer.subVectors(ikTransform.position, footOffset).setY(0).lengthSq()

    //get distance from the next step position
    const ikDistanceSqFromWalkTarget = stepDirection
      .subVectors(ikTransform.position, nextStep[key].position)
      .setY(0)
      .lengthSq()

    //if the foot is further than the foot threshold, start a new step
    if (ikDistanceSqFromPlayer > stepThresholdSq) {
      nextStep[key].position
        .copy(footOffset)
        .add(walkDirection.normalize().multiplyScalar((stepDistance * playerDisplacement) / delta))

      nextStep[key].rotation.identity().setFromUnitVectors(Vector3_Up, walkDirection.normalize())
    }

    //if we're at the target, switch to the other foot
    if (ikDistanceSqFromWalkTarget < 0.01) {
      currentStep = key == ikTargets.leftFoot ? ikTargets.rightFoot : ikTargets.leftFoot
      continue
    }

    const lerpSpeed = MathUtils.clamp(delta * speedMultiplier, 0.2, 1)

    //interpolate foot to next step position
    ikTransform.position.lerp(nextStep[key].position, lerpSpeed)
    //set foot y to player y until we have step math
    ikTransform.position.y = playerRigidbody.position.y + 0.1
    ikTransform.rotation.slerp(quat.copy(playerRigidbody.rotation).multiply(offset), lerpSpeed)
  }
}
