import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Engine } from '../../src/ecs/classes/Engine'
import { Network, NetworkTopics } from '../../src/networking/classes/Network'

export const createMockNetwork = (networkType = NetworkTopics.world) => {
  if (networkType === NetworkTopics.world) Engine.instance.currentWorld._worldHostId = networkType as any as UserId
  else Engine.instance.currentWorld._mediaHostId = networkType as any as UserId
  Engine.instance.currentWorld.networks.set(networkType, new Network(networkType as any as UserId, networkType))
}
