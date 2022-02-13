import { World } from '../../src/ecs/classes/World'
import { applyIncomingActions } from '../../src/ecs/functions/ActionDispatchSystem'

export const mockProgressWorldForNetworkActions = (world: World) => {
  // increment tick
  world.fixedTick += 2 // TODO: figure out why we need to dispatch two ticks ahead

  // incoming
  applyIncomingActions(world)
}
