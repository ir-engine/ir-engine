import { dispatchAction } from '@xrengine/hyperflux'

import { createGLTFLoader } from './assets/functions/createGLTFLoader'
import BehaveGraphSystem from './behave-graph/systems/BehaveGraphSystem'
import { isClient } from './common/functions/isClient'
import { Engine } from './ecs/classes/Engine'
import { EngineActions } from './ecs/classes/EngineState'
import { initSystems, SystemModuleType } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import TransformSystem from './transform/systems/TransformSystem'

export const initializeCoreSystems = async (injectedSystems?: SystemModuleType<any>[]) => {
  Engine.instance.gltfLoader = createGLTFLoader()

  const systemsToLoad: SystemModuleType<any>[] = []
  systemsToLoad.push(
    {
      uuid: 'xre.engine.TransformSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: TransformSystem })
    },
    {
      uuid: 'xre.engine.BehaveGraphSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: BehaveGraphSystem })
    }
  )

  if (isClient) {
    systemsToLoad.push(...(await import('./initializeCoreClientSystems')).default())
  }

  const world = Engine.instance.currentWorld
  await initSystems(world, systemsToLoad)

  // load injected systems which may rely on core systems
  if (injectedSystems) await initSystems(world, injectedSystems)
}
