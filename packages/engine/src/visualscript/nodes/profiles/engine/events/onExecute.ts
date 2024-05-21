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

import {
  defineSystem,
  destroySystem,
  ECSState,
  InputSystemGroup,
  SystemDefinitions,
  SystemUUID
} from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { makeEventNodeDefinition, NodeCategory } from '@etherealengine/visual-script'

let onExecuteSystemCounter = 0
const onExecuteSystemUUID = 'visual-script-onExecute-'
export const getOnExecuteSystemUUID = () => (onExecuteSystemUUID + onExecuteSystemCounter) as SystemUUID
type State = {
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})

// very 3D specific.
export const OnExecute = makeEventNodeDefinition({
  typeName: 'flow/lifecycle/onExecute',
  category: NodeCategory.Event,
  label: 'On Execute',
  in: {
    system: (_, graphApi) => {
      const systemDefinitions = Array.from(SystemDefinitions.keys()).map((key) => key as string)
      const groups = systemDefinitions.filter((key) => key.includes('group')).sort()
      const nonGroups = systemDefinitions.filter((key) => !key.includes('group')).sort()
      const choices = [...groups, ...nonGroups]
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: InputSystemGroup
      }
    }
  },

  out: {
    flow: 'flow',
    delta: 'float'
  },
  initialState: initialState(),
  init: ({ read, write, commit, graph, configuration }) => {
    const system = read<SystemUUID>('system')
    onExecuteSystemCounter++
    const visualScriptOnExecuteSystem = defineSystem({
      uuid: getOnExecuteSystemUUID(),
      insert: { with: system },
      execute: () => {
        commit('flow')
        write('delta', getState(ECSState).deltaSeconds)
      }
    })

    const state: State = {
      systemUUID: visualScriptOnExecuteSystem
    }

    return state
  },
  dispose: ({ state: { systemUUID }, graph: { getDependency } }) => {
    destroySystem(systemUUID)
    return initialState()
  }
})
