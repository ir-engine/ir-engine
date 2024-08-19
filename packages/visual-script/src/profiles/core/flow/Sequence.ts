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

// https://docs.unrealengine.com/4.27/en-US/ProgrammingAndScripting/Blueprints/UserGuide/flow/

import { makeFlowNodeDefinition, SocketsList } from '../../../VisualScriptModule'

export const Sequence = makeFlowNodeDefinition({
  typeName: 'flow/decision/sequence',
  label: 'Sequence',
  configuration: {
    numOutputs: {
      valueType: 'number',
      defaultValue: 4
    }
  },
  in: {
    flow: 'flow'
  },
  out: (configuration) => {
    const numOutputs = configuration.numOutputs ?? 4
    const sockets: SocketsList = []

    for (let outputIndex = 1; outputIndex <= numOutputs; outputIndex++) {
      const key = `${outputIndex}`

      sockets.push({
        key,
        valueType: 'flow'
      })
    }

    return sockets
  },
  initialState: undefined,
  triggered: ({ commit, outputSocketKeys }) => {
    // these outputs are fired sequentially in an sync fashion but without delays.
    // Thus a promise is returned and it continually returns a promise until each of the sequences has been executed.
    const sequenceIteration = (i: number) => {
      if (i < outputSocketKeys.length) {
        const outputKey = outputSocketKeys[i]
        // const outputSocket = this.outputs[i];
        commit(outputKey, () => {
          sequenceIteration(i + 1)
        })
      }
    }
    sequenceIteration(0)
  }
})
