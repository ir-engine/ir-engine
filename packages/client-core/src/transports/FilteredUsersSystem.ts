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

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { getNearbyUsers } from '@etherealengine/engine/src/networking/functions/getNearbyUsers'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

import { MediaInstanceState } from '../common/services/MediaInstanceConnectionService'
import { AuthState } from '../user/services/AuthService'
import { closeConsumer, promisedRequest, SocketWebRTCClientNetwork } from './SocketWebRTCClientFunctions'

export const FilteredUsersState = defineState({
  name: 'FilteredUsersState',
  initial: () => ({
    nearbyLayerUsers: [] as UserId[]
  })
})

export const FilteredUsersService = {
  updateNearbyLayerUsers: () => {
    const mediaState = getMutableState(FilteredUsersState)
    const selfUserId = getMutableState(AuthState).user.id.value
    const peers = Engine.instance.worldNetworkState.peers
      ? Array.from(Engine.instance.worldNetworkState.peers?.get({ noproxy: true }).values())
      : []
    const nonPartyUserIds = peers
      ? peers.filter((peer) => peer.peerID !== 'server' && peer.userId !== selfUserId).map((peer) => peer.userId)
      : []
    const nearbyUsers = getNearbyUsers(Engine.instance.userId, nonPartyUserIds)
    mediaState.nearbyLayerUsers.set(nearbyUsers)
  }
}

export const updateNearbyAvatars = () => {
  const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork

  FilteredUsersService.updateNearbyLayerUsers()

  if (!network) return

  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId]
  if (!currentChannelInstanceConnection) return

  const filteredUsersState = getState(FilteredUsersState)
  const nearbyUserIds = filteredUsersState.nearbyLayerUsers

  promisedRequest(network, MessageTypes.WebRTCRequestCurrentProducers.toString(), {
    userIds: nearbyUserIds,
    channelType: currentChannelInstanceConnection.channelType,
    channelId: currentChannelInstanceConnection.channelId
  })

  if (!nearbyUserIds.length) return

  for (const consumer of network.consumers) {
    if (!nearbyUserIds.includes(network.peers.get(consumer.appData.peerID)?.userId!)) {
      closeConsumer(network, consumer)
    }
  }
}

// every 5 seconds
const NEARBY_AVATAR_UPDATE_PERIOD = 5
let accumulator = 0

const execute = () => {
  accumulator += Engine.instance.deltaSeconds
  if (accumulator > NEARBY_AVATAR_UPDATE_PERIOD) {
    accumulator = 0
    updateNearbyAvatars()
  }
}

export const FilteredUsersSystem = defineSystem({
  uuid: 'ee.client.FilteredUsersSystem',
  execute
})
