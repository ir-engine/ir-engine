import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectComponent'
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

const serializeAndSend = (serialize: ReturnType<typeof createDataWriter>) => {
  const world = Engine.instance.currentWorld
  const ents = Engine.instance.isEditor ? networkTransformsQuery() : authoritativeNetworkTransformsQuery()
  if (ents.length > 0) {
    const userID = Engine.instance.userId
    const peerID = Engine.instance.currentWorld.worldNetwork.peerID
    const data = serialize(world.worldNetwork, userID, peerID, ents)

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
    world.worldNetwork && serializeAndSend(serialize)
  }

  const cleanup = async () => {
    removeQuery(networkTransformsQuery)
    removeQuery(authoritativeNetworkTransformsQuery)
  }

  return { execute, cleanup }
}
