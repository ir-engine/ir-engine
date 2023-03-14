import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { updatePeers } from '@etherealengine/engine/src/networking/systems/OutgoingActionSystem'

import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'

export async function validateNetworkObjects(network: SocketWebRTCServerNetwork): Promise<void> {
  for (const [peerID, client] of network.peers) {
    if (client.userId === Engine.instance.userId) continue
    if (Date.now() - client.lastSeenTs > 30000) {
      NetworkPeerFunctions.destroyPeer(network, peerID)
      updatePeers(network)
    }
  }
}

export default async function ServerHostNetworkSystem() {
  const VALIDATE_NETWORK_INTERVAL = Engine.instance.tickRate * 5

  const execute = () => {
    const network = Engine.instance.worldNetwork as SocketWebRTCServerNetwork
    if (!network) return
    if (Engine.instance.worldNetwork.isHosting && Engine.instance.fixedTick % VALIDATE_NETWORK_INTERVAL === 0) {
      validateNetworkObjects(network)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
