import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import DebugRendererSystem from './systems/DebugRendererSystem'

export function DebugModule() {
  return [
    {
      uuid: 'xre.engine.DebugRendererSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: DebugRendererSystem })
    }
  ]
}
