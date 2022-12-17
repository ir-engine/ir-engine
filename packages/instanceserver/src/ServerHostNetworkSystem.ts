import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { NetworkPeerFunctions } from '@xrengine/engine/src/networking/functions/NetworkPeerFunctions'

import { SocketWebRTCServerNetwork, updatePeers } from './SocketWebRTCServerFunctions'

export async function validateNetworkObjects(world: World, network: SocketWebRTCServerNetwork): Promise<void> {
  for (const [peerID, client] of network.peers) {
    if (client.userId === Engine.instance.userId) continue
    if (Date.now() - client.lastSeenTs > 30000) {
      NetworkPeerFunctions.destroyPeer(network, peerID, world)
      updatePeers(network)
    }
  }
}

export default async function ServerHostNetworkSystem(world: World) {
  const VALIDATE_NETWORK_INTERVAL = Engine.instance.tickRate * 5

  const execute = () => {
    const network = world.worldNetwork?.value as SocketWebRTCServerNetwork
    if (!network) return
    if (world.worldNetwork?.value?.isHosting && world.fixedTick % VALIDATE_NETWORK_INTERVAL === 0) {
      validateNetworkObjects(world, network)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
