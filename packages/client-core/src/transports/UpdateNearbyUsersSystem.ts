import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { getNearbyUsers } from '@etherealengine/engine/src/networking/functions/getNearbyUsers'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

import { MediaInstanceState } from '../common/services/MediaInstanceConnectionService'
import { NetworkUserService, NetworkUserState } from '../user/services/NetworkUserService'
import { closeConsumer, promisedRequest, SocketWebRTCClientNetwork } from './SocketWebRTCClientFunctions'

export const NearbyUsersState = defineState({
  name: 'NearbyUsersState',
  initial: () => ({
    nearbyLayerUsers: [] as UserId[]
  })
})

export const MediaStreamService = {
  updateNearbyLayerUsers: () => {
    const mediaState = getMutableState(NearbyUsersState)
    const userState = getState(NetworkUserState)
    const nonPartyUserIds = userState.layerUsers.filter((user) => user.partyId == null).map((user) => user.id)
    const nearbyUsers = getNearbyUsers(Engine.instance.userId, nonPartyUserIds)
    mediaState.nearbyLayerUsers.set(nearbyUsers)
  }
}

export const updateNearbyAvatars = () => {
  const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork

  MediaStreamService.updateNearbyLayerUsers()

  if (!network) return

  NetworkUserService.getLayerUsers(true)
  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId]
  if (!currentChannelInstanceConnection) return

  const nearbyUsersState = getState(NearbyUsersState)
  const nearbyUserIds = nearbyUsersState.nearbyLayerUsers

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

export const UpdateNearbyUsersSystem = defineSystem({
  uuid: 'ee.client.UpdateNearbyUsersSystem',
  execute
})
