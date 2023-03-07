import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getMutableState } from '@etherealengine/hyperflux'

import { Engine } from '../../src/ecs/classes/Engine'
import { Network, NetworkTopics } from '../../src/networking/classes/Network'
import { NetworkState } from '../../src/networking/NetworkState'

export const createMockNetwork = (networkType = NetworkTopics.world) => {
  if (networkType === NetworkTopics.world) getMutableState(NetworkState).hostIds.world.set(networkType as any as UserId)
  else getMutableState(NetworkState).hostIds.media.set(networkType as any as UserId)
  Engine.instance.networks.set(networkType, new Network(networkType as any as UserId, networkType))
}
