import MediaSystem from './audio/systems/MediaSystem'
import PositionalAudioSystem from './audio/systems/PositionalAudioSystem'
import AnimationSystem from './avatar/AnimationSystem'
import AvatarControllerSystem from './avatar/AvatarControllerSystem'
import AvatarInputSystem from './avatar/AvatarInputSystem'
import AvatarLoadingSystem from './avatar/AvatarLoadingSystem'
import AvatarTeleportSystem from './avatar/AvatarTeleportSystem'
import FlyControlSystem from './avatar/FlyControlSystem'
import DebugHelpersSystem from './debug/systems/DebugHelpersSystem'
import DebugRenderer from './debug/systems/DebugRenderer'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import InteractiveSystem from './interaction/systems/InteractiveSystem'
import MediaControlSystem from './interaction/systems/MediaControlSystem'
import MountPointSystem from './interaction/systems/MountPointSystem'

export default function () {
  return [
    {
      uuid: 'xre.engine.FlyControlSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: FlyControlSystem })
    },
    {
      uuid: 'xre.engine.AvatarTeleportSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: AvatarTeleportSystem })
    },
    {
      uuid: 'xre.engine.AnimationSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: AnimationSystem })
    },
    {
      uuid: 'xre.engine.AvatarInputSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: AvatarInputSystem })
    },
    {
      uuid: 'xre.engine.AvatarControllerSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => Promise.resolve({ default: AvatarControllerSystem })
    },
    {
      uuid: 'xre.engine.InteractiveSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: InteractiveSystem })
    },
    {
      uuid: 'xre.engine.MediaSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: MediaSystem })
    },
    {
      uuid: 'xre.engine.MountPointSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: MountPointSystem })
    },
    {
      uuid: 'xre.engine.PositionalAudioSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: PositionalAudioSystem })
    },
    {
      uuid: 'xre.engine.MediaControlSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: MediaControlSystem })
    },
    {
      uuid: 'xre.engine.AvatarLoadingSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: AvatarLoadingSystem })
    },
    {
      uuid: 'xre.engine.DebugHelpersSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: DebugHelpersSystem })
    },
    {
      uuid: 'xre.engine.DebugRenderer',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: DebugRenderer })
    }
  ]
}
