import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { World } from '../../ecs/classes/World'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkTransport } from '../interfaces/NetworkTransport'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { createDataWriter } from '../serialization/DataWriter'
import { NetworkObjectAuthorizedTag } from '../components/NetworkObjectAuthorizedTag'

/***********
 * QUERIES *
 **********/

export const networkTransformsQuery = defineQuery([NetworkObjectComponent, TransformComponent])
const ownedNetworkTransformsQuery = defineQuery([NetworkObjectOwnedTag, NetworkObjectComponent, TransformComponent])
const authorizedNetworkTransformsQuery = defineQuery([
  NetworkObjectAuthorizedTag,
  NetworkObjectComponent,
  TransformComponent
])

const serializeAndSend = (world: World, serialize: Function, sendData: Function) => {
  const ownedEnts = ownedNetworkTransformsQuery(world)
  const authorizedEnts = authorizedNetworkTransformsQuery(world)
  const ents = isClient ? ownedNetworkTransformsQuery(world) : [...new Set([...ownedEnts, ...authorizedEnts])] //networkTransformsQuery(world)
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
