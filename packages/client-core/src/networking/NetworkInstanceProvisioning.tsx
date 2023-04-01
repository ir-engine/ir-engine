import React, { useEffect } from 'react'

import {
  LocationInstanceConnectionService,
  LocationInstanceState,
  useWorldInstance
} from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import {
  MediaInstanceConnectionService,
  useMediaInstance
} from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { MediaStreamService } from '@etherealengine/client-core/src/media/services/MediaStreamService'
import { ChatAction, ChatService, ChatState } from '@etherealengine/client-core/src/social/services/ChatService'
import { LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { NetworkUserService, NetworkUserState } from '@etherealengine/client-core/src/user/services/NetworkUserService'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { dispatchAction, getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { Groups } from '@mui/icons-material'

import { FriendService } from '../social/services/FriendService'
import { PartyService, PartyState } from '../social/services/PartyService'
import FriendsMenu from '../user/components/UserMenu/menus/FriendsMenu'
import PartyMenu from '../user/components/UserMenu/menus/PartyMenu'
import { PopupMenuState } from '../user/components/UserMenu/PopupMenuService'
import { AuthState } from '../user/services/AuthService'

export const WorldInstanceProvisioning = () => {
  const locationState = useHookstate(getMutableState(LocationState))
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const engineState = useHookstate(getMutableState(EngineState))

  const worldNetwork = Engine.instance.worldNetwork
  const currentLocationInstanceConnection = useWorldInstance()
  const networkConfigState = useHookstate(getMutableState(NetworkState).config)

  const locationInstance = useHookstate(getMutableState(LocationInstanceState))
  const instance = useWorldInstance()

  // Once we have the location, provision the instance server
  useEffect(() => {
    const currentLocation = locationState.currentLocation.location
    const isProvisioned = worldNetwork?.hostId && currentLocationInstanceConnection?.provisioned.value

    if (currentLocation.id?.value) {
      if (!isUserBanned && !isProvisioned) {
        const search = window.location.search
        let instanceId
        let roomCode

        if (search != null) {
          if (networkConfigState.instanceID.value)
            instanceId = new URL(window.location.href).searchParams.get('instanceId')
          if (networkConfigState.roomID.value) roomCode = new URL(window.location.href).searchParams.get('roomCode')
        }

        if (!networkConfigState.instanceID.value && networkConfigState.roomID.value) {
          LocationInstanceConnectionService.provisionExistingServerByRoomCode(
            currentLocation.id.value,
            roomCode,
            currentLocation.sceneId.value
          )
        } else {
          LocationInstanceConnectionService.provisionServer(
            currentLocation.id.value,
            instanceId || undefined,
            currentLocation.sceneId.value,
            roomCode || undefined
          )
        }
      }
    }
  }, [locationState.currentLocation.location])

  // Once scene is loaded and the server is provisioned, connect to the instance server
  useEffect(() => {
    if (
      engineState.sceneLoaded.value &&
      currentLocationInstanceConnection?.value &&
      currentLocationInstanceConnection.provisioned.value &&
      currentLocationInstanceConnection.readyToConnect.value &&
      !currentLocationInstanceConnection.connecting.value &&
      !currentLocationInstanceConnection.connected.value
    )
      LocationInstanceConnectionService.connectToServer(worldNetwork.hostId)
  }, [
    engineState.sceneLoaded,
    currentLocationInstanceConnection?.connected,
    currentLocationInstanceConnection?.readyToConnect,
    currentLocationInstanceConnection?.provisioned,
    currentLocationInstanceConnection?.connecting
  ])

  // Populate the URL with the room code and instance id
  useEffect(() => {
    if (!networkConfigState.roomID.value && !networkConfigState.instanceID.value) return

    if (instance?.connected?.value) {
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams

      if (networkConfigState.roomID.value) query.set('roomCode', instance.roomCode.value)

      if (networkConfigState.instanceID.value) query.set('instanceId', worldNetwork.hostId)

      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }
  }, [locationInstance.instances, instance, networkConfigState])

  return null
}

export const MediaInstanceProvisioning = () => {
  const authState = useHookstate(getMutableState(AuthState))
  const selfUser = authState.user
  const userState = useHookstate(getMutableState(NetworkUserState))
  const chatState = useHookstate(getMutableState(ChatState))

  const worldNetworkHostId = Engine.instance.worldNetwork?.hostId

  const mediaNetworkHostId = Engine.instance.mediaNetwork?.hostId
  const currentChannelInstanceConnection = useMediaInstance()

  MediaInstanceConnectionService.useAPIListeners()

  // Once we have the world server, provision the media server
  useEffect(() => {
    if (chatState.instanceChannelFetched.value) {
      const channels = chatState.channels.channels.value
      const instanceChannel = Object.values(channels).find((channel) => channel.instanceId === worldNetworkHostId)
      if (!currentChannelInstanceConnection?.provisioned.value)
        MediaInstanceConnectionService.provisionServer(instanceChannel?.id!, true)
    }
  }, [chatState.instanceChannelFetched])

  // Once the instance server is provisioned, connect to it
  useEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value)
      NetworkUserService.getLayerUsers(true)
  }, [selfUser?.instanceId, userState.layerUsersUpdateNeeded])

  useEffect(() => {
    if (selfUser?.channelInstanceId.value != null && userState.channelLayerUsersUpdateNeeded.value)
      NetworkUserService.getLayerUsers(false)
  }, [selfUser?.channelInstanceId, userState.channelLayerUsersUpdateNeeded])

  // Once the media server is provisioned, connect to it
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

  return null
}

export const SocialMenus = {
  Party: 'Party',
  Friends: 'Friends'
}

export const PartyInstanceProvisioning = () => {
  const authState = useHookstate(getMutableState(AuthState))
  const selfUser = authState.user
  const chatState = useHookstate(getMutableState(ChatState))
  const partyState = useHookstate(getMutableState(PartyState))

  const currentChannelInstanceConnection = useMediaInstance()

  useEffect(() => {
    const menuState = getMutableState(PopupMenuState)
    menuState.menus.merge({
      [SocialMenus.Party]: PartyMenu,
      [SocialMenus.Friends]: FriendsMenu
    })
    menuState.hotbar.merge({
      [SocialMenus.Friends]: Groups
    })

    return () => {
      menuState.menus[SocialMenus.Party].set(none)
      menuState.menus[SocialMenus.Friends].set(none)

      menuState.hotbar[SocialMenus.Friends].set(none)
    }
  }, [])

  FriendService.useAPIListeners()
  PartyService.useAPIListeners()

  // Once we have the world server, provision the party server
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

  return null
}

export const InstanceProvisioning = () => {
  const networkConfigState = useHookstate(getMutableState(NetworkState).config)

  return (
    <>
      {networkConfigState.world.value && <WorldInstanceProvisioning />}
      {networkConfigState.media.value && <MediaInstanceProvisioning />}
      {networkConfigState.party.value && <PartyInstanceProvisioning />}
    </>
  )
}
