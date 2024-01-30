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

import { none, useHookstate } from '@hookstate/core'
import { useEffect } from 'react'

import { LocationService } from '@etherealengine/client-core/src/social/services/LocationService'
import { leaveNetwork } from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import multiLogger from '@etherealengine/common/src/logger'
import { getSearchParamFromURL } from '@etherealengine/common/src/utils/getSearchParamFromURL'
import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { getRandomSpawnPoint, getSpawnPoint } from '@etherealengine/engine/src/avatar/functions/getSpawnPoint'
import { teleportAvatar } from '@etherealengine/engine/src/avatar/functions/moveAvatar'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/avatar/functions/receiveJoinWorld'
import { PortalComponent, PortalState } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { addOutgoingTopicIfNecessary, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { NetworkState, addNetwork, removeNetwork } from '@etherealengine/spatial/src/networking/NetworkState'

import { InstanceID } from '@etherealengine/common/src/schema.type.module'
import { UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { LinkState } from '@etherealengine/engine/src/scene/components/LinkComponent'
import { CameraActions } from '@etherealengine/spatial/src/camera/CameraState'
import { Network, NetworkTopics, createNetwork } from '@etherealengine/spatial/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/spatial/src/networking/functions/NetworkPeerFunctions'
import { WorldNetworkAction } from '@etherealengine/spatial/src/networking/functions/WorldNetworkAction'
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
  const sceneLoaded = useHookstate(getMutableState(SceneState).sceneLoaded)

  useEffect(() => {
    if (!sceneLoaded.value) return

    if (spectate) {
      dispatchAction(CameraActions.spectateUser({}))
      return
    }

    const spectateParam = getSearchParamFromURL('spectate')
    if (spectateParam) return

    // the avatar should only be spawned once, after user auth and scene load
    const user = getState(AuthState).user
    const spawnPoint = getSearchParamFromURL('spawnPoint')

    const avatarSpawnPose = spawnPoint
      ? getSpawnPoint(spawnPoint, Engine.instance.userID)
      : getRandomSpawnPoint(Engine.instance.userID)

    spawnLocalAvatarInWorld({
      avatarSpawnPose,
      avatarID: user.avatar.id!,
      name: user.name
    })
  }, [sceneLoaded.value])
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
      // teleport player to where the portal spawn position is
      teleportAvatar(Engine.instance.localClientEntity, activePortal.remoteSpawnPosition, true)
    }
  }, [portalState.activePortalEntity])

  useEffect(() => {
    if (!portalState.activePortalEntity.value || !portalState.portalReady.value) return

    const activePortalEntity = portalState.activePortalEntity.value
    const activePortal = getComponent(activePortalEntity, PortalComponent)

    RouterState.navigate('/location/' + activePortal.location)
    LocationService.getLocationByName(activePortal.location)

    if (activePortal.effectType === 'None') {
      getMutableState(PortalState).activePortalEntity.set(UndefinedEntity)
    }
  }, [portalState.portalReady])
}

type Props = {
  spectate?: boolean
}

export const useLoadEngineWithScene = ({ spectate }: Props = {}) => {
  const sceneLoaded = useHookstate(getMutableState(SceneState).sceneLoaded)

  useLocationSpawnAvatar(spectate)
  usePortalTeleport()
  useLinkTeleport()

  useEffect(() => {
    if (sceneLoaded.value) {
      /** used by the PWA service worker */
      window.dispatchEvent(new Event('load'))
    }
  }, [sceneLoaded])
}

export const useNetwork = (props: { online?: boolean }) => {
  const sceneLoaded = useHookstate(getMutableState(SceneState).sceneLoaded)

  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: !!props.online,
      media: !!props.online,
      friends: !!props.online,
      instanceID: !!props.online,
      roomID: false
    })
  }, [props.online])

  /** Offline/local world network */
  useEffect(() => {
    if (!sceneLoaded.value || props.online) return

    const userId = Engine.instance.userID
    const peerID = Engine.instance.peerID
    const userIndex = 1
    const peerIndex = 1

    const networkState = getMutableState(NetworkState)
    networkState.hostIds.world.set(userId as any as InstanceID)
    addNetwork(createNetwork(userId as any as InstanceID, userId, NetworkTopics.world))
    addOutgoingTopicIfNecessary(NetworkTopics.world)

    NetworkState.worldNetworkState.authenticated.set(true)
    NetworkState.worldNetworkState.connected.set(true)
    NetworkState.worldNetworkState.ready.set(true)

    NetworkPeerFunctions.createPeer(
      NetworkState.worldNetwork as Network,
      peerID,
      peerIndex,
      userId,
      userIndex,
      getState(AuthState).user.name
    )

    const network = NetworkState.worldNetwork as Network

    return () => {
      removeNetwork(network)
      networkState.hostIds.world.set(none)
    }
  }, [sceneLoaded.value, props.online])
}
