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

import { getSearchParamFromURL } from '@etherealengine/common/src/utils/getSearchParamFromURL'
import {
  Engine,
  Entity,
  PresentationSystemGroup,
  UUIDComponent,
  defineSystem,
  getComponent,
  useComponent
} from '@etherealengine/ecs'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint, getSpawnPoint } from '@etherealengine/engine/src/avatar/functions/getSpawnPoint'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/avatar/functions/receiveJoinWorld'
import { GLTFComponent } from '@etherealengine/engine/src/gltf/GLTFComponent'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { NetworkState, WorldNetworkAction } from '@etherealengine/network'
import { CameraActions } from '@etherealengine/spatial/src/camera/CameraState'
import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { LocationSceneState, LocationState } from '../social/services/LocationService'
import { AuthState } from '../user/services/AuthService'

export const AvatarSpawnReactor = (props: { sceneEntity: Entity }) => {
  const { sceneEntity } = props
  const gltfLoaded = useComponent(sceneEntity, GLTFComponent).progress.value === 100

  useEffect(() => {
    if (!gltfLoaded) return

    const spectate = getSearchParamFromURL('spectate')
    if (spectate) {
      dispatchAction(CameraActions.spectateUser({}))
      return
    }

    // the avatar should only be spawned once, after user auth and scene load
    const user = getState(AuthState).user
    const spawnPoint = getSearchParamFromURL('spawnPoint')

    const avatarSpawnPose = spawnPoint
      ? getSpawnPoint(spawnPoint, Engine.instance.userID)
      : getRandomSpawnPoint(Engine.instance.userID)

    const rootUUID = getComponent(sceneEntity, UUIDComponent)
    spawnLocalAvatarInWorld({
      parentUUID: rootUUID,
      avatarSpawnPose,
      avatarID: user.avatar.id!,
      name: user.name
    })

    return () => {
      const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
      if (!selfAvatarEntity) return

      const network = NetworkState.worldNetwork

      const peersCountForUser = network?.users?.[Engine.instance.userID]?.length

      // if we are the last peer in the world for this user, destroy the object
      if (!peersCountForUser || peersCountForUser === 1) {
        dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID: getComponent(selfAvatarEntity, UUIDComponent) }))
      }

      /** @todo this logic should be handled by the camera system */
      // const cameraEntity = Engine.instance.cameraEntity
      // if (!cameraEntity) return

      // const cameraComputed = getComponent(cameraEntity, ComputedTransformComponent)
      // removeEntity(cameraComputed.referenceEntity)
      // removeComponent(cameraEntity, ComputedTransformComponent)
      // removeComponent(cameraEntity, FollowCameraComponent)
      // removeComponent(cameraEntity, TargetCameraRotationComponent)
    }
  }, [gltfLoaded])

  return null
}

const reactor = () => {
  const locationSceneID = useHookstate(getMutableState(LocationState).currentLocation.location.sceneId).value
  const sceneEntity = LocationSceneState.useScene(locationSceneID)

  if (!sceneEntity) return null

  return <AvatarSpawnReactor key={sceneEntity} sceneEntity={sceneEntity} />
}

export const AvatarSpawnSystem = defineSystem({
  uuid: 'ee.client.AvatarSpawnSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
