import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { createDataWriter } from '../serialization/DataWriter'

/***********
 * QUERIES *
 **********/

export const networkTransformsQuery = defineQuery([NetworkObjectComponent, TransformComponent])
const authoritativeNetworkTransformsQuery = defineQuery([
  NetworkObjectAuthorityTag,
  NetworkObjectComponent,
  TransformComponent
])

const serializeAndSend = (world: World, serialize: ReturnType<typeof createDataWriter>) => {
  const ents = Engine.instance.isEditor ? networkTransformsQuery(world) : authoritativeNetworkTransformsQuery(world)
  if (ents.length > 0) {
    const userID = Engine.instance.userId
    const peerID = Engine.instance.currentWorld.worldNetwork.peerID
    const data = serialize(world, world.worldNetwork, userID, peerID, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      // delay until end of frame
      Promise.resolve().then(() => world.worldNetwork.sendData(data))
    }
  }
}

export default async function OutgoingNetworkSystem(world: World) {
  const serialize = createDataWriter()

  const execute = () => {
    world.worldNetwork && serializeAndSend(world, serialize)
  }

  const cleanup = async () => {
    removeQuery(world, networkTransformsQuery)
    removeQuery(world, authoritativeNetworkTransformsQuery)
  }

  return { execute, cleanup }
}
