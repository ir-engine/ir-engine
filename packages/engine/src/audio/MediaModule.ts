import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import MediaSystem from './systems/MediaSystem'
import PositionalAudioSystem from './systems/PositionalAudioSystem'

export function MediaModule() {
  return initSystems(Engine.instance.currentWorld, [
    {
      uuid: 'xre.engine.MediaSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: MediaSystem })
    },
    {
      uuid: 'xre.engine.PositionalAudioSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: PositionalAudioSystem })
    }
  ])
}
