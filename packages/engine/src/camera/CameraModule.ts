import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import CameraInputSystem from './systems/CameraInputSystem'
import CameraSystem from './systems/CameraSystem'
import SplineCameraSystem from './systems/SplineCameraSystem'

export function CameraModule() {
  return initSystems(Engine.instance.currentWorld, [
    {
      uuid: 'xre.engine.CameraInputSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: CameraInputSystem })
    },
    {
      uuid: 'xre.engine.CameraSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: CameraSystem })
    },
    {
      uuid: 'xre.engine.SplineCameraSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: SplineCameraSystem })
    }
  ])
}
