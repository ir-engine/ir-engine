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

// based on Unreal Engine Blueprint Gate node

import { makeFlowNodeDefinition, NodeCategory } from '../../../VisualScriptModule'

export const Gate = makeFlowNodeDefinition({
  typeName: 'flow/gate',
  label: 'Gate',
  category: NodeCategory.Flow,
  in: {
    flow: 'flow',
    open: 'flow',
    close: 'flow',
    toggle: 'flow',
    startClosed: 'boolean'
  },
  out: {
    flow: 'flow'
  },
  initialState: {
    isInitialized: false,
    isClosed: true
  },
  triggered: ({ commit, read, triggeringSocketName, state }) => {
    let isClosed = state.isClosed
    let isInitialized = state.isInitialized

    if (!state.isInitialized) {
      isClosed = !!read('startClosed')
      isInitialized = true
    }

    switch (triggeringSocketName) {
      case 'flow':
        if (!isClosed) {
          commit('flow')
        }
        break
      case 'open':
        isClosed = false
        break
      case 'close':
        isClosed = true
        break
      case 'toggle':
        isClosed = !isClosed
        break
      default:
        throw new Error(`Unexpected triggering socket: ${triggeringSocketName}`)
    }

    return {
      isClosed,
      isInitialized
    }
  }
})
