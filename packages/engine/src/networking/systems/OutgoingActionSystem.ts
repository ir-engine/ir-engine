import { clearOutgoingActions } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'

const sendOutgoingActions = (world: World) => {
  for (const [instanceId, network] of world.networks) {
    try {
      network.sendActions()
      clearOutgoingActions(instanceId, Engine.instance.store)
    } catch (e) {
      console.error(e)
    }
  }
}

export default function OutgoingActionSystem(world: World) {
  return () => {
    sendOutgoingActions(world)
  }
}
