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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'

import { getSearchParamFromURL } from '@ir-engine/common/src/utils/getSearchParamFromURL'
import {
  defineSystem,
  Entity,
  EntityID,
  getOptionalComponent,
  PresentationSystemGroup,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useHasComponent,
  useOptionalComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint } from '@ir-engine/engine/src/avatar/functions/getSpawnPoint'
import { spawnLocalAvatarInWorld } from '@ir-engine/engine/src/avatar/functions/spawnLocalAvatarInWorld'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import {
  dispatchAction,
  getMutableState,
  getState,
  NetworkPeerState,
  NetworkState,
  useHookstate,
  useImmediateEffect,
  useMutableState
} from '@ir-engine/hyperflux'
import { SpectateActions } from '@ir-engine/spatial/src/camera/systems/SpectateSystem'

import { useFind, useMutation } from '@ir-engine/common'
import { config } from '@ir-engine/common/src/config'
import { avatarPath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import { EngineState, useChildrenWithComponents } from '@ir-engine/ecs'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { PoiCameraComponent } from '@ir-engine/spatial/src/camera/components/PoiCameraComponent'
import { CameraMode, CameraModeType } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { iOS } from '@ir-engine/spatial/src/common/functions/isMobile'
import { SearchParamState } from '../common/services/RouterService'
import { useLoadedSceneEntity } from '../hooks/useLoadedSceneEntity'
import { LocationState } from '../social/services/LocationService'
import { AuthState } from '../user/services/AuthService'

export const AvatarSpawnReactor = (props: { sceneEntity: Entity }) => {
  const userID = useMutableState(EngineState).userID.value
  const { sceneEntity } = props
  const searchParams = useMutableState(SearchParamState)

  const spectateEntity = useHookstate(getSearchParamFromURL('spectate') as EntityID)

  const settingsQuery = useChildrenWithComponents(sceneEntity, [SceneSettingsComponent])

  useImmediateEffect(() => {
    const sceneSettingsSpectateEntity = getOptionalComponent(settingsQuery[0], SceneSettingsComponent)?.spectateEntity
    spectateEntity.set(sceneSettingsSpectateEntity || (getSearchParamFromURL('spectate') as EntityID))
  }, [settingsQuery[0], searchParams.value['spectate']])

  const isSpectating = typeof spectateEntity.value === 'string'

  useEffect(() => {
    if (!isSpectating) return
    dispatchAction(
      SpectateActions.spectateEntity({
        spectatorUserID: userID,
        spectatingEntity: spectateEntity.value
      })
    )

    return () => {
      dispatchAction(SpectateActions.exitSpectate({ spectatorUserID: userID }))
    }
  }, [isSpectating])

  const userAvatarQuery = useFind(userAvatarPath, {
    query: {
      userId: userID
    }
  })

  const userAvatar = userAvatarQuery.data[0]

  useEffect(() => {
    if (isSpectating || !userAvatar) return

    const rootUUID = UUIDComponent.get(sceneEntity)
    const avatarSpawnPose = getRandomSpawnPoint(userID)
    const user = getState(AuthState).user
    /**@todo force default avatars. Temporary solution for memory related crashing on iOS. */
    const avatarURL = iOS
      ? config.client.fileServer + '/projects/ir-engine/default-project/assets/avatars/irRobot.vrm'
      : userAvatar.avatar.modelResource!.url
    spawnLocalAvatarInWorld({
      parentUUID: rootUUID,
      avatarSpawnPose,
      avatarURL,
      name: user.name
    })

    return () => {
      const selfAvatarUUID = AvatarComponent.getSelfAvatarUUID()

      const currentNetwork = NetworkState.worldNetwork
      const networkPeerState = getState(NetworkPeerState)[currentNetwork?.id]
      const peersCountForUser = networkPeerState?.users?.[userID]?.length || 0

      if (peersCountForUser <= 1) {
        dispatchAction(
          WorldNetworkAction.destroyEntity({
            entityUUID: selfAvatarUUID
          })
        )
      }
    }
  }, [isSpectating, !!userAvatar])

  const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
  const errorWithAvatar = useHasComponent(selfAvatarEntity, ErrorComponent)
  const isMissingAvatar = userAvatarQuery.data.length === 0 && userAvatarQuery.status === 'success'
  const needsNewAvatar = errorWithAvatar || isMissingAvatar

  const userAvatarMutation = useMutation(userAvatarPath)

  const avatarsQuery = useFind(avatarPath)

  useEffect(() => {
    if (!needsNewAvatar || !avatarsQuery.data.length) return
    const randomAvatar = avatarsQuery.data[Math.floor(Math.random() * avatarsQuery.data.length)]
    userAvatarMutation.patch(null, { avatarId: randomAvatar.id }, { query: { userId: userID } })
  }, [needsNewAvatar])

  useEffect(() => {
    if (isSpectating || !userAvatar) return
    /**@todo force default avatars. Temporary solution for memory related crashing on iOS. */
    const avatarURL = iOS
      ? config.client.fileServer + '/projects/ir-engine/default-project/assets/avatars/irRobot.vrm'
      : userAvatar.avatar.modelResource!.url
    dispatchAction(
      AvatarNetworkAction.setAvatarURL({
        avatarURL,
        entityUUID: AvatarComponent.getSelfAvatarUUID()
      })
    )
  }, [isSpectating, userAvatar])

  return null
}

const CameraSettingsReactor = (props: {
  cameraSettingsEntity: Entity | null
  onCameraModeChange?: (cameraMode: CameraModeType) => void
}) => {
  const { cameraSettingsEntity, onCameraModeChange } = props

  const engineState = useMutableState(EngineState)
  const referenceSpaceState = useMutableState(ReferenceSpaceState)

  const cameraSettingsComponent = useOptionalComponent(cameraSettingsEntity ?? UndefinedEntity, CameraSettingsComponent)

  const cameraMode = cameraSettingsComponent?.cameraMode.value ?? CameraMode.FOLLOW

  useEffect(() => {
    onCameraModeChange?.(cameraMode)
  }, [cameraMode, onCameraModeChange])

  useEffect(() => {
    const cameraEntity = referenceSpaceState.viewerEntity.value

    if (engineState.isEditing.value || !cameraEntity || cameraMode !== CameraMode.GUIDED) return

    setComponent(cameraEntity, PoiCameraComponent)

    return () => {
      removeComponent(cameraEntity, PoiCameraComponent)
    }
  }, [cameraMode, referenceSpaceState.viewerEntity, engineState.isEditing])

  return null
}

const reactor = () => {
  const userID = useMutableState(EngineState).userID.value
  const locationSceneURL = useHookstate(getMutableState(LocationState).currentLocation.location.sceneURL).value
  const sceneEntity = useLoadedSceneEntity(locationSceneURL)
  const gltfLoaded = GLTFComponent.useSceneLoaded(sceneEntity)

  const cameraSettingsComponents = useChildrenWithComponents(sceneEntity, [CameraSettingsComponent])
  const cameraSettingsEntity = cameraSettingsComponents.length > 0 ? cameraSettingsComponents[0] : null
  const currentCameraMode = useHookstate<CameraModeType>(CameraMode.FOLLOW)

  const handleCameraModeChange = (cameraMode: CameraModeType) => {
    currentCameraMode.set(cameraMode)
  }

  if (!gltfLoaded || !userID) return null

  return (
    <>
      <CameraSettingsReactor cameraSettingsEntity={cameraSettingsEntity} onCameraModeChange={handleCameraModeChange} />
      {currentCameraMode.value === CameraMode.FOLLOW && (
        <AvatarSpawnReactor key={sceneEntity} sceneEntity={sceneEntity} />
      )}
    </>
  )
}

export const AvatarSpawnSystem = defineSystem({
  uuid: 'ee.client.AvatarSpawnSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
