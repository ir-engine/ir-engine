import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import { World } from '../../src/ecs/classes/World'

export const mockProgressWorldForNetworkActions = (world: World) => {
  // increment tick
  world.fixedTick += 16 // TODO: figure out why we need to dispatch two ticks ahead

  // incoming
  ActionFunctions.applyIncomingActions(world.store, Date.now())
}
