import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/services/AppService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { UserService } from '@xrengine/client-core/src/user/services/UserService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import querystring from 'querystring'
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { retriveLocationByName } from './LocationLoadHelper'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useInstanceConnectionState } from '@xrengine/client-core/src/common/services/InstanceConnectionService'
import { InstanceConnectionService } from '@xrengine/client-core/src/common/services/InstanceConnectionService'
import { ChannelConnectionService } from '@xrengine/client-core/src/common/services/ChannelConnectionService'
import { EngineAction, useEngineState } from '@xrengine/client-core/src/world/services/EngineService'
import { SocketWebRTCClientTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'

interface Props {
  locationName: string
}

export const NetworkInstanceProvisioning = (props: Props) => {
  const authState = useAuthState()
  const selfUser = authState.user
  const userState = useUserState()
  const dispatch = useDispatch()
  const chatState = useChatState()
  const locationState = useLocationState()
  const instanceConnectionState = useInstanceConnectionState()
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const engineState = useEngineState()

  // 1. Ensure api server connection in and set up reset listener
  useEffect(() => {
    AuthService.doLoginAuto(true)
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.RESET_ENGINE, async (ev: any) => {
      if (!ev.instance) return

      await shutdownEngine()
      InstanceConnectionService.resetInstanceServer()

      if (!isUserBanned) {
        retriveLocationByName(authState, props.locationName, history)
      }
    })
  }, [])

  // 2. once we have the location, provision the instance server
  useEffect(() => {
    const currentLocation = locationState.currentLocation.location

    if (currentLocation.id?.value) {
      if (
        !isUserBanned &&
        !instanceConnectionState.instanceProvisioned.value &&
        !instanceConnectionState.instanceProvisioning.value
      ) {
        const search = window.location.search
        let instanceId

        if (search != null) {
          const parsed = new URL(window.location.href).searchParams.get('instanceId')
          instanceId = parsed
        }

        InstanceConnectionService.provisionInstanceServer(
          currentLocation.id.value,
          instanceId || undefined,
          locationState.currentLocation.location.sceneId.value
        )
      }
    } else {
      if (!locationState.currentLocationUpdateNeeded.value && !locationState.fetchingCurrentLocation.value) {
        dispatch(AppAction.setAppSpecificOnBoardingStep(GeneralStateList.FAILED, false))
      }
    }
  }, [locationState.currentLocation.location.value])

  // 3. once engine is initialised and the server is provisioned, connect the the instance server
  useEffect(() => {
    if (engineState.isInitialised.value && instanceConnectionState.instanceProvisioned.value)
      InstanceConnectionService.connectToInstanceServer('instance')
    console.log('connect to instance server')
  }, [engineState.isInitialised.value, instanceConnectionState.instanceProvisioned.value])

  useEffect(() => {
    console.log(
      'instanceConnectionState.connected.value && engineState.sceneLoaded.value',
      engineState.connectedWorld.value,
      engineState.sceneLoaded.value
    )
    if (engineState.connectedWorld.value && engineState.sceneLoaded.value) {
      // TEMPORARY - just so portals work for now - will be removed in favor of gameserver-gameserver communication
      let spawnTransform
      if (engineState.isTeleporting.value) {
        spawnTransform = {
          position: engineState.isTeleporting.value.remoteSpawnPosition,
          rotation: engineState.isTeleporting.value.remoteSpawnRotation
        }
      }
      ;(Network.instance.transport as SocketWebRTCClientTransport)
        .instanceRequest(MessageTypes.JoinWorld.toString(), { spawnTransform })
        .then(() => {
          dispatch(EngineAction.setJoinedWorld(true))
        })
    }
  }, [engineState.connectedWorld.value, engineState.sceneLoaded.value])

  useEffect(() => {
    if (engineState.joinedWorld.value) {
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
      dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SUCCESS))
      dispatch(AppAction.setAppLoaded(true))
    }
  }, [engineState.joinedWorld.value])

  // channel server provisioning (if needed)
  useEffect(() => {
    if (chatState.instanceChannelFetched.value) {
      const channels = chatState.channels.channels.value
      const instanceChannel = Object.values(channels).find((channel) => channel.channelType === 'instance')
      ChannelConnectionService.provisionChannelServer(instanceChannel?.id)
    }
  }, [chatState.instanceChannelFetched.value])

  // periodically listening for users spatially near
  useEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value) UserService.getLayerUsers(true)
  }, [selfUser, userState.layerUsersUpdateNeeded.value])

  // ? maybe unneeded
  useEffect(() => {
    if (
      instanceConnectionState.instanceProvisioned.value &&
      instanceConnectionState.updateNeeded.value &&
      !instanceConnectionState.instanceServerConnecting.value &&
      !instanceConnectionState.connected.value
    ) {
      // TODO: fix up reinitialisation - we need to handle this more gently
      // reinit()
    }
  }, [instanceConnectionState])

  return <></>
}

export default NetworkInstanceProvisioning
