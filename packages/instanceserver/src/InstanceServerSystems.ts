import { AvatarSimulationGroup } from '@etherealengine/engine/src/avatar/AvatarClientSystems'
import { AvatarSpawnSystem } from '@etherealengine/engine/src/avatar/AvatarSpawnSystem'
import { ECSSerializerSystem } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import {
  AnimationSystemGroup,
  InputSystemGroup,
  PresentationSystemGroup,
  SimulationSystemGroup
} from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { EquippableSystem } from '@etherealengine/engine/src/interaction/systems/EquippableSystem'
import { InteractiveSystem } from '@etherealengine/engine/src/interaction/systems/InteractiveSystem'
import { MotionCaptureSystem } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { IncomingNetworkSystem } from '@etherealengine/engine/src/networking/systems/IncomingNetworkSystem'
import { OutgoingNetworkSystem } from '@etherealengine/engine/src/networking/systems/OutgoingNetworkSystem'
import { WorldNetworkActionSystem } from '@etherealengine/engine/src/networking/systems/WorldNetworkActionSystem'
import { PhysicsSystem } from '@etherealengine/engine/src/physics/systems/PhysicsSystem'
import { SceneSystemLoadGroup, SceneSystemUpdateGroup } from '@etherealengine/engine/src/scene/SceneClientModule'

import { ServerHostNetworkSystem } from './ServerHostNetworkSystem'
import { ServerRecordingSystem } from './ServerRecordingSystem'

export const startMediaServerSystems = () => {
  /** Fixed */
  startSystems([WorldNetworkActionSystem], { with: SimulationSystemGroup })

  /** Post Render */
  startSystems([ServerRecordingSystem], {
    after: PresentationSystemGroup
  })
}

export const startWorldServerSystems = () => {
  /** Input */
  startSystems([MotionCaptureSystem], { with: InputSystemGroup })

  /** Fixed */
  startSystems(
    [
      IncomingNetworkSystem,
      WorldNetworkActionSystem,
      ServerHostNetworkSystem,
      EquippableSystem,
      AvatarSimulationGroup,
      PhysicsSystem,
      OutgoingNetworkSystem
    ],
    {
      with: SimulationSystemGroup
    }
  )

  /** Avatar / Pre Transform */
  startSystems([AvatarSpawnSystem], { with: AnimationSystemGroup })

  /** Post Transform / Pre Render */
  startSystems([InteractiveSystem, SceneSystemUpdateGroup], {
    before: PresentationSystemGroup
  })

  /** Post Render */
  startSystems([ECSSerializerSystem, SceneSystemLoadGroup, ServerRecordingSystem], {
    after: PresentationSystemGroup
  })
}
