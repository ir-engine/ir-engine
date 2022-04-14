import { clearOutgoingActions, dispatchAction } from '@xrengine/hyperflux'

import { World } from '../../ecs/classes/World'
import { Network } from '../classes/Network'

const sendOutgoingActions = (world: World) => {
  const transport = Network.instance.transportHandler?.getWorldTransport()
  if (!transport) return

  try {
    transport.sendActions(world.store.actions.outgoing)
  } catch (e) {
    console.error(e)
  }

  clearOutgoingActions(world.store, world.isHosting)

  return world
}

export default async function OutgoingActionSystem(world: World) {
  return () => {
    sendOutgoingActions(world)
  }
}
