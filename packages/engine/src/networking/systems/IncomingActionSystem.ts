import { applyIncomingActionsOnExternalReceptors } from '@xrengine/hyperflux'

import { World } from '../../ecs/classes/World'

export default async function IncomingActionSystem(world: World) {
  return () => {
    applyIncomingActionsOnExternalReceptors(world.worldNetwork.store)
  }
}
