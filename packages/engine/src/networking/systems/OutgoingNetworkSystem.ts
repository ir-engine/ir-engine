import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { World } from '../../ecs/classes/World'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkTransport } from '../interfaces/NetworkTransport'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
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
    if (!Engine.isInitialized) return

    serializeAndSend(world, serialize, sendData)
  }
}
