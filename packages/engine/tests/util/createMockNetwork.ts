import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getMutableState } from '@etherealengine/hyperflux'

import { createNetwork, NetworkTopics } from '../../src/networking/classes/Network'
import { addNetwork, NetworkState } from '../../src/networking/NetworkState'

export const createMockNetwork = (networkType = NetworkTopics.world) => {
  if (networkType === NetworkTopics.world) getMutableState(NetworkState).hostIds.world.set(networkType as any as UserId)
  else getMutableState(NetworkState).hostIds.media.set(networkType as any as UserId)
  addNetwork(createNetwork(networkType as any as UserId, networkType))
}
