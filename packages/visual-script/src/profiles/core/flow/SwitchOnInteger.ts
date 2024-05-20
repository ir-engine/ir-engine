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

// https://docs.unrealengine.com/4.27/en-US/ProgrammingAndScripting/Blueprints/UserGuide/flow/

import { makeFlowNodeDefinition, sequence, SocketsList } from '../../../VisualScriptModule'

export const SwitchOnInteger = makeFlowNodeDefinition({
  typeName: 'flow/decision/switch/integer',
  label: 'Switch on Int',
  configuration: {
    numCases: {
      valueType: 'number'
    }
  },
  in: (configuration) => {
    const sockets: SocketsList = []

    sockets.push({ key: 'flow', valueType: 'flow' }, { key: 'selection', valueType: 'integer' })

    for (const index of sequence(1, configuration.numCases + 1)) {
      sockets.push({ key: `${index}`, valueType: 'integer' })
    }

    return sockets
  },
  out: (configuration) => {
    const sockets: SocketsList = []

    sockets.push({ key: 'default', valueType: 'flow' })
    for (const index of sequence(1, configuration.numCases + 1)) {
      sockets.push({ key: `${index}`, valueType: 'flow' })
    }

    return sockets
  },
  initialState: undefined,
  triggered: ({ read, commit, configuration }) => {
    const selection = read<bigint>('selection')
    for (const index of sequence(1, configuration.numCases + 1)) {
      if (selection === read<bigint>(`${index}`)) {
        commit(`${index}`)
        return
      }
    }
    commit('default')
  }
})
