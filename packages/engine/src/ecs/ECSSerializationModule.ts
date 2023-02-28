import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import ECSSerialization from './ECSSerialization'

export function ECSSerializationModule() {
  return [
    {
      uuid: 'xre.engine.ECSSerialization',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: ECSSerialization })
    }
  ]
}
