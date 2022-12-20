import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import AssetSystem from './systems/AssetSystem'
import SceneLoadingSystem from './systems/SceneLoadingSystem'
import SceneObjectSystem from './systems/SceneObjectSystem'
import TriggerSystem from './systems/TriggerSystem'

export default function () {
  return initSystems(Engine.instance.currentWorld, [
    {
      uuid: 'xre.engine.SceneObjectSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: SceneObjectSystem })
    },
    {
      uuid: 'xre.engine.SceneLoadingSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: SceneLoadingSystem })
    },
    {
      uuid: 'xre.engine.AssetSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: AssetSystem })
    },
    {
      uuid: 'xre.engine.TriggerSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: TriggerSystem })
    }
  ])
}
