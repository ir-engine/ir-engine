import { createActionQueue, getState, removeActionQueue } from '@etherealengine/hyperflux'

import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { revertAvatarToMovingStateFromTeleport } from '../functions/loaders/PortalFunctions'

export default async function PortalSystem() {
  const sceneLoadedQueue = createActionQueue(EngineActions.sceneLoaded.matches)
  const execute = () => {
    if (sceneLoadedQueue().length && getState(EngineState).isTeleporting.value) revertAvatarToMovingStateFromTeleport()
  }

  const cleanup = async () => {
    removeActionQueue(sceneLoadedQueue)
  }

  return { execute, cleanup }
}
