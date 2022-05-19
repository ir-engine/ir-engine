import { applyIncomingActionsOnExternalReceptors } from '@xrengine/hyperflux'

import { World } from '../../ecs/classes/World'

export default async function IncomingActionSystem(world: World) {
  return () => {
    world.networks.forEach((network) => {
      world._store.actions.incoming.push(...network.store.actions.incoming)
      network.store.actions.incoming = []
    })
    applyIncomingActionsOnExternalReceptors(world._store)
  }
}
