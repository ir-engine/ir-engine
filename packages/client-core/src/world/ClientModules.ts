import { MediaSystem } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { PositionalAudioSystem } from '@etherealengine/engine/src/audio/systems/PositionalAudioSystem'
import { AnimationSystem } from '@etherealengine/engine/src/avatar/AnimationSystem'
import { AvatarAnimationSystem } from '@etherealengine/engine/src/avatar/AvatarAnimationSystem'
import { AvatarInputGroup, AvatarSimulationGroup } from '@etherealengine/engine/src/avatar/AvatarClientSystems'
import { CameraInputSystem } from '@etherealengine/engine/src/camera/systems/CameraInputSystem'
import { CameraSystem } from '@etherealengine/engine/src/camera/systems/CameraSystem'
import { DebugRendererSystem } from '@etherealengine/engine/src/debug/systems/DebugRendererSystem'
import { ECSSerializerSystem } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import {
  AnimationSystemGroup,
  defineSystem,
  InputSystemGroup,
  insertSystems,
  PresentationSystemGroup,
  SimulationSystemGroup
} from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { ButtonCleanupSystem } from '@etherealengine/engine/src/input/systems/ButtonCleanupSystem'
import { ClientInputSystem } from '@etherealengine/engine/src/input/systems/ClientInputSystem'
import { InteractiveSystem } from '@etherealengine/engine/src/interaction/systems/InteractiveSystem'
import { MediaControlSystem } from '@etherealengine/engine/src/interaction/systems/MediaControlSystem'
import { MotionCaptureSystem } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { IncomingNetworkSystem } from '@etherealengine/engine/src/networking/systems/IncomingNetworkSystem'
import { OutgoingActionSystem } from '@etherealengine/engine/src/networking/systems/OutgoingActionSystem'
import { PhysicsSystem } from '@etherealengine/engine/src/physics/systems/PhysicsSystem'
import { HighlightSystem } from '@etherealengine/engine/src/renderer/HighlightSystem'
import { SceneSystemLoadGroup, SceneSystemUpdateGroup } from '@etherealengine/engine/src/scene/SceneClientModule'
import { SceneObjectSystem } from '@etherealengine/engine/src/scene/systems/SceneObjectSystem'
import { ReferenceSpaceTransformSystem } from '@etherealengine/engine/src/transform/systems/ReferenceSpaceTransformSystem'
import { TransformSystem } from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { XRAnchorSystem } from '@etherealengine/engine/src/xr/XRAnchorSystem'
import { XRSystem } from '@etherealengine/engine/src/xr/XRSystem'
import { XRUISystem } from '@etherealengine/engine/src/xrui/systems/XRUISystem'

export const ClientSystems = () => {
  /** Input */
  insertSystems(
    [IncomingNetworkSystem, XRSystem, MotionCaptureSystem, ClientInputSystem, AvatarInputGroup, CameraInputSystem],
    { with: InputSystemGroup }
  )

  /** Fixed */
  insertSystems([AvatarSimulationGroup, PhysicsSystem, OutgoingActionSystem], { with: SimulationSystemGroup })

  /** Avatar / Pre Transform */
  insertSystems([ReferenceSpaceTransformSystem, XRAnchorSystem, AnimationSystem, CameraSystem, AvatarAnimationSystem], {
    with: AnimationSystemGroup
  })

  /** Post Animation / Pre Transform */
  insertSystems([XRUISystem, InteractiveSystem, MediaControlSystem], { before: TransformSystem })

  /** Post Transform / Pre Render */
  insertSystems([HighlightSystem, MediaSystem, SceneObjectSystem, DebugRendererSystem, SceneSystemUpdateGroup], {
    before: PresentationSystemGroup
  })

  /** Post Render */
  insertSystems([ButtonCleanupSystem, ECSSerializerSystem, PositionalAudioSystem, SceneSystemLoadGroup], {
    after: PresentationSystemGroup
  })
}
