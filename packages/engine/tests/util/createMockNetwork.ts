import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Engine } from '../../src/ecs/classes/Engine'
import { Network, NetworkType, NetworkTypes } from '../../src/networking/classes/Network'

export class MockNetwork extends Network {
  constructor(hostId: string, type: NetworkType) {
    super(hostId)
    this.type = type
  }
  type: NetworkType
}

export const createMockNetwork = (networkType = NetworkTypes.world) => {
  if (networkType === NetworkTypes.world) Engine.instance.currentWorld._worldHostId = networkType as UserId
  else Engine.instance.currentWorld._mediaHostId = networkType as UserId
  Engine.instance.currentWorld.networks.set(networkType, new MockNetwork(networkType, networkType))
}
