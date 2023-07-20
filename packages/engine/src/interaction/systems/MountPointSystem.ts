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

import { Box3, Vector3 } from 'three'

import { defineActionQueue, getState } from '@etherealengine/hyperflux'

import { changeState } from '../../avatar/animation/AnimationGraph'
import { AvatarStates } from '../../avatar/animation/Util'
import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { MountPoint, MountPointComponent } from '../../scene/components/MountPointComponent'
import { SittingComponent } from '../../scene/components/SittingComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponents'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI } from './InteractiveSystem'

/**
 * @todo refactor this into i18n and configurable
 */
const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

const mountPointActionQueue = defineActionQueue(EngineActions.interactedWithObject.matches)
const mountPointQuery = defineQuery([MountPointComponent])
const sittingIdleQuery = defineQuery([SittingComponent])

const execute = () => {
  if (getState(EngineState).isEditor) return

  for (const entity of mountPointQuery.enter()) {
    const mountPoint = getComponent(entity, MountPointComponent)
    addComponent(entity, BoundingBoxComponent, {
      box: new Box3().setFromCenterAndSize(
        getComponent(entity, TransformComponent).position,
        new Vector3(0.1, 0.1, 0.1)
      )
    })
    if (isClient) {
      addInteractableUI(entity, createInteractUI(entity, mountPointInteractMessages[mountPoint.type]))
    }
  }

  for (const action of mountPointActionQueue()) {
    if (action.$from !== Engine.instance.userId) continue
    if (!action.targetEntity || !hasComponent(action.targetEntity!, MountPointComponent)) continue
    const avatarEntity = Engine.instance.getUserAvatarEntity(action.$from)

    const mountPoint = getComponent(action.targetEntity!, MountPointComponent)
    if (mountPoint.type === MountPoint.seat) {
      const avatar = getComponent(avatarEntity, AvatarComponent)

      if (hasComponent(avatarEntity, SittingComponent)) continue

      const transform = getComponent(action.targetEntity!, TransformComponent)
      const rigidBody = getComponent(avatarEntity, RigidBodyComponent)
      rigidBody.body.setTranslation(
        {
          x: transform.position.x,
          y: transform.position.y + avatar.avatarHalfHeight,
          z: transform.position.z
        },
        true
      )
      rigidBody.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      addComponent(avatarEntity, SittingComponent, {
        mountPointEntity: action.targetEntity!,
        state: AvatarStates.SIT_ENTER
      })
      const sitting = getComponent(avatarEntity, SittingComponent)
      getComponent(avatarEntity, AvatarControllerComponent).movementEnabled = false

      const avatarAnimationComponent = getComponent(avatarEntity, AvatarAnimationComponent)

      changeState(avatarAnimationComponent.animationGraph, AvatarStates.SIT_IDLE)
      sitting.state = AvatarStates.SIT_IDLE
    }
  }

  for (const entity of sittingIdleQuery()) {
    const controller = getComponent(entity, AvatarControllerComponent)
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    const avatarComponent = getComponent(entity, AvatarComponent)
    const sitting = getComponent(entity, SittingComponent)

    if (controller.gamepadWorldMovement.lengthSq() > 0.1) {
      sitting.state = AvatarStates.SIT_LEAVE

      changeState(avatarAnimationComponent.animationGraph, AvatarStates.SIT_LEAVE)

      const avatarTransform = getComponent(entity, TransformComponent)
      const newPos = avatarTransform.position
        .clone()
        .add(new Vector3(0, 0, 1).applyQuaternion(avatarTransform.rotation))

      const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, CollisionGroups.Ground)
      const raycastComponentData = {
        type: SceneQueryType.Closest,
        origin: newPos,
        direction: new Vector3(0, -1, 0),
        maxDistance: 2,
        groups: interactionGroups
      }
      const hits = Physics.castRay(Engine.instance.physicsWorld, raycastComponentData)

      if (hits.length > 0) {
        const raycastHit = hits[0] as RaycastHit
        if (raycastHit.normal.y > 0.9) {
          newPos.y -= raycastHit.distance
        }
      } else {
        newPos.copy(avatarTransform.position)
        newPos.y += avatarComponent.avatarHalfHeight
      }

      const rigidbody = getComponent(entity, RigidBodyComponent)
      rigidbody.body.setTranslation(newPos, true)

      changeState(avatarAnimationComponent.animationGraph, AvatarStates.LOCOMOTION)
      removeComponent(entity, SittingComponent)
      getComponent(Engine.instance.localClientEntity, AvatarControllerComponent).movementEnabled = true
    }
  }
}

export const MountPointSystem = defineSystem({
  uuid: 'ee.engine.MountPointSystem',
  execute
})
