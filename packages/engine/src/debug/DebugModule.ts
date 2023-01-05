import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import DebugRenderer from './systems/DebugRenderer'

export function DebugModule() {
  return initSystems(Engine.instance.currentWorld, [
    {
      uuid: 'xre.engine.DebugRenderer',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: DebugRenderer })
    }
  ])
}
