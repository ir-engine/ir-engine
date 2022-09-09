import { createActionQueue, getState } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { revertAvatarToMovingStateFromTeleport } from '../functions/loaders/PortalFunctions'

export default async function PortalSystem(world: World) {
  const sceneLoadedQueue = createActionQueue(EngineActions.sceneLoaded.matches)
  return () => {
    if (sceneLoadedQueue().length && getState(EngineState).isTeleporting.value)
      revertAvatarToMovingStateFromTeleport(Engine.instance.currentWorld)
  }
}
