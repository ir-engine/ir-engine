import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import AvatarSpawnSystem from './AvatarSpawnSystem'
import AvatarSystem from './AvatarSystem'

export function AvatarCommonModule() {
  return initSystems(Engine.instance.currentWorld, [
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
  ])
}
