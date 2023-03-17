import { getMutableState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineQuery, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Network } from '../classes/Network'
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
  const ents = getMutableState(EngineState).isEditor.value
    ? networkTransformsQuery()
    : authoritativeNetworkTransformsQuery()
  if (ents.length > 0) {
    const userID = Engine.instance.userId
    const network = Engine.instance.worldNetwork as Network
    const peerID = network.peerID
    const data = serialize(network, userID, peerID, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      // delay until end of frame
      Promise.resolve().then(() => network.transport.bufferToPeer(network.hostPeerID, data))
    }
  }
}

export default async function OutgoingNetworkSystem() {
  const serialize = createDataWriter()

  const execute = () => {
    Engine.instance.worldNetwork && serializeAndSend(serialize)
  }

  const cleanup = async () => {
    removeQuery(networkTransformsQuery)
    removeQuery(authoritativeNetworkTransformsQuery)
  }

  return { execute, cleanup }
}
