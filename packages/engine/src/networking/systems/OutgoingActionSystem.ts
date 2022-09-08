import { World } from '../../ecs/classes/World'

const sendOutgoingActions = (world: World) => {
  for (const [instanceId, network] of world.networks) {
    try {
      network.sendActions()
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
