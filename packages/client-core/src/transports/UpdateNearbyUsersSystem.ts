import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem, PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { MediaInstanceState } from '../common/services/MediaInstanceConnectionService'
import { MediaState, MediaStreamService } from '../media/services/MediaStreamService'
import { NetworkUserService } from '../user/services/NetworkUserService'
import { MediaStreamActions } from './MediaStreams'
import { promisedRequest, SocketWebRTCClientNetwork } from './SocketWebRTCClientFunctions'

export const updateNearbyAvatars = () => {
  const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork

  MediaStreamService.updateNearbyLayerUsers()

  if (!network) return

  const mediaState = getState(MediaState)

  NetworkUserService.getLayerUsers(true)
  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId]
  if (!currentChannelInstanceConnection) return

  const nearbyUserIds = mediaState.nearbyLayerUsers

  promisedRequest(network, MessageTypes.WebRTCRequestCurrentProducers.toString(), {
    userIds: nearbyUserIds || [],
    channelType: currentChannelInstanceConnection.channelType,
    channelId: currentChannelInstanceConnection.channelId
  })

  if (!nearbyUserIds.length) return

  network.consumers.forEach((consumer) => {
    if (!nearbyUserIds.includes(network.peers.get(consumer.appData.peerID)?.userId!)) {
      dispatchAction(MediaStreamActions.closeConsumer({ consumer }))
    }
  })
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

export const UpdateNearbyUsersSystem = defineSystem(
  {
    uuid: 'ee.client.UpdateNearbyUsersSystem',
    execute
  },
  { after: [PresentationSystemGroup] }
)
