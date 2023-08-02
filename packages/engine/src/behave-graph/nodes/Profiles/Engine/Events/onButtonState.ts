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

import { Choices, NodeCategory, makeEventNodeDefinition } from '@behave-graph/core'
import { Query, defineQuery, getComponent, removeQuery } from '../../../../../ecs/functions/ComponentFunctions'
import { InputSystemGroup } from '../../../../../ecs/functions/EngineFunctions'
import { SystemUUID, defineSystem, disableSystem, startSystem } from '../../../../../ecs/functions/SystemFunctions'
import { InputSourceComponent } from '../../../../../input/components/InputSourceComponent'
import {
  ButtonState,
  KeyboardButton,
  MouseButton,
  StandardGamepadButton,
  XRStandardGamepadButton
} from '../../../../../input/state/ButtonState'

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
export const OnButtonState = makeEventNodeDefinition({
  typeName: 'engine/onButtonState',
  category: NodeCategory.Event,
  label: 'On Button State',
  in: {
    button: (_, graphApi) => {
      const choices: Choices = [
        ...Object.keys(KeyboardButton)
          .sort()
          .map((value) => ({ text: `keyboard/${value}`, value })),
        ...Object.keys(MouseButton)
          .sort()
          .map((value) => ({ text: `mouse/${value}`, value })),
        ...Object.keys(StandardGamepadButton)
          .sort()
          .map((value) => ({ text: `gamepad/${value}`, value })),
        ...Object.keys(XRStandardGamepadButton)
          .sort()
          .map((value) => ({ text: `xr-gamepad/${value}`, value }))
      ]
      choices.unshift({ text: 'none', value: null })
      return {
        valueType: 'string',
        choices: choices
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
  init: ({ read, write, commit, graph }) => {
    const buttonKey = read<string>('button')
    const query = defineQuery([InputSourceComponent])
    const systemUUID = defineSystem({
      uuid: 'behave-graph-onButton-' + systemCounter++,
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

    startSystem(systemUUID, { with: InputSystemGroup })

    const state: State = {
      query,
      systemUUID
    }

    return state
  },
  dispose: ({ state: { query, systemUUID }, graph: { getDependency } }) => {
    disableSystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
