import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { dispatchAction } from '@etherealengine/hyperflux'

import { accessMediaInstanceConnectionState } from '../common/services/MediaInstanceConnectionService'
import { accessMediaStreamState, MediaStreamService } from '../media/services/MediaStreamService'
import { NetworkUserService } from '../user/services/NetworkUserService'
import { MediaStreamActions } from './MediaStreams'

export const updateNearbyAvatars = () => {
  const network = Engine.instance.mediaNetwork

  MediaStreamService.updateNearbyLayerUsers()

  const mediaState = accessMediaStreamState()

  NetworkUserService.getLayerUsers(true)
  const channelConnectionState = accessMediaInstanceConnectionState()
  const currentChannelInstanceConnection = network && channelConnectionState.instances[network.hostId]?.ornull
  if (!currentChannelInstanceConnection?.value) return

  network?.request(MessageTypes.WebRTCRequestCurrentProducers.toString(), {
    userIds: mediaState.nearbyLayerUsers.value || [],
    channelType: currentChannelInstanceConnection.channelType.value,
    channelId: currentChannelInstanceConnection.channelId.value
  })

  if (!mediaState.nearbyLayerUsers.length) return

  const nearbyUserIds = mediaState.nearbyLayerUsers.value

  network?.consumers.forEach((consumer) => {
    if (!nearbyUserIds.includes(network.peers.get(consumer.appData.peerID)?.userId!)) {
      dispatchAction(MediaStreamActions.closeConsumer({ consumer }))
    }
  })
}

export default async function UpdateNearbyUsersSystem() {
  // every 5 seconds
  const NEARBY_AVATAR_UPDATE_PERIOD = Engine.instance.tickRate * 5

  const execute = () => {
    if (Engine.instance.fixedTick % NEARBY_AVATAR_UPDATE_PERIOD === 0) {
      updateNearbyAvatars()
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
