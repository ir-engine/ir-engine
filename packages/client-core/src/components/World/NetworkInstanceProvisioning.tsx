import React, { useEffect } from 'react'
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
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { addActionReceptor, useHookEffect } from '@xrengine/hyperflux'

import { getSearchParamFromURL } from '../../util/getSearchParamFromURL'
import GameServerWarnings from './GameServerWarnings'

export const NetworkInstanceProvisioning = () => {
  const authState = useAuthState()
  const selfUser = authState.user
  const userState = useUserState()
  const dispatch = useDispatch()
  const chatState = useChatState()
  const locationState = useLocationState()
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const engineState = useEngineState()
  const history = useHistory()

  const instanceConnectionState = useLocationInstanceConnectionState()
  const currentLocationInstanceConnection =
    instanceConnectionState.instances[Engine.instance.currentWorld.hostId!].ornull

  const channelConnectionState = useMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[MediaStreams.instance.hostId!].ornull

  useEffect(() => {
    addActionReceptor(Engine.instance.store, (action) => {
      matches(action).when(
        MediaStreams.actions.triggerUpdateConsumers.matches,
        MediaStreamService.triggerUpdateConsumers
      )
    })
  }, [])

  useHookEffect(() => {
    if (Engine.instance.currentWorld.hostId) {
      const url = new URL(window.location.href)
      const searchParams = url.searchParams
      const instanceId = searchParams.get('instanceId')
      if (instanceId !== Engine.instance.currentWorld.hostId)
        searchParams.set('instanceId', Engine.instance.currentWorld.hostId)
      history.push(url.pathname + url.search)
    }
  }, [currentLocationInstanceConnection])

  // 2. once we have the location, provision the instance server
  useHookEffect(() => {
    const currentLocation = locationState.currentLocation.location
    const isProvisioned = Engine.instance.currentWorld.hostId && currentLocationInstanceConnection?.provisioned.value

    if (currentLocation.id?.value) {
      if (!isUserBanned && !isProvisioned) {
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
      currentLocationInstanceConnection.value &&
      !currentLocationInstanceConnection.connected.value &&
      currentLocationInstanceConnection.provisioned.value &&
      !currentLocationInstanceConnection.connecting.value
    )
      LocationInstanceConnectionService.connectToServer(Engine.instance.currentWorld.hostId)
  }, [
    engineState.isEngineInitialized,
    currentLocationInstanceConnection?.connected,
    currentLocationInstanceConnection?.connecting,
    currentLocationInstanceConnection?.provisioned
  ])

  useHookEffect(() => {
    const transportRequestData = {
      inviteCode: getSearchParamFromURL('inviteCode')!
    }
    if (engineState.connectedWorld.value && engineState.sceneLoaded.value) {
      Network.instance
        .getTransport(Engine.instance.currentWorld.hostId)
        .request(MessageTypes.JoinWorld.toString(), transportRequestData)
        .then(receiveJoinWorld)
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])

  // channel server provisioning (if needed)
  useHookEffect(() => {
    if (chatState.instanceChannelFetched.value) {
      const channels = chatState.channels.channels.value
      const instanceChannel = Object.values(channels).find(
        (channel) => channel.instanceId === Engine.instance.currentWorld.hostId
      )
      MediaInstanceConnectionService.provisionServer(instanceChannel?.id!, true)
    }
  }, [chatState.instanceChannelFetched])

  // periodically listening for users spatially near
  useHookEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value) UserService.getLayerUsers(true)
  }, [selfUser?.instanceId, userState.layerUsersUpdateNeeded])

  // if a media connection has been provisioned and is ready, connect to it
  useHookEffect(() => {
    if (
      MediaStreams.instance.hostId &&
      currentChannelInstanceConnection.provisioned.value === true &&
      currentChannelInstanceConnection.updateNeeded.value === true &&
      currentChannelInstanceConnection.connecting.value === false &&
      currentChannelInstanceConnection.connected.value === false
    ) {
      MediaInstanceConnectionService.connectToServer(
        MediaStreams.instance.hostId!,
        currentChannelInstanceConnection.channelId.value
      )
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
    }
  }, [
    currentChannelInstanceConnection?.connected,
    currentChannelInstanceConnection?.updateNeeded,
    currentChannelInstanceConnection?.provisioned,
    currentChannelInstanceConnection?.connecting
  ])

  return <GameServerWarnings />
}

export default NetworkInstanceProvisioning
