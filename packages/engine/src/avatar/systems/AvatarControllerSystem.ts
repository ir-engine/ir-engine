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

import { Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  Engine,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { dispatchAction, useMutableState } from '@ir-engine/hyperflux'
import { NetworkObjectAuthorityTag, NetworkObjectOwnedTag, NetworkState, WorldNetworkAction } from '@ir-engine/network'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { DistanceFromLocalClientComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { getDistanceSquaredFromTarget, TransformSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { AvatarState } from '../state/AvatarNetworkState'
import { AvatarInputSystem } from './AvatarInputSystem'

const controllerQuery = defineQuery([AvatarControllerComponent, NetworkObjectOwnedTag])

const execute = () => {
  const controlledEntities = controllerQuery()

  /** @todo non-immersive camera should utilize isCameraAttachedToAvatar */
  for (const entity of controlledEntities) {
    const controller = getComponent(entity, AvatarControllerComponent)

    const followCamera = getOptionalComponent(controller.cameraEntity, FollowCameraComponent)
    if (followCamera) {
      // todo calculate head size and use that as the bound #7263
      if (followCamera.distance < 0.3) setComponent(entity, AvatarHeadDecapComponent, true)
      else removeComponent(entity, AvatarHeadDecapComponent)
    }

    if (!controller.movementCaptured.length) {
      if (
        !hasComponent(entity, NetworkObjectAuthorityTag) &&
        NetworkState.worldNetwork &&
        controller.gamepadLocalInput.lengthSq() > 0
      ) {
        dispatchAction(
          WorldNetworkAction.transferAuthorityOfObject({
            ownerID: Engine.instance.userID,
            entityUUID: getComponent(entity, UUIDComponent),
            newAuthority: Engine.instance.store.peerID
          })
        )
        setComponent(entity, NetworkObjectAuthorityTag)
      }
    }
  }
}

export const AvatarControllerSystem = defineSystem({
  uuid: 'ee.engine.AvatarControllerSystem',
  insert: { after: AvatarInputSystem },
  execute,
  reactor: () => {
    // we actually have no reference to AvatarState anywhere, so we need to call it to ensure it exists
    useMutableState(AvatarState)
    return null
  }
})

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])

export const AvatarPostTransformSystem = defineSystem({
  uuid: 'ee.engine.AvatarPostTransformSystem',
  insert: { after: TransformSystem },
  execute: () => {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    if (!selfAvatarEntity) return
    const localClientPosition = TransformComponent.getWorldPosition(selfAvatarEntity, vec3)
    if (localClientPosition) {
      for (const entity of distanceFromLocalClientQuery())
        DistanceFromLocalClientComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(
          entity,
          localClientPosition
        )
    }
  }
})

const vec3 = new Vector3()
