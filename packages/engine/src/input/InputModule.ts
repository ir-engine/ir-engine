import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import ButtonSystem from './systems/ButtonSystem'
import ClientInputSystem from './systems/ClientInputSystem'

export function InputModule() {
  return [
    {
      uuid: 'xre.engine.ClientInputSystem',
      type: SystemUpdateType.UPDATE_EARLY,
      systemLoader: () => Promise.resolve({ default: ClientInputSystem })
    },
    {
      uuid: 'xre.engine.ButtonSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: ButtonSystem })
    }
  ]
}
