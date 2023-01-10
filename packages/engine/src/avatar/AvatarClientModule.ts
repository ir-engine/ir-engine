import { Engine } from '../ecs/classes/Engine'
import { initSystems } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import AnimationSystem from './AnimationSystem'
import AvatarAnimationSystem from './AvatarAnimationSystem'
import AvatarControllerSystem from './AvatarControllerSystem'
import AvatarInputSystem from './AvatarInputSystem'
import AvatarLoadingSystem from './AvatarLoadingSystem'
import AvatarMovementSystem from './AvatarMovementSystem'
import AvatarTeleportSystem from './AvatarTeleportSystem'
import FlyControlSystem from './FlyControlSystem'

export function AvatarClientModule() {
  return initSystems(Engine.instance.currentWorld, [
    {
      uuid: 'xre.engine.AvatarInputSystem',
      type: SystemUpdateType.UPDATE_EARLY,
      systemLoader: () => Promise.resolve({ default: AvatarInputSystem })
    },
    {
      uuid: 'xre.engine.AvatarControllerSystem',
      type: SystemUpdateType.UPDATE_EARLY,
      systemLoader: () => Promise.resolve({ default: AvatarControllerSystem })
    },
    {
      uuid: 'xre.engine.AvatarTeleportSystem',
      type: SystemUpdateType.UPDATE_EARLY,
      systemLoader: () => Promise.resolve({ default: AvatarTeleportSystem })
    },
    {
      uuid: 'xre.engine.AnimationSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: AnimationSystem })
    },
    {
      uuid: 'xre.engine.AvatarMovementSystem',
      type: SystemUpdateType.FIXED_EARLY,
      systemLoader: () => Promise.resolve({ default: AvatarMovementSystem })
    },
    {
      uuid: 'xre.engine.AvatarAnimationSystem',
      type: SystemUpdateType.UPDATE_LATE,
      before: 'xre.engine.TransformSystem',
      systemLoader: () => Promise.resolve({ default: AvatarAnimationSystem })
    },
    {
      uuid: 'xre.engine.FlyControlSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: FlyControlSystem })
    },
    {
      uuid: 'xre.engine.AvatarLoadingSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: AvatarLoadingSystem })
    }
  ])
}
