import { clearOutgoingActions } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { NetworkTopics } from '../classes/Network'

const sendOutgoingActions = (world: World) => {
  for (const [instanceId, network] of world.networks) {
    const { queue } = Engine.instance.store.actions.outgoing[network.topic]
    try {
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
