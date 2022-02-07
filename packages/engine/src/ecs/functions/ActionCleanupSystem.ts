import { Network } from '../../networking/classes/Network'
import { NetworkTransport } from '../../networking/interfaces/NetworkTransport'
import { World } from '../classes/World'

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

export default async function ActionDispatchSystem(world: World) {
  const worldTransport = Network.instance.transportHandler.getWorldTransport()
  const sendActions = sendActionsOnTransport(worldTransport)

  return () => {
    sendActions(world)
  }
}
