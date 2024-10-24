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

import { useEffect } from 'react'

import { LocationService } from '@ir-engine/client-core/src/social/services/LocationService'
import multiLogger from '@ir-engine/common/src/logger'
import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import { Engine, getComponent, UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { teleportAvatar } from '@ir-engine/engine/src/avatar/functions/moveAvatar'
import { LinkState } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { PortalComponent, PortalState } from '@ir-engine/engine/src/scene/components/PortalComponent'
import {
  addOutgoingTopicIfNecessary,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import {
  addNetwork,
  createNetwork,
  Network,
  NetworkPeerFunctions,
  NetworkState,
  NetworkTopics,
  removeNetwork
} from '@ir-engine/network'
import { loadEngineInjection } from '@ir-engine/projects/loadEngineInjection'
import { EngineState } from '@ir-engine/spatial/src/EngineState'

import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import { RouterState } from '../../common/services/RouterService'
import { LocationState } from '../../social/services/LocationService'
import { AuthState } from '../../user/services/AuthService'

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

export const useLinkTeleport = () => {
  const linkState = useMutableState(LinkState)

  useEffect(() => {
    const location = linkState.location.value
    if (!location) return

    logger.info('Relocating to linked location.')

    RouterState.navigate('/location/' + location)
    LocationService.getLocationByName(location)

    // shut down connection with existing world instance server
    // leaving a world instance server will check if we are in a location media instance and shut that down too
    getMutableState(LinkState).location.set(undefined)
  }, [linkState.location])
}

export const usePortalTeleport = () => {
  const engineState = useMutableState(EngineState)
  const locationState = useMutableState(LocationState)
  const portalState = useMutableState(PortalState)

  useEffect(() => {
    const activePortalEntity = portalState.activePortalEntity.value
    if (!activePortalEntity) return

    const activePortal = getComponent(activePortalEntity, PortalComponent)

    const currentLocation = locationState.locationName.value.split('/')[1]
    if (currentLocation === activePortal.location || UUIDComponent.getEntityByUUID(activePortal.linkedPortalId)) {
      teleportAvatar(
        AvatarComponent.getSelfAvatarEntity(),
        activePortal.remoteSpawnPosition,
        true
        // activePortal.remoteSpawnRotation
      )
      portalState.activePortalEntity.set(UndefinedEntity)
      return
    }

    if (activePortal.redirect) {
      window.location.href = getState(DomainConfigState).publicDomain + '/location/' + activePortal.location
      return
    }

    if (activePortal.effectType !== 'None') {
      PortalComponent.setPlayerInPortalEffect(activePortal.effectType)
    } else {
      getMutableState(PortalState).portalReady.set(true)
      // teleport player to where the portal spawn position is
      teleportAvatar(AvatarComponent.getSelfAvatarEntity(), activePortal.remoteSpawnPosition, true)
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

export const useLoadEngineWithScene = () => {
  usePortalTeleport()
  useLinkTeleport()
}

export const useNetwork = (props: { online?: boolean }) => {
  const acceptedTOS = useMutableState(AuthState).user.acceptedTOS.value

  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: !!props.online,
      media: !!props.online && acceptedTOS,
      friends: !!props.online,
      instanceID: !!props.online,
      roomID: false
    })
  }, [props.online, acceptedTOS])

  /** Offline/local world network */
  useEffect(() => {
    if (props.online) return

    const userID = Engine.instance.userID
    const peerID = Engine.instance.store.peerID
    const peerIndex = 1

    const networkState = getMutableState(NetworkState)
    networkState.hostIds.world.set(userID as any as InstanceID)
    addNetwork(createNetwork(userID as any as InstanceID, peerID, NetworkTopics.world))
    addOutgoingTopicIfNecessary(NetworkTopics.world)

    NetworkState.worldNetworkState.ready.set(true)

    NetworkPeerFunctions.createPeer(NetworkState.worldNetwork as Network, peerID, peerIndex, userID)

    const network = NetworkState.worldNetwork as Network

    return () => {
      removeNetwork(network)
      networkState.hostIds.world.set(none)
    }
  }, [props.online])
}
