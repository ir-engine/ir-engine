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
import { useParams } from 'react-router-dom'

import { LocationService } from '@etherealengine/client-core/src/social/services/LocationService'
import { leaveNetwork } from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { getSearchParamFromURL } from '@etherealengine/common/src/utils/getSearchParamFromURL'
import { getRandomSpawnPoint, getSpawnPoint } from '@etherealengine/engine/src/avatar/functions/getSpawnPoint'
import { teleportAvatar } from '@etherealengine/engine/src/avatar/functions/moveAvatar'
import {
  AppLoadingAction,
  AppLoadingState,
  AppLoadingStates
} from '@etherealengine/engine/src/common/AppLoadingService'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { addComponent, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createNetwork, Network, NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import {
  receiveJoinWorld,
  spawnLocalAvatarInWorld
} from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { addNetwork, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { PortalComponent, PortalEffects } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { setAvatarToLocationTeleportingState } from '@etherealengine/engine/src/scene/functions/loaders/PortalFunctions'
import { addOutgoingTopicIfNecessary, dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

import { UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { NotificationService } from '../../common/services/NotificationService'
import { useRouter } from '../../common/services/RouterService'
import { LocationState } from '../../social/services/LocationService'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { AvatarService } from '../../user/services/AvatarService'
import { startClientSystems } from '../../world/startClientSystems'

const logger = multiLogger.child({ component: 'client-core:world' })

export const initClient = async () => {
  if (getMutableState(EngineState).isEngineInitialized.value) return

  const projects = Engine.instance.api.service('projects').find()

  startClientSystems()
  await loadEngineInjection(await projects)

  dispatchAction(EngineActions.initializeEngine({ initialised: true }))
}

export const useLoadEngine = () => {
  useEffect(() => {
    initClient()
  }, [])
}

const fetchMissingAvatar = async (user, avatarSpawnPose) => {
  const avatar = await AvatarService.getAvatar(user.avatar.id.value)
  if (avatar && avatar.modelResource?.url)
    spawnLocalAvatarInWorld({
      avatarSpawnPose,
      avatarID: avatar.id,
      name: user.name.value
    })
  else
    NotificationService.dispatchNotify(
      'Your avatar is missing its model. Please change your avatar from the user menu.',
      { variant: 'error' }
    )
}

export const useLocationSpawnAvatar = (spectate = false) => {
  const sceneLoaded = useHookstate(getMutableState(EngineState).sceneLoaded)
  const authState = useHookstate(getMutableState(AuthState))

  const spectateParam = useParams<{ spectate: UserId }>().spectate

  useEffect(() => {
    if (spectate) {
      if (!sceneLoaded.value || !authState.user.value || !authState.user.avatar.value) return
      dispatchAction(EngineActions.spectateUser({}))
      dispatchAction(EngineActions.joinedWorld({}))
      return
    }

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
      ? getSpawnPoint(spawnPoint, Engine.instance.userId)
      : getRandomSpawnPoint(Engine.instance.userId)

    if (avatarDetails.modelResource?.url)
      spawnLocalAvatarInWorld({
        avatarSpawnPose,
        avatarID: user.avatar.id.value,
        name: user.name.value
      })
    else fetchMissingAvatar(user, avatarSpawnPose)
  }, [sceneLoaded, authState.user, authState.user?.avatar, spectateParam])
}

export const usePortalTeleport = () => {
  const route = useRouter()
  const engineState = useHookstate(getMutableState(EngineState))
  const locationState = useHookstate(getMutableState(LocationState))

  useEffect(() => {
    if (engineState.isTeleporting.value) {
      logger.info('Resetting connection for portal teleport.')
      const activePortalEntity = Engine.instance.activePortalEntity

      if (!activePortalEntity) return

      const activePortal = getComponent(activePortalEntity, PortalComponent)

      const currentLocation = locationState.locationName.value.split('/')[1]
      if (currentLocation === activePortal.location || UUIDComponent.entitiesByUUID[activePortal.linkedPortalId]) {
        teleportAvatar(
          Engine.instance.localClientEntity!,
          activePortal.remoteSpawnPosition
          // activePortal.remoteSpawnRotation
        )
        Engine.instance.activePortalEntity = UndefinedEntity
        dispatchAction(EngineActions.setTeleporting({ isTeleporting: false, $time: Date.now() + 500 }))
        return
      }

      if (activePortal.redirect) {
        window.location.href = engineState.publicPath.value + '/location/' + activePortal.location
        return
      }

      route('/location/' + activePortal.location)
      LocationService.getLocationByName(activePortal.location)

      // shut down connection with existing world instance server
      // leaving a world instance server will check if we are in a location media instance and shut that down too
      leaveNetwork(Engine.instance.worldNetwork as SocketWebRTCClientNetwork)

      setAvatarToLocationTeleportingState()
      if (activePortal.effectType !== 'None') {
        addComponent(Engine.instance.localClientEntity!, PortalEffects.get(activePortal.effectType), true)
      } else {
        dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.START_STATE }))
      }
    }
  }, [engineState.isTeleporting])
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
    if (engineState.sceneLoaded.value && appState.value !== AppLoadingStates.SUCCESS)
      dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SUCCESS }))
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
    dispatchAction(EngineActions.connectToWorld({ connectedWorld: true }))
  }, [])

  /** OFFLINE */
  useEffect(() => {
    if (engineState.sceneLoaded.value) {
      const userId = Engine.instance.userId
      const peerID = Engine.instance.peerID
      const userIndex = 1
      const peerIndex = 1

      const networkState = getMutableState(NetworkState)
      networkState.hostIds.world.set(userId)
      addNetwork(createNetwork(userId, NetworkTopics.world))
      addOutgoingTopicIfNecessary(NetworkTopics.world)

      NetworkPeerFunctions.createPeer(
        Engine.instance.worldNetwork as Network,
        peerID,
        peerIndex,
        userId,
        userIndex,
        authState.user.name.value
      )

      if (props?.spectate) return

      receiveJoinWorld({
        cachedActions: [],
        peerIndex,
        routerRtpCapabilities: undefined
      })
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])
}
