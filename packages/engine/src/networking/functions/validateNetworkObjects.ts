import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { NetworkWorldAction } from './NetworkWorldAction'

export async function validateNetworkObjects(world: World): Promise<void> {
  for (const [userId, client] of world.clients) {
    if (userId === Engine.instance.userId) continue
    // Validate that user has phoned home recently
    if (Date.now() - client.lastSeenTs > 30000) {
      console.log('Removing client ', userId, ' due to inactivity')

      dispatchAction(world.store, NetworkWorldAction.destroyClient({ $from: userId }))

      console.log('Disconnected Client:', client.userId)
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

      console.log('Removed transports for', userId)
    }
  }
}
