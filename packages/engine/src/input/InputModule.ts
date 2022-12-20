import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import ButtonSystem from './systems/ButtonSystem'
import ClientInputSystem from './systems/ClientInputSystem'

export default function () {
  return initSystems(Engine.instance.currentWorld, [
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
  ])
}
