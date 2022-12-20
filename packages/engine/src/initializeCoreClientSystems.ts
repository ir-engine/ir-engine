import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import ClientInputSystem from './input/systems/ClientInputSystem'
import XRSystem from './xr/XRSystem'
import XRUISystem from './xrui/systems/XRUISystem'

export default function () {
  return [
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
    }
  ]
}
