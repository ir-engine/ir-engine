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

import { useHookstate } from '@hookstate/core'
import { useEffect } from 'react'

import { LocationService } from '@etherealengine/client-core/src/social/services/LocationService'
import { leaveNetwork } from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { getSearchParamFromURL } from '@etherealengine/common/src/utils/getSearchParamFromURL'
import { getRandomSpawnPoint, getSpawnPoint } from '@etherealengine/engine/src/avatar/functions/getSpawnPoint'
import { teleportAvatar } from '@etherealengine/engine/src/avatar/functions/moveAvatar'
import { AppLoadingState, AppLoadingStates } from '@etherealengine/engine/src/common/AppLoadingService'
import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import {
  addComponent,
  getComponent,
  removeComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NetworkState, addNetwork } from '@etherealengine/engine/src/networking/NetworkState'
import { Network, NetworkTopics, createNetwork } from '@etherealengine/engine/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import {
  PortalComponent,
  PortalEffects,
  PortalState
} from '@etherealengine/engine/src/scene/components/PortalComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { setAvatarToLocationTeleportingState } from '@etherealengine/engine/src/scene/functions/loaders/PortalFunctions'
import { addOutgoingTopicIfNecessary, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

import { AvatarState } from '@etherealengine/engine/src/avatar/state/AvatarNetworkState'
import { FollowCameraComponent } from '@etherealengine/engine/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/engine/src/camera/components/TargetCameraRotationComponent'
import { UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { InstanceID } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { projectsPath } from '@etherealengine/engine/src/schemas/projects/projects.schema'
import { ComputedTransformComponent } from '@etherealengine/engine/src/transform/components/ComputedTransformComponent'
import { RouterState } from '../../common/services/RouterService'
import { LocationState } from '../../social/services/LocationService'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { useClientSystems } from '../../world/useClientSystems'

const logger = multiLogger.child({ component: 'client-core:world' })

export const initClient = async () => {
  if (getMutableState(EngineState).isEngineInitialized.value) return

  const projects = Engine.instance.api.service(projectsPath).find()

  await loadEngineInjection(await projects)

  getMutableState(EngineState).isEngineInitialized.set(true)
}

export const useLoadEngine = () => {
  useEffect(() => {
    initClient()
  }, [])

  useClientSystems()
}

export const useLocationSpawnAvatar = (spectate = false) => {
  const sceneLoaded = useHookstate(getMutableState(EngineState).sceneLoaded)
  const authState = useHookstate(getMutableState(AuthState))

  useEffect(() => {
    if (spectate) {
      if (!sceneLoaded.value || !authState.user.value || !authState.user.avatar.value) return
      dispatchAction(EngineActions.spectateUser({}))
      return
    }

    const spectateParam = getSearchParamFromURL('spectate')

    if (
      Engine.instance.localClientEntity ||
      !sceneLoaded.value ||
      !authState.user.value ||
      !authState.user.avatar.value ||
      spectateParam
    )
      return

    // the avatar should only be spawned once, after user auth and scene load
    const user = authState.user
    const avatarDetails = user.avatar.value
    const spawnPoint = getSearchParamFromURL('spawnPoint')

    const avatarSpawnPose = spawnPoint
      ? getSpawnPoint(spawnPoint, Engine.instance.userID)
      : getRandomSpawnPoint(Engine.instance.userID)

    if (avatarDetails.modelResource?.url) {
      spawnLocalAvatarInWorld({
        avatarSpawnPose,
        avatarID: user.avatar.id.value!,
        name: user.name.value
      })
    } else {
      AvatarState.selectRandomAvatar()
    }
  }, [sceneLoaded, authState.user.avatar])
}

/**
 * Spawns an avatar under the normal conditions, but also despawns it when the component unmounts.
 */
export const useLocationSpawnAvatarWithDespawn = () => {
  useLocationSpawnAvatar()
  useEffect(() => {
    return () => {
      despawnSelfAvatar()
    }
  }, [])
}

export const despawnSelfAvatar = () => {
  const clientEntity = Engine.instance.localClientEntity
  if (!clientEntity) return

  const peersCountForUser =
    getState(NetworkState).networks[getState(NetworkState).hostIds.world!].users[Engine.instance.userID]?.length

  // if we are the last peer in the world for this user, destroy the object
  if (!peersCountForUser || peersCountForUser === 1) {
    dispatchAction(WorldNetworkAction.destroyObject({ entityUUID: getComponent(clientEntity, UUIDComponent) }))
  }

  const cameraEntity = Engine.instance.cameraEntity
  if (!cameraEntity) return

  const cameraComputed = getComponent(cameraEntity, ComputedTransformComponent)
  removeEntity(cameraComputed.referenceEntity)
  removeComponent(cameraEntity, ComputedTransformComponent)
  removeComponent(cameraEntity, FollowCameraComponent)
  removeComponent(cameraEntity, TargetCameraRotationComponent)
}

export const usePortalTeleport = () => {
  const engineState = useHookstate(getMutableState(EngineState))
  const locationState = useHookstate(getMutableState(LocationState))
  const portalState = useHookstate(getMutableState(PortalState))

  useEffect(() => {
    if (!portalState.activePortalEntity.value) return

    logger.info('Resetting connection for portal teleport.')
    const activePortalEntity = portalState.activePortalEntity.value

    if (!activePortalEntity) return

    const activePortal = getComponent(activePortalEntity, PortalComponent)

    const currentLocation = locationState.locationName.value.split('/')[1]
    if (currentLocation === activePortal.location || UUIDComponent.entitiesByUUID[activePortal.linkedPortalId]) {
      teleportAvatar(
        Engine.instance.localClientEntity!,
        activePortal.remoteSpawnPosition
        // activePortal.remoteSpawnRotation
      )
      portalState.activePortalEntity.set(UndefinedEntity)
      return
    }

    if (activePortal.redirect) {
      window.location.href = engineState.publicPath.value + '/location/' + activePortal.location
      return
    }

    RouterState.navigate('/location/' + activePortal.location)
    LocationService.getLocationByName(activePortal.location)

    // shut down connection with existing world instance server
    // leaving a world instance server will check if we are in a location media instance and shut that down too
    leaveNetwork(NetworkState.worldNetwork as SocketWebRTCClientNetwork)

    setAvatarToLocationTeleportingState()
    if (activePortal.effectType !== 'None') {
      addComponent(Engine.instance.localClientEntity!, PortalEffects.get(activePortal.effectType), true)
    } else {
      getMutableState(AppLoadingState).merge({
        state: AppLoadingStates.START_STATE,
        loaded: false
      })
    }
  }, [portalState.activePortalEntity])
}

type Props = {
  spectate?: boolean
}

export const useLoadEngineWithScene = ({ spectate }: Props = {}) => {
  const engineState = useHookstate(getMutableState(EngineState))
  const appState = useHookstate(getMutableState(AppLoadingState).state)

  useLoadEngine()
  useLocationSpawnAvatar(spectate)
  usePortalTeleport()

  useEffect(() => {
    if (engineState.sceneLoaded.value && appState.value !== AppLoadingStates.SUCCESS) {
      getMutableState(AppLoadingState).merge({
        state: AppLoadingStates.SUCCESS,
        loaded: true
      })
      window.dispatchEvent(new Event('load'))
    }
  }, [engineState.sceneLoaded, engineState.loadingProgress])
}

export const useOnlineNetwork = () => {
  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: true,
      media: true,
      friends: true,
      instanceID: true,
      roomID: false
    })
  }, [])
}

export const useOfflineNetwork = (props?: { spectate?: boolean }) => {
  const engineState = useHookstate(getMutableState(EngineState))
  const authState = useHookstate(getMutableState(AuthState))

  useEffect(() => {
    engineState.connectedWorld.set(true)
  }, [])

  /** OFFLINE */
  useEffect(() => {
    if (engineState.sceneLoaded.value) {
      const userId = Engine.instance.userID
      const peerID = Engine.instance.peerID
      const userIndex = 1
      const peerIndex = 1

      const networkState = getMutableState(NetworkState)
      networkState.hostIds.world.set(userId as any as InstanceID)
      addNetwork(createNetwork(userId as any as InstanceID, userId, NetworkTopics.world))
      addOutgoingTopicIfNecessary(NetworkTopics.world)

      NetworkPeerFunctions.createPeer(
        NetworkState.worldNetwork as Network,
        peerID,
        peerIndex,
        userId,
        userIndex,
        authState.user.name.value
      )
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])
}
