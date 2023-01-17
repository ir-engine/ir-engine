import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import XRUISystem from './systems/XRUISystem'

export function XRUIModule() {
  return [
    {
      uuid: 'xre.engine.XRUISystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: XRUISystem })
    }
  ]
}
