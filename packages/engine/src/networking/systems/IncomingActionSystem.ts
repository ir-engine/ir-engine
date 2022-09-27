import { applyIncomingActions } from '@xrengine/hyperflux'

import { World } from '../../ecs/classes/World'

export default function IncomingActionSystem(world: World) {
  const execute = () => {
    applyIncomingActions()
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
