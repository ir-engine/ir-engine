import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import ReferenceSpaceTransformSystem from '../transform/systems/ReferenceSpaceTransformSystem'
import XRAnchorSystem from '../xr/XRAnchorSystem'
import AnimationSystem from './AnimationSystem'
import AvatarAnimationSystem from './AvatarAnimationSystem'
import AvatarAutopilotSystem from './AvatarAutopilotSystem'
import AvatarControllerSystem from './AvatarControllerSystem'
import AvatarInputSystem from './AvatarInputSystem'
import AvatarLoadingSystem from './AvatarLoadingSystem'
import AvatarMovementSystem from './AvatarMovementSystem'
import AvatarTeleportSystem from './AvatarTeleportSystem'
import FlyControlSystem from './FlyControlSystem'

export function AvatarClientModule() {
  return [
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
      uuid: 'xre.engine.AvatarAutopilotSystem',
      type: SystemUpdateType.FIXED_EARLY,
      systemLoader: () => Promise.resolve({ default: AvatarAutopilotSystem })
    },
    {
      uuid: 'xre.engine.ReferenceSpaceTransformSystem',
      type: SystemUpdateType.UPDATE_LATE,
      before: 'xre.engine.TransformSystem',
      systemLoader: () => Promise.resolve({ default: ReferenceSpaceTransformSystem })
    },
    {
      uuid: 'xre.engine.XRAnchorSystem',
      type: SystemUpdateType.UPDATE_LATE,
      after: 'xre.engine.ReferenceSpaceTransformSystem',
      systemLoader: () => Promise.resolve({ default: XRAnchorSystem })
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
  ]
}
