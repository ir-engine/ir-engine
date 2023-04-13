import { createGLTFLoader } from '../assets/functions/createGLTFLoader'
import { BehaveGraphSystem } from '../behave-graph/systems/BehaveGraphSystem'
import { Engine } from '../ecs/classes/Engine'
import { PostAvatarUpdateSystemGroup, PresentationSystemGroup } from '../ecs/functions/SystemFunctions'
import { SceneLoadingSystem } from './systems/SceneLoadingSystem'
import { SceneObjectSystem } from './systems/SceneObjectSystem'
import { SceneObjectUpdateSystem } from './systems/SceneObjectUpdateSystem'
import { TriggerSystem } from './systems/TriggerSystem'

export function SceneCommonModule() {
  insertSystems([SceneObjectSystem], 'before', PostAvatarUpdateSystemGroup)
  insertSystems([XRSystem], 'before', InputSystemGroup)
  insertSystems([XRSystem], 'before', InputSystemGroup)
  return [
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
      uuid: 'xre.engine.SceneObjectUpdateSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: SceneObjectUpdateSystem })
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
  ]
}
