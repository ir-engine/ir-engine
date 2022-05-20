import { applyIncomingActions } from '@xrengine/hyperflux'

import { World } from '../../ecs/classes/World'

export default async function IncomingActionSystem(world: World) {
  return () => {
    world.networks.forEach((network) => {
      applyIncomingActions(network.store, world._store.receptors)
    })
  }
}
