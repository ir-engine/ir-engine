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
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { PortalComponent, PortalState } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

import { AvatarState } from '@etherealengine/engine/src/avatar/state/AvatarNetworkState'
import { UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { LinkState } from '@etherealengine/engine/src/scene/components/LinkComponent'
import { RouterState } from '../../common/services/RouterService'
import { LocationState } from '../../social/services/LocationService'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'

const logger = multiLogger.child({ component: 'client-core:world' })

export const useEngineInjection = () => {
  const loaded = useHookstate(false)
  useEffect(() => {
    loadEngineInjection().then(() => {
      loaded.set(true)
    })
  }, [])
  return loaded.value
}

export const useLocationSpawnAvatar = (spectate = false) => {
  const sceneLoaded = useHookstate(getMutableState(EngineState).sceneLoaded)

  useEffect(() => {
    if (spectate) {
      if (!sceneLoaded.value) return
      dispatchAction(EngineActions.spectateUser({}))
      return
    }

    const spectateParam = getSearchParamFromURL('spectate')

    if (Engine.instance.localClientEntity || !sceneLoaded.value || spectateParam) return

    // the avatar should only be spawned once, after user auth and scene load
    const user = getState(AuthState).user
    const avatarDetails = user.avatar
    const spawnPoint = getSearchParamFromURL('spawnPoint')

    const avatarSpawnPose = spawnPoint
      ? getSpawnPoint(spawnPoint, Engine.instance.userID)
      : getRandomSpawnPoint(Engine.instance.userID)

    if (avatarDetails.modelResource?.url) {
      spawnLocalAvatarInWorld({
        avatarSpawnPose,
        avatarID: user.avatar.id!,
        name: user.name
      })
    } else {
      AvatarState.selectRandomAvatar()
    }
  }, [sceneLoaded])
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
  console.log('despawnSelfAvatar', clientEntity)
  if (!clientEntity) return

  const network = NetworkState.worldNetwork

  const peersCountForUser = network?.users?.[Engine.instance.userID]?.length

  // if we are the last peer in the world for this user, destroy the object
  if (!peersCountForUser || peersCountForUser === 1) {
    dispatchAction(WorldNetworkAction.destroyObject({ entityUUID: getComponent(clientEntity, UUIDComponent) }))
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

export const useLinkTeleport = () => {
  const linkState = useHookstate(getMutableState(LinkState))

  useEffect(() => {
    const location = linkState.location.value
    if (!location) return

    logger.info('Relocating to linked location.')

    RouterState.navigate('/location/' + location)
    LocationService.getLocationByName(location)

    // shut down connection with existing world instance server
    // leaving a world instance server will check if we are in a location media instance and shut that down too
    leaveNetwork(NetworkState.worldNetwork as SocketWebRTCClientNetwork)

    getMutableState(AppLoadingState).merge({
      state: AppLoadingStates.START_STATE,
      loaded: false
    })
    getMutableState(LinkState).location.set(undefined)
  }, [linkState.location])
}

export const usePortalTeleport = () => {
  const engineState = useHookstate(getMutableState(EngineState))
  const locationState = useHookstate(getMutableState(LocationState))
  const portalState = useHookstate(getMutableState(PortalState))

  useEffect(() => {
    const activePortalEntity = portalState.activePortalEntity.value
    if (!activePortalEntity) return

    const activePortal = getComponent(activePortalEntity, PortalComponent)

    const currentLocation = locationState.locationName.value.split('/')[1]
    if (currentLocation === activePortal.location || UUIDComponent.getEntityByUUID(activePortal.linkedPortalId)) {
      teleportAvatar(
        Engine.instance.localClientEntity!,
        activePortal.remoteSpawnPosition,
        true
        // activePortal.remoteSpawnRotation
      )
      portalState.activePortalEntity.set(UndefinedEntity)
      return
    }

    if (activePortal.redirect) {
      window.location.href = engineState.publicPath.value + '/location/' + activePortal.location
      return
    }

    if (activePortal.effectType !== 'None') {
      PortalComponent.setPlayerInPortalEffect(activePortal.effectType)
    } else {
      getMutableState(PortalState).portalReady.set(true)
      getMutableState(AppLoadingState).merge({
        state: AppLoadingStates.START_STATE,
        loaded: false
      })
      // teleport player to where the portal spawn position is
      teleportAvatar(Engine.instance.localClientEntity, activePortal.remoteSpawnPosition)
    }
  }, [portalState.activePortalEntity])

  useEffect(() => {
    if (!portalState.activePortalEntity.value || !portalState.portalReady.value) return

    const activePortalEntity = portalState.activePortalEntity.value
    const activePortal = getComponent(activePortalEntity, PortalComponent)

    RouterState.navigate('/location/' + activePortal.location)
    LocationService.getLocationByName(activePortal.location)

    // shut down connection with existing world instance server
    // leaving a world instance server will check if we are in a location media instance and shut that down too
    leaveNetwork(NetworkState.worldNetwork as SocketWebRTCClientNetwork)
  }, [portalState.portalReady])
}

type Props = {
  spectate?: boolean
}

export const useLoadEngineWithScene = ({ spectate }: Props = {}) => {
  const engineState = useHookstate(getMutableState(EngineState))
  const appState = useHookstate(getMutableState(AppLoadingState).state)

  useLocationSpawnAvatar(spectate)
  usePortalTeleport()
  useLinkTeleport()

  useEffect(() => {
    if (engineState.sceneLoaded.value && appState.value !== AppLoadingStates.SUCCESS) {
      getMutableState(AppLoadingState).merge({
        state: AppLoadingStates.SUCCESS,
        loaded: true
      })
      /** used by the PWA service worker */
      window.dispatchEvent(new Event('load'))
    }
  }, [engineState.sceneLoaded, engineState.loadingProgress])
}

export const useNetwork = (props: { online?: boolean }) => {
  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: !!props.online,
      media: !!props.online,
      friends: !!props.online,
      instanceID: !!props.online,
      roomID: false
    })
  }, [props.online])

  // const engineState = useHookstate(getMutableState(EngineState))
  // const authState = useHookstate(getMutableState(AuthState))

  // /** Offline/local world network */
  // useEffect(() => {
  //   if (!engineState.sceneLoaded.value || props.online) return

  //   const userId = Engine.instance.userID
  //   const peerID = Engine.instance.peerID
  //   const userIndex = 1
  //   const peerIndex = 1

  //   const networkState = getMutableState(NetworkState)
  //   networkState.hostIds.world.set(userId as any as InstanceID)
  //   addNetwork(createNetwork(userId as any as InstanceID, userId, NetworkTopics.world))
  //   addOutgoingTopicIfNecessary(NetworkTopics.world)

  //   NetworkState.worldNetworkState.authenticated.set(true)
  //   NetworkState.worldNetworkState.connected.set(true)
  //   NetworkState.worldNetworkState.ready.set(true)

  //   NetworkPeerFunctions.createPeer(
  //     NetworkState.worldNetwork as Network,
  //     peerID,
  //     peerIndex,
  //     userId,
  //     userIndex,
  //     authState.user.name.value
  //   )

  //   return () => {
  //     removeNetwork(NetworkState.worldNetwork as Network)
  //     networkState.hostIds.world.set(none)
  //   }
  // }, [engineState.sceneLoaded, props.online])
}
