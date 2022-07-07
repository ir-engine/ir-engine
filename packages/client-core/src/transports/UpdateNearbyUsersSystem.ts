import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getNearbyUsers } from '@xrengine/engine/src/networking/functions/getNearbyUsers'
import { dispatchAction } from '@xrengine/hyperflux'

import { MediaStreams } from './MediaStreams'

export const updateNearbyAvatars = () => {
  MediaStreams.instance.nearbyLayerUsers = getNearbyUsers(Engine.instance.userId)
  dispatchAction(MediaStreams.actions.triggerRequestCurrentProducers())

  if (!MediaStreams.instance.nearbyLayerUsers.length) return

  const nearbyUserIds = MediaStreams.instance.nearbyLayerUsers.map((user) => user.id)
  const network = Engine.instance.currentWorld.mediaNetwork
  network.consumers.forEach((consumer) => {
    if (!nearbyUserIds.includes(consumer._appData.peerId)) {
      dispatchAction(MediaStreams.actions.closeConsumer({ consumer }))
    }
  })
}

export default async function UpdateNearbyUsersSystem(world: World) {
  // every 5 seconds
  const NEARBY_AVATAR_UPDATE_PERIOD = Engine.instance.tickRate * 5

  return () => {
    if (world.fixedTick % NEARBY_AVATAR_UPDATE_PERIOD === 0) {
      updateNearbyAvatars()
    }
  }
}
