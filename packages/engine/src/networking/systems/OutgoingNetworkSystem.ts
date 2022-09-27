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
    const userId = Engine.instance.currentWorld.worldNetwork?.isHosting
      ? Engine.instance.currentWorld.worldNetwork.hostId
      : Engine.instance.userId
    const data = serialize(world, world.worldNetwork, userId, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      world.worldNetwork.sendData(data)
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
