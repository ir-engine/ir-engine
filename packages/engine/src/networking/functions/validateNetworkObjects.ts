import { Engine } from '../../ecs/classes/Engine'
import { Network } from '../classes/Network'
import { NetworkPeerFunctions } from './NetworkPeerFunctions'

export async function validateNetworkObjects(network: Network): Promise<void> {
  for (const [peerID, client] of network.peers) {
    if (client.userId === Engine.instance.userId) continue
    // Validate that user has phoned home recently
    if (Date.now() - client.lastSeenTs > 30000) {
      console.log('Removing client ', peerID, ' due to inactivity')

      NetworkPeerFunctions.destroyPeer(network, peerID)
      network.updatePeers()

      console.log('Disconnected Client:', peerID)
      if (client?.instanceRecvTransport) {
        console.log('Closing instanceRecvTransport')
        await client.instanceRecvTransport.close()
        console.log('Closed instanceRecvTransport')
      }
      if (client?.instanceSendTransport) {
        console.log('Closing instanceSendTransport')
        await client.instanceSendTransport.close()
        console.log('Closed instanceSendTransport')
      }
      if (client?.channelRecvTransport) {
        console.log('Closing channelRecvTransport')
        await client.channelRecvTransport.close()
        console.log('Closed channelRecvTransport')
      }
      if (client?.channelSendTransport) {
        console.log('Closing channelSendTransport')
        await client.channelSendTransport.close()
        console.log('Closed channelSendTransport')
      }

      console.log('Removed transports for', peerID)
    }
  }
}
