import { dispatchAction } from '@xrengine/hyperflux'

import { isClient } from './common/functions/isClient'
import { Engine } from './ecs/classes/Engine'
import { EngineActions } from './ecs/classes/EngineState'
import { initSystems, SystemModuleType } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import AssetSystem from './scene/systems/AssetSystem'
import LightSystem from './scene/systems/LightSystem'
import SceneLoadingSystem from './scene/systems/SceneLoadingSystem'
import SceneObjectSystem from './scene/systems/SceneObjectSystem'
import SceneObjectUpdateSystem from './scene/systems/SceneObjectUpdateSystem'
import TransformSystem from './transform/systems/TransformSystem'

export const initializeCoreSystems = async (injectedSystems?: SystemModuleType<any>[]) => {
  const systemsToLoad: SystemModuleType<any>[] = []
  systemsToLoad.push(
    {
      uuid: 'xre.engine.SceneObjectSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: SceneObjectSystem })
    },
    {
      uuid: 'xre.engine.TransformSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: TransformSystem })
    },
    {
      uuid: 'xre.engine.SceneLoadingSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: SceneLoadingSystem })
    },
    {
      uuid: 'xre.engine.SceneObjectUpdateSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: SceneObjectUpdateSystem })
    },
    {
      uuid: 'xre.engine.LightSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: LightSystem })
    },
    {
      uuid: 'xre.engine.AssetSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: AssetSystem })
    }
  )

  if (isClient) {
    systemsToLoad.push(...(await import('./initializeCoreClientSystems')).default())
  }

  const world = Engine.instance.currentWorld
  await initSystems(world, systemsToLoad)

  // load injected systems which may rely on core systems
  if (injectedSystems) await initSystems(world, injectedSystems)

  dispatchAction(EngineActions.initializeEngine({ initialised: true }))
}
