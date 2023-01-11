import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import DebugRenderer from './systems/DebugRenderer'

export function DebugModule() {
  return [
    {
      uuid: 'xre.engine.DebugRenderer',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: DebugRenderer })
    }
  ]
}
