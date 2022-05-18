import { getEngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Network } from '../classes/Network'
import { NetworkTransport } from '../classes/Network'
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

const serializeAndSend = (world: World, serialize: Function) => {
  const ents = authoritativeNetworkTransformsQuery(world)
  if (ents.length > 0) {
    const data = serialize(world, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      const worldTransport = Network.instance.getTransport('world')
      worldTransport.sendData(data)
    }
  }
}

const sendDataOnTransport = (transport: NetworkTransport, data) => {
  try {
    transport.sendData(data)
  } catch (e) {
    console.error(e)
  }
}

export default async function OutgoingNetworkSystem(world: World) {
  const serialize = createDataWriter()

  return () => {
    if (!getEngineState().isEngineInitialized.value) return

    serializeAndSend(world, serialize)
  }
}
