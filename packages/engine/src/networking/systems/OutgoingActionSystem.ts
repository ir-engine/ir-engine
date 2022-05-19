import { clearOutgoingActions } from '@xrengine/hyperflux'

import { World } from '../../ecs/classes/World'

const sendOutgoingActions = (world: World) => {
  if (!world.worldNetwork) return

  try {
    world.worldNetwork.sendActions(world.worldNetwork.store.actions.outgoing)
  } catch (e) {
    console.error(e)
  }

  clearOutgoingActions(world.worldNetwork.store)
}

export default async function OutgoingActionSystem(world: World) {
  return () => {
    sendOutgoingActions(world)
  }
}
