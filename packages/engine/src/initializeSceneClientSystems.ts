import MediaSystem from './audio/systems/MediaSystem'
import PositionalAudioSystem from './audio/systems/PositionalAudioSystem'
import AnimationSystem from './avatar/AnimationSystem'
import AvatarControllerSystem from './avatar/AvatarControllerSystem'
import AvatarLoadingSystem from './avatar/AvatarLoadingSystem'
import AvatarTeleportSystem from './avatar/AvatarTeleportSystem'
import DebugHelpersSystem from './debug/systems/DebugHelpersSystem'
import DebugRenderer from './debug/systems/DebugRenderer'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import InteractiveSystem from './interaction/systems/InteractiveSystem'
import MediaControlSystem from './interaction/systems/MediaControlSystem'
import MountPointSystem from './interaction/systems/MountPointSystem'
import AutopilotSystem from './navigation/systems/AutopilotSystem'
import HighlightSystem from './renderer/HighlightSystem'
import HyperspacePortalSystem from './scene/systems/HyperspacePortalSystem'
import ParticleSystem from './scene/systems/ParticleSystem'
import PortalSystem from './scene/systems/PortalSystem'

export default function () {
  return [
    {
      uuid: 'xre.engine.AutopilotSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: AutopilotSystem })
    },
    {
      uuid: 'xre.engine.PortalSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: PortalSystem })
    },
    {
      uuid: 'xre.engine.HyperspacePortalSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => Promise.resolve({ default: HyperspacePortalSystem })
    },
    {
      uuid: 'xre.engine.AvatarTeleportSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => Promise.resolve({ default: AvatarTeleportSystem })
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
      type: SystemUpdateType.PRE_RENDER,
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
      uuid: 'xre.engine.AnimationSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: AnimationSystem })
    },
    {
      uuid: 'xre.engine.ParticleSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: ParticleSystem })
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
    },
    {
      uuid: 'xre.engine.HighlightSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: HighlightSystem })
    }
  ]
}
