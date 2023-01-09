import { createGLTFLoader } from '../assets/functions/createGLTFLoader'
import BehaveGraphSystem from '../behave-graph/systems/BehaveGraphSystem'
import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import SceneLoadingSystem from './systems/SceneLoadingSystem'
import SceneObjectSystem from './systems/SceneObjectSystem'
import TriggerSystem from './systems/TriggerSystem'

export function SceneCommonModule() {
  Engine.instance.gltfLoader = createGLTFLoader()
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
      uuid: 'xre.engine.TriggerSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: TriggerSystem })
    },
    {
      uuid: 'xre.engine.BehaveGraphSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: BehaveGraphSystem })
    }
  ])
}
