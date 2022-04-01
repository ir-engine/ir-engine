import { Network } from '../../networking/classes/Network'
import { NetworkTransport } from '../../networking/interfaces/NetworkTransport'
import { World } from '../classes/World'

const sendOutgoingActions = (transport: NetworkTransport, world: World) => {
  const { outgoing } = world.store.actions

  for (const o of outgoing) console.log('OUTGOING', o)

  if (transport) {
    try {
      transport.sendActions(outgoing)
    } catch (e) {
      console.error(e)
    }
  }

  outgoing.length = 0

  return world
}

export default async function ActionDispatchSystem(world: World) {
  return () => {
    const worldTransport = Network.instance.transportHandler?.getWorldTransport()
    sendOutgoingActions(worldTransport, world)
  }
}
