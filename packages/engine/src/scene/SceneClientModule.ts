import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import MaterialLibrarySystem from '../renderer/materials/systems/MaterialLibrarySystem'
import HyperspacePortalSystem from './systems/HyperspacePortalSystem'
import InstancingSystem from './systems/InstancingSystem'
import LightSystem from './systems/LightSystem'
import ParticleSystem from './systems/ParticleSystemSystem'
import PortalLoadSystem from './systems/PortalLoadSystem'
import PortalSystem from './systems/PortalSystem'
import SceneObjectDynamicLoadSystem from './systems/SceneObjectDynamicLoadSystem'

export function SceneClientModule() {
  return [
    {
      uuid: 'xre.engine.PortalSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: PortalSystem })
    },
    {
      uuid: 'xre.engine.HyperspacePortalSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: HyperspacePortalSystem })
    },
    {
      uuid: 'xre.engine.ParticleSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: ParticleSystem })
    },
    {
      uuid: 'xre.engine.LightSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: LightSystem })
    },
    {
      uuid: 'xre.engine.InstancingSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: InstancingSystem })
    },
    {
      uuid: 'ee.client.core.PortalLoadSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: PortalLoadSystem })
    },
    {
      uuid: 'xre.engine.SceneObjectDynamicLoadSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: SceneObjectDynamicLoadSystem })
    },
    {
      uuid: 'xre.engine.MaterialLibrarySystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: MaterialLibrarySystem })
    }
  ]
}
