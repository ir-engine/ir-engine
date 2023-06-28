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

import { Quaternion } from 'three'

import { isDev } from '@etherealengine/common/src/config'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { V_000, V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { EngineActions } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import {
  ComponentType,
  defineQuery,
  getComponent,
  getMutableComponent,
  removeComponent,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { InputComponent } from '../input/components/InputComponent'
import { InputSourceComponent } from '../input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '../input/state/ButtonState'
import { InteractState } from '../interaction/systems/InteractiveSystem'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { RigidBodyFixedTagComponent } from '../physics/components/RigidBodyComponent'
import { boxDynamicConfig } from '../physics/functions/physicsObjectDebugFunctions'
import { RendererState } from '../renderer/RendererState'
import { hasMovementControls } from '../xr/XRState'
import { VehicleControllerComponent } from './components/VehicleControllerComponent'

const _quat = new Quaternion()

/**
 * On 'xr-standard' mapping, get thumbstick input [2,3], fallback to thumbpad input [0,1]
 */
export function getThumbstickOrThumbpadAxes(inputSource: XRInputSource, deadZone = 0.05) {
  const axes = inputSource.gamepad!.axes
  const axesIndex = inputSource.gamepad?.mapping === 'xr-standard' ? 2 : 0
  const xAxis = Math.abs(axes[axesIndex]) > deadZone ? axes[axesIndex] : 0
  const zAxis = Math.abs(axes[axesIndex + 1]) > deadZone ? axes[axesIndex + 1] : 0
  return [xAxis, zAxis] as [number, number]
}

export const InputSourceAxesDidReset = new WeakMap<XRInputSource, boolean>()

const onKeyE = () => {
  // exit vehicle
}

const onKeyO = () => {
  dispatchAction(
    WorldNetworkAction.spawnDebugPhysicsObject({
      config: boxDynamicConfig
    })
  )
}

const onKeyP = () => {
  getMutableState(RendererState).debugEnable.set(!getMutableState(RendererState).debugEnable.value)
}

const inputSourceQuery = defineQuery([InputSourceComponent])
const filterUncapturedInputSources = (eid: Entity) => !getComponent(eid, InputSourceComponent)?.captured

const execute = () => {
  const { localClientEntity } = Engine.instance
  if (!localClientEntity) return

  const controller = getComponent(localClientEntity, VehicleControllerComponent)
  const nonCapturedInputSourceEntities = inputSourceQuery().filter(filterUncapturedInputSources)

  for (const inputSourceEntity of nonCapturedInputSourceEntities) {
    const inputSource = getComponent(inputSourceEntity, InputSourceComponent)

    const buttons = inputSource.buttons

    if (buttons.KeyE?.down) onKeyE()

    if (isDev) {
      if (buttons.KeyO?.down) onKeyO()
      if (buttons.KeyP?.down) onKeyP()
    }

    if (!hasMovementControls()) return
    /** keyboard input */
    const keyDeltaX = (buttons.KeyA?.pressed ? -1 : 0) + (buttons.KeyD?.pressed ? 1 : 0)
    const keyDeltaZ =
      (buttons.KeyW?.pressed ? -1 : 0) +
      (buttons.KeyS?.pressed ? 1 : 0) +
      (buttons.ArrowUp?.pressed ? -1 : 0) +
      (buttons.ArrowDown?.pressed ? 1 : 0)

    controller.gamepadLocalInput.set(keyDeltaX, 0, keyDeltaZ)
  }
}

export const AvatarInputSystem = defineSystem({
  uuid: 'ee.engine.VehicleInputSystem',
  execute
})
