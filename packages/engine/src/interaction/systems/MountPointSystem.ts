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

import { defineActionQueue, dispatchAction, getState } from '@etherealengine/hyperflux'

import { animationStates, defaultAnimationPath } from '../../avatar/animation/Util'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { MountPoint, MountPointComponent } from '../../scene/components/MountPointComponent'
import { SittingComponent } from '../../scene/components/SittingComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
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
    setComponent(entity, BoundingBoxComponent, {
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
    if (action.$from !== Engine.instance.userID) continue
    if (!action.targetEntity || !hasComponent(action.targetEntity!, MountPointComponent)) continue
    const avatarEntity = NetworkObjectComponent.getUserAvatarEntity(action.$from)

    const mountPoint = getComponent(action.targetEntity!, MountPointComponent)
    const mountPointTransform = getComponent(action.targetEntity!, TransformComponent)
    if (mountPoint.type === MountPoint.seat) {
      const avatar = getComponent(avatarEntity, AvatarComponent)

      if (hasComponent(avatarEntity, SittingComponent)) continue

      const transform = getComponent(action.targetEntity!, TransformComponent)
      const rigidBody = getComponent(avatarEntity, RigidBodyComponent)
      rigidBody.body.setTranslation(
        {
          x: transform.position.x,
          y: transform.position.y - avatar.avatarHalfHeight * 0.5,
          z: transform.position.z
        },
        true
      )
      rigidBody.body.setRotation(
        {
          x: transform.rotation.x,
          y: transform.rotation.y,
          z: transform.rotation.z,
          w: transform.rotation.w
        },
        true
      )
      teleportAvatar(avatarEntity, mountPointTransform.position)
      rigidBody.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rigidBody.body.setEnabled(false)
      setComponent(avatarEntity, SittingComponent, {
        mountPointEntity: action.targetEntity!
      })
      const sitting = getComponent(avatarEntity, SittingComponent)
      getComponent(avatarEntity, AvatarControllerComponent).movementEnabled = false
      dispatchAction(
        AvatarNetworkAction.setAnimationState({
          filePath: defaultAnimationPath + animationStates.seated + '.fbx',
          clipName: animationStates.seated,
          loop: true,
          layer: 1,
          entityUUID: getComponent(avatarEntity, UUIDComponent)
        })
      )
    }
  }

  for (const entity of sittingIdleQuery()) {
    const controller = getComponent(entity, AvatarControllerComponent)
    const rigidBody = getComponent(entity, RigidBodyComponent)
    if (controller.gamepadLocalInput.lengthSq() > 0.01) {
      const avatarTransform = getComponent(entity, TransformComponent)

      removeComponent(entity, SittingComponent)
      getComponent(Engine.instance.localClientEntity, AvatarControllerComponent).movementEnabled = true
      dispatchAction(
        AvatarNetworkAction.setAnimationState({
          filePath: defaultAnimationPath + animationStates.seated + '.fbx',
          clipName: animationStates.seated,
          needsSkip: true,
          entityUUID: getComponent(entity, UUIDComponent)
        })
      )
      rigidBody.body.setEnabled(true)
    }
  }
}

export const MountPointSystem = defineSystem({
  uuid: 'ee.engine.MountPointSystem',
  execute
})
