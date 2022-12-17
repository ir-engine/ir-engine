import { NO_PROXY } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectComponent'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { MessageTypes } from '../enums/MessageTypes'
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
    const network = world.worldNetwork.get(NO_PROXY)
    const peerID = network.peerID
    const data = serialize(world, network, userID, peerID, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      // delay until end of frame
      Promise.resolve().then(() => network.sendData(network, data))
    }
  }
}

export default async function OutgoingNetworkSystem(world: World) {
  const serialize = createDataWriter()

  const HEATBEAT_RATE = Engine.instance.tickRate * 5

  const execute = () => {
    const network = world.worldNetwork?.value
    if (!network) return

    serializeAndSend(world, serialize)
    if (world.fixedTick % HEATBEAT_RATE === 0)
      for (const [socketID, socket] of network.sockets) socket.emit(MessageTypes.Heartbeat.toString())
  }

  const cleanup = async () => {
    removeQuery(world, networkTransformsQuery)
    removeQuery(world, authoritativeNetworkTransformsQuery)
  }

  return { execute, cleanup }
}
