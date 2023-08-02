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

import { AvatarSimulationSystemGroup } from '@etherealengine/engine/src/avatar/AvatarSystemGroups'
import { ECSSerializerSystem } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import {
  InputSystemGroup,
  PresentationSystemGroup,
  SimulationSystemGroup
} from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { GrabbableSystem } from '@etherealengine/engine/src/interaction/systems/GrabbableSystem'
import { InteractiveSystem } from '@etherealengine/engine/src/interaction/systems/InteractiveSystem'
import { MotionCaptureSystem } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { EntityNetworkStateSystem } from '@etherealengine/engine/src/networking/state/EntityNetworkState'
import { IncomingNetworkSystem } from '@etherealengine/engine/src/networking/systems/IncomingNetworkSystem'
import { OutgoingNetworkSystem } from '@etherealengine/engine/src/networking/systems/OutgoingNetworkSystem'
import { PhysicsSystem } from '@etherealengine/engine/src/physics/systems/PhysicsSystem'
import { SceneSystemLoadGroup, SceneSystemUpdateGroup } from '@etherealengine/engine/src/scene/SceneClientModule'

import { ServerHostNetworkSystem } from './ServerHostNetworkSystem'
import { ServerRecordingSystem } from './ServerRecordingSystem'

export const startMediaServerSystems = () => {
  /** Fixed */
  startSystems([EntityNetworkStateSystem], { with: SimulationSystemGroup })

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
      EntityNetworkStateSystem,
      ServerHostNetworkSystem,
      GrabbableSystem,
      AvatarSimulationSystemGroup
    ],
    {
      with: SimulationSystemGroup
    }
  )

  startSystems([PhysicsSystem, OutgoingNetworkSystem], {
    after: SimulationSystemGroup
  })

  /** Post Transform / Pre Render */
  startSystems([InteractiveSystem, SceneSystemUpdateGroup], {
    before: PresentationSystemGroup
  })

  /** Post Render */
  startSystems([ECSSerializerSystem, SceneSystemLoadGroup, ServerRecordingSystem], {
    after: PresentationSystemGroup
  })
}
