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

import { Entity, getComponent, hasComponent } from '@ir-engine/ecs'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { StandardGamepadAxes, XRStandardGamepadAxes } from '@ir-engine/spatial/src/input/state/ButtonState'
import { Assert, Choices, NodeCategory, makeFunctionNodeDefinition } from '@ir-engine/visual-script'

// very 3D specific.
export const getAxis = makeFunctionNodeDefinition({
  typeName: 'engine/axis/get',
  category: NodeCategory.Engine,
  label: 'get Axis',
  in: {
    axis: (_, graphApi) => {
      const choices: Choices = [
        ...Object.keys(StandardGamepadAxes)
          .filter((x) => !(parseInt(x) >= 0))
          .sort()
          .map((value) => ({ text: `gamepad/${value}`, value })),
        ...Object.keys(XRStandardGamepadAxes)
          .filter((x) => !(parseInt(x) >= 0))
          .sort()
          .map((value) => ({ text: `xr-gamepad/${value}`, value }))
      ]
      return {
        valueType: 'integer',
        choices: choices,
        defaultValue: choices[0].value
      }
    },
    deadzone: 'float',
    entity: 'entity'
  },
  out: {
    value: 'float'
  },
  exec: ({ read, write, graph }) => {
    const axisKey = read<number>('axis')
    const deadzone = read<number>('deadzone')
    const entity = Number(read('entity')) as Entity
    Assert.mustBeTrue(hasComponent(entity, InputSourceComponent), 'ERROR: entity does not have Input Source component')
    const inputSource = getComponent(entity, InputSourceComponent)
    Assert.mustBeDefined(inputSource.source.gamepad, 'ERROR: InputSourceComponent does not have gamepad')
    let gamepadAxesValue = inputSource.source.gamepad?.axes[axisKey]
    if (Math.abs(gamepadAxesValue!) < deadzone) gamepadAxesValue = 0
    write('value', gamepadAxesValue)
  }
})
