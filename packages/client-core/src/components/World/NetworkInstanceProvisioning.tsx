import React, { useEffect } from 'react'

import {
  LocationInstanceConnectionService,
  useLocationInstanceConnectionState,
  useWorldInstance
} from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import {
  MediaInstanceConnectionService,
  useMediaInstance,
  useMediaInstanceConnectionState
} from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import {
  MediaServiceReceptor,
  MediaStreamService
} from '@etherealengine/client-core/src/media/services/MediaStreamService'
import { ChatAction, ChatService, useChatState } from '@etherealengine/client-core/src/social/services/ChatService'
import { useLocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import {
  NetworkUserService,
  NetworkUserServiceReceptor,
  useNetworkUserState
} from '@etherealengine/client-core/src/user/services/NetworkUserService'
import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { addActionReceptor, dispatchAction, removeActionReceptor } from '@etherealengine/hyperflux'

import { PeerMedia } from '../../media/PeerMedia'
import { PartyService, usePartyState } from '../../social/services/PartyService'
import { MediaStreamActions } from '../../transports/MediaStreams'
import { useRoomCodeURLParam } from '../../user/functions/useRoomCodeURLParam'
import InstanceServerWarnings from './InstanceServerWarnings'

export const NetworkInstanceProvisioning = () => {
  const authState = useAuthState()
  const selfUser = authState.user
  const userState = useNetworkUserState()
  const chatState = useChatState()
  const locationState = useLocationState()
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const engineState = useEngineState()
  const partyState = usePartyState()

  const worldNetworkHostId = Engine.instance.worldNetwork?.hostId
  const currentLocationInstanceConnection = useWorldInstance()

  const mediaNetworkHostId = Engine.instance.mediaNetwork?.hostId
  const currentChannelInstanceConnection = useMediaInstance()

  MediaInstanceConnectionService.useAPIListeners()
  PartyService.useAPIListeners()

  useEffect(() => {
    addActionReceptor(MediaServiceReceptor)
    addActionReceptor((action) => {
      matches(action).when(MediaStreamActions.triggerUpdateConsumers.matches, MediaStreamService.triggerUpdateConsumers)
    })
    addActionReceptor(NetworkUserServiceReceptor)
    return () => {
      removeActionReceptor(MediaServiceReceptor)
      removeActionReceptor(NetworkUserServiceReceptor)
    }
  }, [])

  useRoomCodeURLParam(false, true)

  // 2. once we have the location, provision the instance server
  useEffect(() => {
    const currentLocation = locationState.currentLocation.location
    const isProvisioned = worldNetworkHostId && currentLocationInstanceConnection?.provisioned.value

    if (currentLocation.id?.value) {
      if (!isUserBanned && !isProvisioned) {
        const search = window.location.search
        let instanceId
        let roomCode

        if (search != null) {
          instanceId = new URL(window.location.href).searchParams.get('instanceId')
          roomCode = new URL(window.location.href).searchParams.get('roomCode')
        }

        LocationInstanceConnectionService.provisionServer(
          currentLocation.id.value,
          instanceId || undefined,
          currentLocation.sceneId.value,
          roomCode || undefined
        )
      }
    }
  }, [locationState.currentLocation.location])

  // 3. once engine is initialised and the server is provisioned, connect to the instance server
  useEffect(() => {
    if (
      engineState.sceneLoaded.value &&
      currentLocationInstanceConnection?.value &&
      currentLocationInstanceConnection.provisioned.value === true &&
      currentLocationInstanceConnection.readyToConnect.value === true &&
      currentLocationInstanceConnection.connecting.value === false &&
      currentLocationInstanceConnection.connected.value === false
    )
      LocationInstanceConnectionService.connectToServer(worldNetworkHostId)
  }, [
    engineState.sceneLoaded,
    currentLocationInstanceConnection?.connected,
    currentLocationInstanceConnection?.readyToConnect,
    currentLocationInstanceConnection?.provisioned,
    currentLocationInstanceConnection?.connecting
  ])

  // media server provisioning
  useEffect(() => {
    if (chatState.instanceChannelFetched.value) {
      const channels = chatState.channels.channels.value
      const instanceChannel = Object.values(channels).find((channel) => channel.instanceId === worldNetworkHostId)
      if (!currentChannelInstanceConnection?.provisioned.value)
        MediaInstanceConnectionService.provisionServer(instanceChannel?.id!, true)
    }
  }, [chatState.instanceChannelFetched])

  useEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value)
      NetworkUserService.getLayerUsers(true)
  }, [selfUser?.instanceId, userState.layerUsersUpdateNeeded])

  useEffect(() => {
    if (selfUser?.channelInstanceId.value != null && userState.channelLayerUsersUpdateNeeded.value)
      NetworkUserService.getLayerUsers(false)
  }, [selfUser?.channelInstanceId, userState.channelLayerUsersUpdateNeeded])

  useEffect(() => {
    if (selfUser?.partyId?.value && chatState.channels.channels?.value) {
      const partyChannel = Object.values(chatState.channels.channels.value).find(
        (channel) => channel.channelType === 'party' && channel.partyId === selfUser.partyId.value
      )
      const partyUser = partyState.party?.partyUsers?.value
        ? partyState.party.partyUsers.value.find((partyUser) => partyUser.userId === selfUser.id.value)
        : null
      if (
        chatState.partyChannelFetched?.value &&
        partyChannel &&
        currentChannelInstanceConnection?.channelId.value !== partyChannel.id &&
        partyUser
      )
        MediaInstanceConnectionService.provisionServer(partyChannel?.id!, false)
      else if (!chatState.partyChannelFetched.value && !chatState.partyChannelFetching.value)
        ChatService.getPartyChannel()
    }
  }, [
    selfUser?.partyId?.value,
    partyState.party?.id,
    chatState.channels.channels.value as any,
    chatState.partyChannelFetching?.value,
    chatState.partyChannelFetched?.value
  ])

  useEffect(() => {
    if (selfUser.partyId.value) dispatchAction(ChatAction.refetchPartyChannelAction({}))
  }, [selfUser.partyId.value])

  useEffect(() => {
    if (partyState.updateNeeded.value) PartyService.getParty()
  }, [partyState.updateNeeded.value])

  // if a media connection has been provisioned and is ready, connect to it
  useEffect(() => {
    if (
      mediaNetworkHostId &&
      currentChannelInstanceConnection?.value &&
      currentChannelInstanceConnection.provisioned.value === true &&
      currentChannelInstanceConnection.readyToConnect.value === true &&
      currentChannelInstanceConnection.connecting.value === false &&
      currentChannelInstanceConnection.connected.value === false
    ) {
      MediaInstanceConnectionService.connectToServer(
        mediaNetworkHostId,
        currentChannelInstanceConnection.channelId.value
      )
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
      MediaStreamService.updateScreenAudioState()
      MediaStreamService.updateScreenVideoState()
    }
  }, [
    currentChannelInstanceConnection?.connected,
    currentChannelInstanceConnection?.readyToConnect,
    currentChannelInstanceConnection?.provisioned,
    currentChannelInstanceConnection?.connecting
  ])

  return (
    <>
      <PeerMedia />
      <InstanceServerWarnings />
    </>
  )
}

export default NetworkInstanceProvisioning
