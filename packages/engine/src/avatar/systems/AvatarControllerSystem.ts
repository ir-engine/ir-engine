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

import { useEffect } from 'react'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { addActionReceptor, defineActionQueue, dispatchAction, removeActionReceptor } from '@etherealengine/hyperflux'

import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../../camera/components/TargetCameraRotationComponent'
import { Engine } from '../../ecs/classes/Engine'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { NetworkObjectAuthorityTag, NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { XRAction } from '../../xr/XRState'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { respawnAvatar } from '../functions/respawnAvatar'
import { AvatarInputSettingsReceptor } from '../state/AvatarInputSettingsState'

const localControllerQuery = defineQuery([AvatarControllerComponent, LocalInputTagComponent])
const controllerQuery = defineQuery([AvatarControllerComponent])
const sessionChangedActions = defineActionQueue(XRAction.sessionChanged.matches)

const execute = () => {
  for (const action of sessionChangedActions()) {
    if (action.active) {
      for (const avatarEntity of localControllerQuery()) {
        const controller = getComponent(avatarEntity, AvatarControllerComponent)
        removeComponent(controller.cameraEntity, FollowCameraComponent)
      }
    } else {
      for (const avatarEntity of localControllerQuery()) {
        const controller = getComponent(avatarEntity, AvatarControllerComponent)
        const targetCameraRotation = getComponent(controller.cameraEntity, TargetCameraRotationComponent)
        setComponent(controller.cameraEntity, FollowCameraComponent, {
          targetEntity: avatarEntity,
          phi: targetCameraRotation.phi,
          theta: targetCameraRotation.theta
        })
      }
    }
  }

  for (const avatarEntity of localControllerQuery.enter()) {
    const controller = getComponent(avatarEntity, AvatarControllerComponent)

    const targetCameraRotation = getComponent(controller.cameraEntity, TargetCameraRotationComponent)
    setComponent(controller.cameraEntity, FollowCameraComponent, {
      targetEntity: avatarEntity,
      phi: targetCameraRotation.phi,
      theta: targetCameraRotation.theta
    })

    // todo: this should be called when the avatar is spawned
    dispatchAction(
      WorldNetworkAction.spawnCamera({
        entityUUID: ('camera_' + getComponent(avatarEntity, UUIDComponent)) as EntityUUID
      })
    )
  }

  for (const entity of controllerQuery()) {
    const controller = getComponent(entity, AvatarControllerComponent)
    const followCamera = getOptionalComponent(controller.cameraEntity, FollowCameraComponent)
    if (followCamera) {
      // todo calculate head size and use that as the bound #7263
      if (followCamera.distance < 0.6) setComponent(entity, AvatarHeadDecapComponent, true)
      else removeComponent(entity, AvatarHeadDecapComponent)
    }
  }

  const controlledEntity = Engine.instance.localClientEntity

  if (hasComponent(controlledEntity, AvatarControllerComponent)) {
    const controller = getComponent(controlledEntity, AvatarControllerComponent)

    if (controller.movementEnabled) {
      /** Support multiple peers controlling the same avatar by detecting movement and overriding network authority.
       *    @todo we may want to make this an networked action, rather than lazily removing the NetworkObjectAuthorityTag
       *    if detecting input on the other user #7263
       */
      if (
        !hasComponent(controlledEntity, NetworkObjectAuthorityTag) &&
        Engine.instance.worldNetwork &&
        controller.gamepadWorldMovement.lengthSq() > 0.1 * Engine.instance.deltaSeconds
      ) {
        const networkObject = getComponent(controlledEntity, NetworkObjectComponent)
        dispatchAction(
          WorldNetworkAction.transferAuthorityOfObject({
            ownerId: networkObject.ownerId,
            networkId: networkObject.networkId,
            newAuthority: Engine.instance.peerID
          })
        )
        setComponent(controlledEntity, NetworkObjectAuthorityTag)
      }
    }

    const rigidbody = getComponent(controlledEntity, RigidBodyComponent)
    if (rigidbody.position.y < -10) respawnAvatar(controlledEntity)
  }
}

const reactor = () => {
  useEffect(() => {
    addActionReceptor(AvatarInputSettingsReceptor)
    return () => {
      removeActionReceptor(AvatarInputSettingsReceptor)
    }
  }, [])
  return null
}

export const AvatarControllerSystem = defineSystem({
  uuid: 'ee.engine.AvatarControllerSystem',
  execute,
  reactor
})
