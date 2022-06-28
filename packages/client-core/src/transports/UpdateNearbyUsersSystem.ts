import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getNearbyUsers } from '@xrengine/engine/src/networking/functions/getNearbyUsers'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { addActionReceptor, dispatchAction } from '@xrengine/hyperflux'

import { MediaStreamService } from '../media/services/MediaStreamService'
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

// every 5 seconds
const NEARBY_AVATAR_UPDATE_PERIOD = 5

export default async function UpdateNearbyUsersSystem(world: World) {
  let nearbyAvatarTick = 0

  addActionReceptor((action) => {
    matches(action)
      .when(WorldNetworkAction.createClient.matches, () => {
        updateNearbyAvatars()
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
      .when(WorldNetworkAction.destroyClient.matches, () => {
        updateNearbyAvatars()
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
  })

  return () => {
    nearbyAvatarTick += world.deltaSeconds
    if (nearbyAvatarTick > NEARBY_AVATAR_UPDATE_PERIOD) {
      nearbyAvatarTick = 0
      updateNearbyAvatars()
    }
  }
}
