import { World } from '../../ecs/classes/World'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { dispatchFrom } from './dispatchFrom'
import { NetworkWorldAction } from './NetworkWorldAction'

export async function validateNetworkObjects(world: World): Promise<void> {
  for (const [userId, client] of world.clients) {
    // Validate that user has phoned home recently
    if (Date.now() - client.lastSeenTs > 30000) {
      console.log('Removing client ', userId, ' due to inactivity')

      dispatchFrom(world.hostId, () => NetworkWorldAction.destroyClient({ $from: userId }))

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

      // Find all network objects that the disconnecting client owns and remove them
      for (const eid of world.getOwnedNetworkObjects(userId)) {
        const { networkId } = getComponent(eid, NetworkObjectComponent)
        dispatchFrom(world.hostId, () => NetworkWorldAction.destroyObject({ networkId }))
      }
      if (world.clients.has(userId)) world.clients.delete(userId)
      console.log('Finished removing inactive client', userId)
    }
  }
  /*
  Object.keys(Network.instance.networkObjects).forEach((key: string) => {
    const networkObject = Network.instance.networkObjects[key]
    // Validate that the object has an associated user and doesn't belong to a non-existant user
    if (
      !hasComponent(networkObject.entity, AvatarComponent) ||
      (networkObject.uniqueId !== undefined && world.clients.get(networkObject.uniqueId) !== undefined)
    )
      return

    console.log('Culling ownerless object: ', key, 'owned by ', networkObject.uniqueId)

    // If it does, tell clients to destroy it
    dispatchFromServer(NetworkWorldAction.destroyObject(Number(key)))

    // get network object
    const entity = networkObject.entity

    // Remove the entity and all of it's components
    removeEntity(entity)

    // Remove network object from list
    delete Network.instance.networkObjects[key]
    logger.info(key, ' removed from simulation')
  })*/
}
