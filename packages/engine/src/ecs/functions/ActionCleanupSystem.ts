import { Network } from '../../networking/classes/Network'
import { NetworkTransport } from '../../networking/interfaces/NetworkTransport'
import { World } from '../classes/World'

const sendOutgoingActions = (transport: NetworkTransport, world: World) => {
  const { outgoingActions } = world

  for (const o of outgoingActions) console.log('OUTGOING', o)

  if (transport) {
    try {
      transport.sendActions(outgoingActions)
    } catch (e) {
      console.error(e)
    }
  }

  outgoingActions.clear()

  return world
}

export default async function ActionDispatchSystem(world: World) {
  return () => {
    const worldTransport = Network.instance.transportHandler?.getWorldTransport()
    sendOutgoingActions(worldTransport, world)
  }
}
