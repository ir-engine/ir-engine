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

import React, { useEffect } from 'react'

import {
  LocationInstanceConnectionService,
  LocationInstanceState,
  useWorldInstance,
  useWorldNetwork
} from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import {
  MediaInstanceConnectionService,
  MediaInstanceState
} from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { ChannelService, ChannelState } from '@etherealengine/client-core/src/social/services/ChannelService'
import { LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import Groups from '@mui/icons-material/Groups'

import { InstanceID } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { SceneID } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { LocationID, RoomCode } from '@etherealengine/engine/src/schemas/social/location.schema'
import { useTranslation } from 'react-i18next'
import { FriendService } from '../social/services/FriendService'
import { connectToNetwork } from '../transports/SocketWebRTCClientFunctions'
import { PopupMenuState } from '../user/components/UserMenu/PopupMenuService'
import FriendsMenu from '../user/components/UserMenu/menus/FriendsMenu'
import MessagesMenu from '../user/components/UserMenu/menus/MessagesMenu'

export const WorldInstanceProvisioning = () => {
  const locationState = useHookstate(getMutableState(LocationState))
  const isUserBanned = locationState.currentLocation.selfUserBanned.value

  const worldNetwork = NetworkState.worldNetwork
  const worldNetworkState = useWorldNetwork()
  const networkConfigState = useHookstate(getMutableState(NetworkState).config)

  ChannelService.useAPIListeners()

  const locationInstances = useHookstate(getMutableState(LocationInstanceState).instances)
  const instance = useWorldInstance()

  // Once we have the location, provision the instance server
  useEffect(() => {
    const currentLocation = locationState.currentLocation.location
    const hasJoined = !!worldNetwork

    if (
      currentLocation.id?.value &&
      !isUserBanned &&
      !hasJoined &&
      !Object.values(locationInstances).find((instance) => instance.locationId.value === currentLocation.id?.value)
    ) {
      const search = window.location.search
      let instanceId = '' as InstanceID
      let roomCode = '' as RoomCode

      if (search != null) {
        if (networkConfigState.instanceID.value)
          instanceId = new URL(window.location.href).searchParams.get('instanceId') as InstanceID
        if (networkConfigState.roomID.value)
          roomCode = new URL(window.location.href).searchParams.get('roomCode') as RoomCode
      }

      if (!networkConfigState.instanceID.value && networkConfigState.roomID.value) {
        LocationInstanceConnectionService.provisionExistingServerByRoomCode(
          currentLocation.id.value as LocationID,
          roomCode as RoomCode,
          currentLocation.sceneId.value as SceneID
        )
      } else {
        LocationInstanceConnectionService.provisionServer(
          currentLocation.id.value as LocationID,
          instanceId || undefined,
          currentLocation.sceneId.value as SceneID,
          roomCode || undefined
        )
      }
    }
  }, [locationState.currentLocation.location])

  // Populate the URL with the room code and instance id
  useEffect(() => {
    if (!networkConfigState.roomID.value && !networkConfigState.instanceID.value) return

    if (worldNetworkState?.connected?.value) {
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams

      if (networkConfigState.roomID.value) query.set('roomCode', instance!.roomCode.value)

      if (networkConfigState.instanceID.value) query.set('instanceId', worldNetwork.id)

      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }
  }, [worldNetworkState?.connected, locationInstances.keys.length, networkConfigState])

  return (
    <>
      {Object.keys(locationInstances.value).map((instanceId: InstanceID) => (
        <WorldInstance key={instanceId} id={instanceId} />
      ))}
    </>
  )
}

export const WorldInstance = ({ id }: { id: InstanceID }) => {
  const worldInstance = useHookstate(getMutableState(LocationInstanceState).instances[id])

  useEffect(() => {
    connectToNetwork(
      id,
      worldInstance.ipAddress.value,
      worldInstance.port.value,
      worldInstance.locationId.value,
      undefined,
      worldInstance.roomCode.value
    )
  }, [])

  return null
}

export const MediaInstanceProvisioning = () => {
  const channelState = useHookstate(getMutableState(ChannelState))

  const worldNetworkId = NetworkState.worldNetwork?.id
  const worldNetwork = useWorldNetwork()

  MediaInstanceConnectionService.useAPIListeners()
  const mediaInstance = useHookstate(getMutableState(MediaInstanceState).instances)

  // Once we have the world server, provision the media server
  useEffect(() => {
    if (mediaInstance.keys.length) return
    if (channelState.channels.channels?.value.length) {
      const currentChannel =
        channelState.targetChannelId.value === ''
          ? channelState.channels.channels.value.find((channel) => channel.instanceId === worldNetworkId)?.id
          : channelState.targetChannelId.value
      if (currentChannel) MediaInstanceConnectionService.provisionServer(currentChannel, true)
    }
  }, [
    channelState.channels.channels?.length,
    worldNetwork?.connected,
    mediaInstance.keys.length,
    channelState.targetChannelId
  ])

  return (
    <>
      {Object.keys(mediaInstance.value).map((instanceId: InstanceID) => (
        <MediaInstance key={instanceId} id={instanceId} />
      ))}
    </>
  )
}

export const MediaInstance = ({ id }: { id: InstanceID }) => {
  const mediaInstance = useHookstate(getMutableState(MediaInstanceState).instances[id])

  useEffect(() => {
    connectToNetwork(
      id,
      mediaInstance.ipAddress.value,
      mediaInstance.port.value,
      undefined,
      mediaInstance.channelId.value,
      mediaInstance.roomCode.value
    )
  }, [])

  return null
}

export const SocialMenus = {
  Friends: 'Friends',
  Messages: 'Messages'
}

export const FriendMenus = () => {
  const { t } = useTranslation()
  FriendService.useAPIListeners()

  useEffect(() => {
    const menuState = getMutableState(PopupMenuState)
    menuState.menus.merge({
      [SocialMenus.Friends]: FriendsMenu,
      [SocialMenus.Messages]: MessagesMenu
    })
    menuState.hotbar.merge({
      [SocialMenus.Friends]: { icon: <Groups />, tooltip: t('user:menu.friends') }
    })

    return () => {
      menuState.menus[SocialMenus.Friends].set(none)
      menuState.menus[SocialMenus.Messages].set(none)

      menuState.hotbar[SocialMenus.Friends].set(none)
    }
  }, [])

  return null
}

export const InstanceProvisioning = () => {
  const networkConfigState = useHookstate(getMutableState(NetworkState).config)

  return (
    <>
      {networkConfigState.world.value && <WorldInstanceProvisioning />}
      {networkConfigState.media.value && <MediaInstanceProvisioning />}
      {networkConfigState.friends.value && <FriendMenus />}
    </>
  )
}
