/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { MediaSystem } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { PositionalAudioSystem } from '@etherealengine/engine/src/audio/systems/PositionalAudioSystem'
import {
  AvatarAnimationSystemGroup,
  AvatarInputSystemGroup,
  AvatarSimulationSystemGroup
} from '@etherealengine/engine/src/avatar/AvatarSystemGroups'
import { AnimationSystem } from '@etherealengine/engine/src/avatar/systems/AnimationSystem'
import { CameraInputSystem } from '@etherealengine/engine/src/camera/systems/CameraInputSystem'
import { CameraSystem } from '@etherealengine/engine/src/camera/systems/CameraSystem'
import { DebugRendererSystem } from '@etherealengine/engine/src/debug/systems/DebugRendererSystem'
import { ECSSerializerSystem } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import {
  AnimationSystemGroup,
  InputSystemGroup,
  PresentationSystemGroup,
  SimulationSystemGroup
} from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { ButtonCleanupSystem } from '@etherealengine/engine/src/input/systems/ButtonCleanupSystem'
import { ClientInputSystem } from '@etherealengine/engine/src/input/systems/ClientInputSystem'
import { GrabbableSystem } from '@etherealengine/engine/src/interaction/systems/GrabbableSystem'
import { InteractiveSystem } from '@etherealengine/engine/src/interaction/systems/InteractiveSystem'
import { MediaControlSystem } from '@etherealengine/engine/src/interaction/systems/MediaControlSystem'
import { MotionCaptureSystem } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { EntityNetworkStateSystem } from '@etherealengine/engine/src/networking/state/EntityNetworkState'
import { IncomingNetworkSystem } from '@etherealengine/engine/src/networking/systems/IncomingNetworkSystem'
import { OutgoingNetworkSystem } from '@etherealengine/engine/src/networking/systems/OutgoingNetworkSystem'
import { PhysicsSystem } from '@etherealengine/engine/src/physics/systems/PhysicsSystem'
import { WebGLRendererSystem } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { SceneSystemLoadGroup, SceneSystemUpdateGroup } from '@etherealengine/engine/src/scene/SceneClientModule'
import { PortalSystem } from '@etherealengine/engine/src/scene/systems/PortalSystem'
import { ReferenceSpaceTransformSystem } from '@etherealengine/engine/src/transform/systems/ReferenceSpaceTransformSystem'
import { TransformSystem } from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { XRAnchorSystem } from '@etherealengine/engine/src/xr/XRAnchorSystem'
import { XRSystem } from '@etherealengine/engine/src/xr/XRSystem'
import { XRUISystem } from '@etherealengine/engine/src/xrui/systems/XRUISystem'

export const startClientSystems = () => {
  /** Input */
  startSystems([XRSystem, MotionCaptureSystem, ClientInputSystem, AvatarInputSystemGroup, CameraInputSystem], {
    with: InputSystemGroup
  })

  /** Fixed */
  startSystems([IncomingNetworkSystem, EntityNetworkStateSystem, GrabbableSystem, AvatarSimulationSystemGroup], {
    with: SimulationSystemGroup
  })

  /** Physics */
  startSystems([PhysicsSystem, OutgoingNetworkSystem], { after: SimulationSystemGroup })

  /** Avatar / Animation */
  startSystems(
    [ReferenceSpaceTransformSystem, XRAnchorSystem, AnimationSystem, CameraSystem, AvatarAnimationSystemGroup],
    {
      with: AnimationSystemGroup
    }
  )

  /** Post Animation / Pre Transform */
  startSystems([XRUISystem, InteractiveSystem, MediaControlSystem], { before: TransformSystem })

  /** Post Transform / Pre Render */
  startSystems([MediaSystem, DebugRendererSystem, SceneSystemUpdateGroup], {
    before: PresentationSystemGroup
  })

  /** Render */
  startSystems([WebGLRendererSystem], {
    with: PresentationSystemGroup
  })

  /** Post Render */
  startSystems([ButtonCleanupSystem, PortalSystem, ECSSerializerSystem, PositionalAudioSystem, SceneSystemLoadGroup], {
    after: PresentationSystemGroup
  })
}
