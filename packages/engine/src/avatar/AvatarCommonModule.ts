import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import AvatarSpawnSystem from './AvatarSpawnSystem'
import AvatarSystem from './AvatarSystem'

export function AvatarCommonModule() {
  return [
    {
      uuid: 'xre.engine.AvatarSpawnSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: AvatarSpawnSystem })
    },
    {
      uuid: 'xre.engine.AvatarSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: AvatarSystem })
    }
  ]
}
