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

import { Collider, KinematicCharacterController } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const VehicleControllerComponent = defineComponent({
  name: 'VehicleControllerComponent',

  onInit(entity) {
    return {
      /** The camera entity that should be updated by this controller */
      cameraEntity: Engine.instance.cameraEntity,
      controller: null! as KinematicCharacterController,
      movementEnabled: true,
      isInAir: false,
      /** velocity along the Y axis */
      verticalVelocity: 0,
      /** Is the gamepad-driven jump active */
      /** gamepad-driven input, in the local XZ plane */
      gamepadLocalInput: new Vector3(),
      /** gamepad-driven movement, in the world XZ plane */
      gamepadWorldMovement: new Vector3()
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (matches.number.test(json.cameraEntity)) component.cameraEntity.set(json.cameraEntity)
    if (matches.object.test(json.controller)) component.controller.set(json.controller as KinematicCharacterController)
    if (matches.boolean.test(json.movementEnabled)) component.movementEnabled.set(json.movementEnabled)
    if (matches.boolean.test(json.isInAir)) component.isInAir.set(json.isInAir)
    if (matches.number.test(json.verticalVelocity)) component.verticalVelocity.set(json.verticalVelocity)
    if (matches.object.test(json.gamepadLocalInput)) component.gamepadLocalInput.set(json.gamepadLocalInput)
    if (matches.object.test(json.gamepadWorldMovement)) component.gamepadWorldMovement.set(json.gamepadWorldMovement)
  }
})
