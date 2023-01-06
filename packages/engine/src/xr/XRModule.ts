import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import XRSystem from './XRSystem'

export function XRModule() {
  return initSystems(Engine.instance.currentWorld, [
    {
      uuid: 'xre.engine.XRSystem',
      type: SystemUpdateType.UPDATE_EARLY,
      systemLoader: () => Promise.resolve({ default: XRSystem })
    }
  ])
}
