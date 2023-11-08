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

import { NodeCategory, makeEventNodeDefinition } from '@behave-graph/core'
import { InputSystemGroup } from '../../../../../ecs/functions/EngineFunctions'
import {
  SystemDefinitions,
  SystemUUID,
  defineSystem,
  disableSystem,
  startSystem
} from '../../../../../ecs/functions/SystemFunctions'

let systemCounter = 0

type State = {
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})

// very 3D specific.
export const OnExecute = makeEventNodeDefinition({
  typeName: 'engine/OnExecute',
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
    flow: 'flow'
  },
  initialState: initialState(),
  init: ({ read, write, commit, graph, configuration }) => {
    const system = read<SystemUUID>('system')

    const systemUUID = defineSystem({
      uuid: 'behave-graph-onExecute-' + systemCounter++,
      execute: () => {
        commit('flow')
      }
    })
    startSystem(systemUUID, { with: system })
    const state: State = {
      systemUUID
    }

    return state
  },
  dispose: ({ state: { systemUUID }, graph: { getDependency } }) => {
    disableSystem(systemUUID)
    return initialState()
  }
})
