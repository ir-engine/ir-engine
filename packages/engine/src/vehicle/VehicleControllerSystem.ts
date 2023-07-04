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

import { useEffect } from 'react'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { addActionReceptor, defineActionQueue, dispatchAction, removeActionReceptor } from '@etherealengine/hyperflux'

import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { Engine } from '../ecs/classes/Engine'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { NetworkObjectAuthorityTag, NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { VehicleControllerComponent } from './components/VehicleControllerComponent'

const localControllerQuery = defineQuery([VehicleControllerComponent, LocalInputTagComponent])
const controllerQuery = defineQuery([VehicleControllerComponent])

const execute = () => {
  const controlledEntity = Engine.instance.localClientEntity

  if (hasComponent(controlledEntity, VehicleControllerComponent)) {
    const controller = getComponent(controlledEntity, VehicleControllerComponent)

    if (controller.movementEnabled) {
      if (
        !hasComponent(controlledEntity, NetworkObjectAuthorityTag) &&
        Engine.instance.worldNetwork &&
        controller.gamepadWorldMovement.lengthSq() > 0.1 * Engine.instance.deltaSeconds
      ) {
        const networkObject = getComponent(controlledEntity, NetworkObjectComponent)
        dispatchAction(
          WorldNetworkAction.transferAuthorityOfObject({
            ownerId: networkObject.ownerId,
            networkId: networkObject.networkId,
            newAuthority: Engine.instance.peerID
          })
        )
        setComponent(controlledEntity, NetworkObjectAuthorityTag)
      }
    }

    //const rigidbody = getComponent(controlledEntity, RigidBodyComponent)
    //if (rigidbody.position.y < -10) respawnVehicle(controlledEntity)
  }
}

export const VehicleControllerSystem = defineSystem({
  uuid: 'ee.engine.VehicleControllerSystem',
  execute
})
