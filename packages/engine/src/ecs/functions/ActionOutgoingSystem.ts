import { Network } from '../../networking/classes/Network'
import { NetworkTransport } from '../../networking/interfaces/NetworkTransport'
import { Engine } from '../classes/Engine'
import { World } from '../classes/World'

const sendOutgoingActions = (world: World) => {
  const transport = Network.instance.transportHandler?.getWorldTransport()
  if (!transport) return

  const { outgoing } = world.store.actions

  for (const o of outgoing) console.log('OUTGOING', o)

  try {
    transport.sendActions(outgoing)
  } catch (e) {
    console.error(e)
  }

  for (const action of outgoing) {
    if (
      action.$to === 'all' ||
      (action.$to === 'others' && action.$from != Engine.userId) ||
      action.$to === Engine.userId
    )
      world.store.actions.incoming.push(action)
  }

  outgoing.length = 0

  return world
}

export default async function ActionDispatchSystem(world: World) {
  return () => {
    sendOutgoingActions(world)
  }
}
