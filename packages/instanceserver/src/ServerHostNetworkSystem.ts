import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
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

const execute = () => {
  const network = Engine.instance.worldNetwork as SocketWebRTCServerNetwork
  if (!network) return
  if (Engine.instance.worldNetwork.isHosting) validateNetworkObjects(network)
}

export const ServerHostNetworkSystem = defineSystem({
  uuid: 'ee.engine.ServerHostNetworkSystem',
  execute
})
