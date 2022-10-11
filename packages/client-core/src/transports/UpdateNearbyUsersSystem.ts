import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { dispatchAction } from '@xrengine/hyperflux'

import { accessMediaInstanceConnectionState } from '../common/services/MediaInstanceConnectionService'
import { accessMediaStreamState, MediaStreamService } from '../media/services/MediaStreamService'
import { NetworkUserService } from '../user/services/NetworkUserService'
import { MediaStreams } from './MediaStreams'

export const updateNearbyAvatars = () => {
  const network = Engine.instance.currentWorld.mediaNetwork

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
    if (!nearbyUserIds.includes(consumer._appData.peerId)) {
      dispatchAction(MediaStreams.actions.closeConsumer({ consumer }))
    }
  })
}

export default async function UpdateNearbyUsersSystem(world: World) {
  // every 5 seconds
  const NEARBY_AVATAR_UPDATE_PERIOD = Engine.instance.tickRate * 5

  const execute = () => {
    if (world.fixedTick % NEARBY_AVATAR_UPDATE_PERIOD === 0) {
      updateNearbyAvatars()
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
