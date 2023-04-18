import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { LocationAction, LocationService } from '@etherealengine/client-core/src/social/services/LocationService'
import { leaveNetwork } from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { AuthState, useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { getSearchParamFromURL } from '@etherealengine/common/src/utils/getSearchParamFromURL'
import { getRandomSpawnPoint, getSpawnPoint } from '@etherealengine/engine/src/avatar/AvatarSpawnSystem'
import { teleportAvatar } from '@etherealengine/engine/src/avatar/functions/moveAvatar'
import {
  AppLoadingAction,
  AppLoadingState,
  AppLoadingStates
} from '@etherealengine/engine/src/common/AppLoadingService'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { addComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createNetwork, Network, NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import {
  receiveJoinWorld,
  spawnLocalAvatarInWorld
} from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { addNetwork, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { PortalEffects } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { setAvatarToLocationTeleportingState } from '@etherealengine/engine/src/scene/functions/loaders/PortalFunctions'
import { addOutgoingTopicIfNecessary, dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { useRouter } from '../../common/services/RouterService'
import { useLocationState } from '../../social/services/LocationService'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { ClientSystems } from '../../world/ClientSystems'
import { loadSceneJsonOffline } from '../../world/utils'

const logger = multiLogger.child({ component: 'client-core:world' })

export const initClient = async () => {
  if (getMutableState(EngineState).isEngineInitialized.value) return

  const projects = Engine.instance.api.service('projects').find()

  ClientSystems()
  await loadEngineInjection(await projects)

  dispatchAction(EngineActions.initializeEngine({ initialised: true }))
}

export const useLoadEngine = () => {
  useEffect(() => {
    initClient()
  }, [])
}

export const useLocationSpawnAvatar = (spectate = false) => {
  const engineState = useEngineState()
  const authState = useAuthState()

  const spectateParam = useParams<{ spectate: UserId }>().spectate

  useEffect(() => {
    if (spectate) {
      if (!engineState.sceneLoaded.value || !authState.user.value || !authState.user.avatar.value) return
      dispatchAction(EngineActions.spectateUser({}))
      dispatchAction(EngineActions.joinedWorld({}))
      return
    }

    if (
      Engine.instance.localClientEntity ||
      !engineState.sceneLoaded.value ||
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

    if (avatarDetails.modelResource?.LOD0_url || (avatarDetails.modelResource as any).src)
      spawnLocalAvatarInWorld({
        avatarSpawnPose,
        avatarDetail: {
          avatarURL: avatarDetails.modelResource?.LOD0_url || (avatarDetails.modelResource as any)?.src,
          thumbnailURL: avatarDetails.thumbnailResource?.LOD0_url || (avatarDetails.thumbnailResource as any)?.src
        },
        name: user.name.value
      })
    else {
      NotificationService.dispatchNotify(
        'Your avatar is missing its model. Please change your avatar from the user menu.',
        { variant: 'error' }
      )
    }
  }, [engineState.sceneLoaded, authState.user, authState.user?.avatar, spectateParam])
}

export const usePortalTeleport = () => {
  const route = useRouter()
  const engineState = useEngineState()
  const locationState = useLocationState()
  const authState = useAuthState()

  useEffect(() => {
    if (engineState.isTeleporting.value) {
      logger.info('Resetting connection for portal teleport.')
      const activePortal = Engine.instance.activePortal

      if (!activePortal) return

      const currentLocation = locationState.locationName.value.split('/')[1]
      if (
        currentLocation === activePortal.location ||
        UUIDComponent.entitiesByUUID[activePortal.linkedPortalId]?.value
      ) {
        teleportAvatar(
          Engine.instance.localClientEntity!,
          activePortal.remoteSpawnPosition
          // activePortal.remoteSpawnRotation
        )
        Engine.instance.activePortal = null
        dispatchAction(EngineActions.setTeleporting({ isTeleporting: false, $time: Date.now() + 500 }))
        return
      }

      if (activePortal.redirect) {
        window.location.href = engineState.publicPath.value + '/location/' + activePortal.location
        return
      }

      route('/location/' + Engine.instance.activePortal!.location)
      LocationService.getLocationByName(Engine.instance.activePortal!.location)

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

export const useOfflineScene = (props: { projectName: string; sceneName: string; spectate?: boolean }) => {
  const engineState = useHookstate(getMutableState(EngineState))
  const authState = useHookstate(getMutableState(AuthState))

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: `${props.projectName}/${props.sceneName}` }))
    loadSceneJsonOffline(props.projectName, props.sceneName)
  }, [])

  /** OFFLINE */
  useEffect(() => {
    if (props.spectate) return
    if (engineState.sceneLoaded.value) {
      const userId = Engine.instance.userId
      const userIndex = 1
      const peerID = 'peerID' as PeerID
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

      receiveJoinWorld({
        highResTimeOrigin: performance.timeOrigin,
        worldStartTime: performance.now(),
        cachedActions: [],
        peerIndex,
        peerID,
        routerRtpCapabilities: undefined
      })
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])
}
