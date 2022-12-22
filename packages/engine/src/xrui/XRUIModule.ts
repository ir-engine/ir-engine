import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import XRUISystem from './systems/XRUISystem'

export function XRUIModule() {
  return initSystems(Engine.instance.currentWorld, [
    {
      uuid: 'xre.engine.XRUISystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: XRUISystem })
    }
  ])
}
