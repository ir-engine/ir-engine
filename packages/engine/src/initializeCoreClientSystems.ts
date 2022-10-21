import CameraSystem from './camera/systems/CameraSystem'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import ClientInputSystem from './input/systems/ClientInputSystem'
import MaterialLibrarySystem from './renderer/materials/systems/MaterialLibrarySystem'
import WebGLRendererSystem from './renderer/WebGLRendererSystem'
import InstancingSystem from './scene/systems/InstancingSystem'
import SceneObjectDynamicLoadSystem from './scene/systems/SceneObjectDynamicLoadSystem'
import XRSystem from './xr/XRSystem'
import XRUISystem from './xrui/systems/XRUISystem'

export default function () {
  return [
    {
      uuid: 'xre.engine.CameraSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: CameraSystem })
    },
    {
      uuid: 'xre.engine.XRSystem',
      type: SystemUpdateType.UPDATE_EARLY,
      systemLoader: () => Promise.resolve({ default: XRSystem })
    },
    {
      uuid: 'xre.engine.ClientInputSystem',
      type: SystemUpdateType.UPDATE_EARLY,
      systemLoader: () => Promise.resolve({ default: ClientInputSystem })
    },
    {
      uuid: 'xre.engine.XRUISystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: XRUISystem })
    },
    {
      uuid: 'xre.engine.MaterialLibrarySystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: MaterialLibrarySystem })
    },
    {
      uuid: 'xre.engine.SceneObjectDynamicLoadSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: SceneObjectDynamicLoadSystem })
    },
    {
      uuid: 'xre.engine.InstancingSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: InstancingSystem })
    },
    {
      uuid: 'xre.engine.WebGLRendererSystem',
      type: SystemUpdateType.RENDER,
      systemLoader: () => Promise.resolve({ default: WebGLRendererSystem })
    }
  ]
}
