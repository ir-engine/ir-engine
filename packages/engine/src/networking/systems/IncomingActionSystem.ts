import { applyIncomingActions } from '@etherealengine/hyperflux'

import { World } from '../../ecs/classes/World'

export default function IncomingActionSystem() {
  const execute = () => {
    applyIncomingActions()
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
