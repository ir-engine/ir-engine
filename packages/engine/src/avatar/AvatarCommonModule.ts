import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import AvatarSpawnSystem from './AvatarSpawnSystem'

export function AvatarCommonModule() {
  return [
    {
      uuid: 'xre.engine.AvatarSpawnSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: AvatarSpawnSystem })
    }
  ]
}
