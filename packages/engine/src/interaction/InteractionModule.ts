import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import InteractiveSystem from './systems/InteractiveSystem'
import MediaControlSystem from './systems/MediaControlSystem'
import MountPointSystem from './systems/MountPointSystem'

export function InteractionModule() {
  return initSystems(Engine.instance.currentWorld, [
    {
      uuid: 'xre.engine.InteractiveSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: InteractiveSystem })
    },
    {
      uuid: 'xre.engine.MountPointSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: MountPointSystem })
    },
    {
      uuid: 'xre.engine.MediaControlSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: MediaControlSystem })
    }
    /** @todo fix equippable implementation #3947 */
    // {
    //   uuid: 'xre.engine.EquippableSystem',
    //   type: SystemUpdateType.FIXED_LATE,
    //   systemLoader: () => Promise.resolve({ EquippableSystem })
    // },
  ])
}
