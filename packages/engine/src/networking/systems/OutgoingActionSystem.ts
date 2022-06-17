import { clearOutgoingActions } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'

const sendOutgoingActions = (world: World) => {
  for (const [instanceId, network] of world.networks) {
    try {
      network.sendActions(Engine.instance.store.actions.outgoing[instanceId].queue)
    } catch (e) {
      console.error(e)
    }
  }
  clearOutgoingActions(Engine.instance.store)
}

export default function OutgoingActionSystem(world: World) {
  return () => {
    sendOutgoingActions(world)
  }
}
