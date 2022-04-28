import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { accessEngineState } from '../../ecs/classes/EngineService'
import { World } from '../../ecs/classes/World'
import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Network } from '../classes/Network'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkTransport } from '../interfaces/NetworkTransport'
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

const serializeAndSend = (world: World, serialize: Function, sendData: Function) => {
  const ents = authoritativeNetworkTransformsQuery(world)
  if (ents.length > 0) {
    const data = serialize(world, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      sendData(data)
    }
  }
}

const sendDataOnTransport = (transport: NetworkTransport) => (data) => {
  try {
    transport.sendData(data)
  } catch (e) {
    console.error(e)
  }
}

export default async function OutgoingNetworkSystem(world: World) {
  const worldTransport = Network.instance.transportHandler.getWorldTransport()
  const sendData = sendDataOnTransport(worldTransport)

  const serialize = createDataWriter()

  return () => {
    if (!accessEngineState().isEngineInitialized.value) return

    serializeAndSend(world, serialize, sendData)
  }
}
