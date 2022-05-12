import React from 'react'
import { useHistory } from 'react-router'

import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/services/AppService'
import {
  LocationInstanceConnectionService,
  useLocationInstanceConnectionState
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import {
  MediaInstanceConnectionService,
  useMediaInstanceConnectionState
} from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { UserService, useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { useHookEffect } from '@xrengine/hyperflux'

import { getSearchParamFromURL } from '../../util/getSearchParamFromURL'
import GameServerWarnings from './GameServerWarnings'

interface Props {
  locationName: string
}

export const NetworkInstanceProvisioning = () => {
  const authState = useAuthState()
  const selfUser = authState.user
  const userState = useUserState()
  const dispatch = useDispatch()
  const chatState = useChatState()
  const locationState = useLocationState()
  const instanceConnectionState = useLocationInstanceConnectionState()
  const channelConnectionState = useMediaInstanceConnectionState()
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const engineState = useEngineState()
  const history = useHistory()

  useHookEffect(() => {
    const instanceIdValue = instanceConnectionState.instance.id.value
    if (instanceIdValue) {
      const url = new URL(window.location.href)
      const searchParams = url.searchParams
      const instanceId = searchParams.get('instanceId')
      if (instanceId !== instanceIdValue) searchParams.set('instanceId', instanceIdValue)
      history.push(url.pathname + url.search)
    }
  }, [instanceConnectionState.instance.id])

  // 2. once we have the location, provision the instance server
  useHookEffect(() => {
    const currentLocation = locationState.currentLocation.location

    if (currentLocation.id?.value) {
      if (!isUserBanned && !instanceConnectionState.provisioned.value && !instanceConnectionState.provisioning.value) {
        const search = window.location.search
        let instanceId

        if (search != null) {
          const parsed = new URL(window.location.href).searchParams.get('instanceId')
          instanceId = parsed
        }

        LocationInstanceConnectionService.provisionServer(
          currentLocation.id.value,
          instanceId || undefined,
          currentLocation.sceneId.value
        )
      }
    } else {
      if (!locationState.currentLocationUpdateNeeded.value && !locationState.fetchingCurrentLocation.value) {
        dispatch(AppAction.setAppSpecificOnBoardingStep(GeneralStateList.FAILED, false))
      }
    }
  }, [locationState.currentLocation.location])

  // 3. once engine is initialised and the server is provisioned, connect the the instance server
  useHookEffect(() => {
    if (
      engineState.isEngineInitialized.value &&
      !instanceConnectionState.connected.value &&
      instanceConnectionState.provisioned.value &&
      !instanceConnectionState.connecting.value
    )
      LocationInstanceConnectionService.connectToServer()
  }, [
    engineState.isEngineInitialized,
    instanceConnectionState.connected,
    instanceConnectionState.connecting,
    instanceConnectionState.provisioned
  ])

  useHookEffect(() => {
    const transportRequestData = {
      inviteCode: getSearchParamFromURL('inviteCode')!
    }
    console.log(
      'engineState.connectedWorld.value && engineState.sceneLoaded.value',
      engineState.connectedWorld.value,
      engineState.sceneLoaded.value
    )
    if (engineState.connectedWorld.value && engineState.sceneLoaded.value) {
      Network.instance.transportHandler
        .getWorldTransport()
        .request(MessageTypes.JoinWorld.toString(), transportRequestData)
        .then(receiveJoinWorld)
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])

  // channel server provisioning (if needed)
  useHookEffect(() => {
    if (chatState.instanceChannelFetched.value) {
      const channels = chatState.channels.channels.value
      const instanceChannel = Object.values(channels).find(
        (channel) => channel.instanceId === instanceConnectionState.instance.id.value
      )
      MediaInstanceConnectionService.provisionServer(instanceChannel?.id, true)
    }
  }, [chatState.instanceChannelFetched])

  // periodically listening for users spatially near
  useHookEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value) UserService.getLayerUsers(true)
  }, [selfUser?.instanceId, userState.layerUsersUpdateNeeded])

  // if a media connection has been provisioned and is ready, connect to it
  useHookEffect(() => {
    if (
      channelConnectionState.provisioned.value === true &&
      channelConnectionState.updateNeeded.value === true &&
      channelConnectionState.connecting.value === false &&
      channelConnectionState.connected.value === false
    ) {
      MediaInstanceConnectionService.connectToServer(channelConnectionState.channelId.value)
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
    }
  }, [
    channelConnectionState.connected,
    channelConnectionState.updateNeeded,
    channelConnectionState.provisioned,
    channelConnectionState.connecting
  ])

  return <GameServerWarnings />
}

export default NetworkInstanceProvisioning
