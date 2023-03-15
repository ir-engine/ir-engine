import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import ECSSerializerSystem from './ECSSerializerSystem'

export function ECSSerializationModule() {
  return [
    {
      uuid: 'xre.engine.ECSSerializerSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: ECSSerializerSystem })
    }
  ]
}
