/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { defineActionQueue } from '@ir-engine/hyperflux'

import { InputSourceComponent } from '../input/components/InputSourceComponent'
import { XRAction } from './XRState'

/** haptic typings are currently incomplete */

declare global {
  interface GamepadHapticActuator {
    /**
     * @deprecated - old meta quest API
     * @param value A double representing the intensity of the pulse. This can vary depending on the hardware type, but generally takes a value between 0.0 (no intensity) and 1.0 (full intensity).
     * @param duration A double representing the duration of the pulse, in milliseconds.
     */
    pulse: (value: number, duration: number) => void
  }
}

const inputSourceQuery = defineQuery([InputSourceComponent])

const vibrateControllerQueue = defineActionQueue(XRAction.vibrateController.matches)

const execute = () => {
  for (const action of vibrateControllerQueue()) {
    for (const inputSourceEntity of inputSourceQuery()) {
      const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)
      if (inputSourceComponent.source.gamepad && inputSourceComponent.source.handedness === action.handedness) {
        if ('hapticActuators' in inputSourceComponent.source.gamepad) {
          // old meta quest API
          inputSourceComponent.source.gamepad.hapticActuators?.[0]?.pulse(action.value, action.duration)
          continue
        }

        const actuator = inputSourceComponent.source.gamepad?.vibrationActuator
        if (!actuator) continue
        else actuator.playEffect('dual-rumble', { duration: action.duration })
      }
    }
  }
}

export const XRHapticsSystem = defineSystem({
  uuid: 'ee.engine.XRHapticsSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
