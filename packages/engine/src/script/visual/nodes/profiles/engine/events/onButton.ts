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
import { defineQuery, Query, removeQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem, destroySystem, SystemUUID } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import {
  ButtonState,
  KeyboardButton,
  MouseButton,
  StandardGamepadButton,
  XRStandardGamepadButton
} from '@ir-engine/spatial/src/input/state/ButtonState'
import { Choices, makeEventNodeDefinition, NodeCategory } from '@ir-engine/visual-script'

let systemCounter = 0

type State = {
  query: Query
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  query: undefined!,
  systemUUID: '' as SystemUUID
})

// very 3D specific.
const buttonStates = ['down', 'pressed', 'touched', 'up'] as Array<keyof ButtonState>
export const OnButton = makeEventNodeDefinition({
  typeName: 'engine/onButton',
  category: NodeCategory.Engine,
  label: 'On Button',
  in: {
    button: (_) => {
      const choices: Choices = [
        ...Object.keys(KeyboardButton)
          .filter((x) => !(parseInt(x) >= 0))
          .sort()
          .map((value) => ({ text: `keyboard/${value}`, value })),
        ...Object.keys(MouseButton)
          .filter((x) => !(parseInt(x) >= 0))
          .sort()
          .map((value) => ({ text: `mouse/${value}`, value })),
        ...Object.keys(StandardGamepadButton)
          .filter((x) => !(parseInt(x) >= 0))
          .sort()
          .map((value) => ({ text: `gamepad/${value}`, value })),
        ...Object.keys(XRStandardGamepadButton)
          .filter((x) => !(parseInt(x) >= 0))
          .sort()
          .map((value) => ({ text: `xr-gamepad/${value}`, value }))
      ]
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: MouseButton.PrimaryClick
      }
    }
  },
  out: {
    ...buttonStates.reduce(
      (acc, element) => ({ ...acc, [`${element.charAt(0).toUpperCase()}${element.slice(1)}`]: 'flow' }),
      {}
    ),
    value: 'float'
  },
  initialState: initialState(),
  init: ({ read, write, commit }) => {
    const buttonKey = read<string>('button')
    const query = defineQuery([InputSourceComponent])
    const systemUUID = defineSystem({
      uuid: 'visual-script-onButton-' + systemCounter++,
      insert: { with: InputSystemGroup },
      execute: () => {
        for (const eid of query()) {
          const inputSource = getComponent(eid, InputSourceComponent)
          const button = inputSource.buttons[buttonKey]
          buttonStates.forEach((state) => {
            if (button?.[state] === true) {
              const outputSocket = `${state.charAt(0).toUpperCase()}${state.slice(1)}`
              commit(outputSocket as any)
            }
          })
          write('value', button?.value ?? 0)
        }
      }
    })

    const state: State = {
      query,
      systemUUID
    }

    return state
  },
  dispose: ({ state: { query, systemUUID } }) => {
    destroySystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
