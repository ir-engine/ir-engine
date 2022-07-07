import { clearOutgoingActions } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'

const sendOutgoingActions = (world: World) => {
  for (const [instanceId, network] of world.networks) {
    try {
      const queue = Engine.instance.store.actions.outgoing[network.topic].queue
      network.sendActions(queue)
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
