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

import React, { useEffect } from 'react'

import { getSearchParamFromURL } from '@ir-engine/common/src/utils/getSearchParamFromURL'
import { spawnLocalAvatarInWorld } from '@ir-engine/common/src/world/receiveJoinWorld'
import {
  defineSystem,
  Engine,
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  PresentationSystemGroup,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint } from '@ir-engine/engine/src/avatar/functions/getSpawnPoint'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { dispatchAction, getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState, WorldNetworkAction } from '@ir-engine/network'
import { SpectateActions } from '@ir-engine/spatial/src/camera/systems/SpectateSystem'

import { useFind, useMutation } from '@ir-engine/common'
import { avatarPath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import { isClient } from '@ir-engine/common/src/utils/getEnvironment'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { useChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { SearchParamState } from '../common/services/RouterService'
import { useLoadedSceneEntity } from '../hooks/useLoadedSceneEntity'
import { LocationState } from '../social/services/LocationService'
import { AuthState } from '../user/services/AuthService'

export const AvatarSpawnReactor = (props: { sceneEntity: Entity }) => {
  if (!isClient) return null
  const { sceneEntity } = props
  const gltfLoaded = GLTFComponent.useSceneLoaded(sceneEntity)
  const searchParams = useMutableState(SearchParamState)

  const spawnAvatar = useHookstate(false)
  const spectateEntity = useHookstate(null as null | EntityUUID)
  const settingsQuery = useChildrenWithComponents(sceneEntity, [SceneSettingsComponent])

  const avatarsQuery = useFind(avatarPath)

  useEffect(() => {
    const sceneSettingsSpectateEntity = getOptionalComponent(settingsQuery[0], SceneSettingsComponent)?.spectateEntity
    spectateEntity.set(
      sceneSettingsSpectateEntity ? sceneSettingsSpectateEntity : (getSearchParamFromURL('spectate') as EntityUUID)
    )
  }, [settingsQuery, searchParams])

  useEffect(() => {
    if (spectateEntity.value === null) return
    dispatchAction(
      SpectateActions.spectateEntity({
        spectatorUserID: Engine.instance.userID,
        spectatingEntity: spectateEntity.value
      })
    )

    return () => {
      dispatchAction(SpectateActions.exitSpectate({ spectatorUserID: Engine.instance.userID }))
    }
  }, [spectateEntity.value])

  useEffect(() => {
    spawnAvatar.set(gltfLoaded && spectateEntity.value === null)
  }, [gltfLoaded, spectateEntity.value])

  const userAvatarQuery = useFind(userAvatarPath, {
    query: {
      userId: Engine.instance.store.userID
    }
  })

  const userAvatar = userAvatarQuery.data[0]

  useEffect(() => {
    if (!spawnAvatar.value || !userAvatar) return

    const rootUUID = getComponent(sceneEntity, UUIDComponent)
    const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userID)
    const user = getState(AuthState).user

    spawnLocalAvatarInWorld({
      parentUUID: rootUUID,
      avatarSpawnPose,
      avatarURL: userAvatar.avatar.modelResource!.url!,
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
    }
  }, [spawnAvatar.value, !!userAvatar])

  const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
  const errorWithAvatar = !!useOptionalComponent(selfAvatarEntity, ErrorComponent)

  const userAvatarMutation = useMutation(userAvatarPath)

  useEffect(() => {
    if (!errorWithAvatar || !avatarsQuery.data.length) return
    const randomAvatar = avatarsQuery.data[Math.floor(Math.random() * avatarsQuery.data.length)]
    userAvatarMutation.patch(null, { avatarId: randomAvatar.id }, { query: { userId: Engine.instance.store.userID } })
  }, [errorWithAvatar])

  useEffect(() => {
    if (!userAvatar) return
    dispatchAction(
      AvatarNetworkAction.setAvatarURL({
        avatarURL: userAvatar.avatar.modelResource!.url,
        entityUUID: (Engine.instance.store.userID + '_avatar') as any as EntityUUID
      })
    )
  }, [userAvatar])

  return null
}

const reactor = () => {
  const locationSceneID = useHookstate(getMutableState(LocationState).currentLocation.location.sceneId).value
  const sceneEntity = useLoadedSceneEntity(locationSceneID)

  if (!sceneEntity) return null

  return <AvatarSpawnReactor key={sceneEntity} sceneEntity={sceneEntity} />
}

export const AvatarSpawnSystem = defineSystem({
  uuid: 'ee.client.AvatarSpawnSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
