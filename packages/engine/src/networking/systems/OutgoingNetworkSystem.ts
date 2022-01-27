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

export const networkTransformsQuery = defineQuery([NetworkObjectComponent, TransformComponent])
const ownedNetworkTransformsQuery = defineQuery([NetworkObjectOwnedTag, NetworkObjectComponent, TransformComponent])

const serializeAndSend = (world: World, serialize: Function, sendData: Function) => {
  const ents = isClient ? ownedNetworkTransformsQuery(world) : networkTransformsQuery(world)
  if (ents.length > 0) {
    const data = serialize(world, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      sendData(data)
    }
  }
}

const sendActionsOnTransport = (transport: NetworkTransport) => (world: World) => {
  const { outgoingActions } = world

  for (const o of outgoingActions) console.log('OUTGOING', o)

  try {
    transport.sendActions(outgoingActions)
  } catch (e) {
    console.error(e)
  }

  outgoingActions.clear()

  return world
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
  const sendActions = sendActionsOnTransport(worldTransport)
  const sendData = sendDataOnTransport(worldTransport)

  const serialize = createDataWriter()

  return () => {
    if (!Engine.isInitialized) return

    // side effect - network IO
    sendActions(world)

    serializeAndSend(world, serialize, sendData)
  }
}
