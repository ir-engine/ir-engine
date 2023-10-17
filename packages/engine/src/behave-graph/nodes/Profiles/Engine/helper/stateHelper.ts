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

import { NodeCategory, NodeDefinition, makeFlowNodeDefinition } from '@behave-graph/core'
import { StateDefinition, StateDefinitions } from '@etherealengine/hyperflux'
import { Engine } from '../../../../../ecs/classes/Engine'
import { EnginetoNodetype, NodetoEnginetype, getSocketType } from './commonHelper'

const skipState = [''] // behave graph state is skipped since its a type of record we do want to skip it anyways

export function generateStateNodeSchema(stateDefinition: StateDefinition<any>) {
  const nodeschema = {}

  const schema =
    typeof stateDefinition.initial === 'function'
      ? (stateDefinition.initial as any)()
      : JSON.parse(JSON.stringify(stateDefinition.initial))

  if (schema === null) {
    return nodeschema
  }
  if (schema === undefined) {
    return nodeschema
  }
  for (const [name, value] of Object.entries(schema)) {
    const socketValue = getSocketType(name, value)
    if (socketValue) nodeschema[name] = socketValue
  }
  return nodeschema
}

export function getStateSetters() {
  const setters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [stateName, stateDefinition] of StateDefinitions) {
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const inputsockets = generateStateNodeSchema(stateDefinition)
    if (Object.keys(inputsockets).length === 0) {
      skipped.push(stateName)
      continue
    }
    const node = makeFlowNodeDefinition({
      typeName: `engine/state/set${stateName}`,
      category: NodeCategory.Action,
      label: `set ${stateName}`,
      in: {
        flow: 'flow',
        ...inputsockets
      },
      out: { flow: 'flow' },
      initialState: undefined,
      triggered: ({ read, write, commit, graph }) => {
        //read from the read and set dict acccordingly
        const inputs = Object.entries(node.in).splice(1)
        const state = Engine.instance.store.stateMap[stateName]
        for (const [input, type] of inputs) {
          state[input].set(NodetoEnginetype(read(input as any), type))
        }
        commit('flow')
      }
    })
    setters.push(node)
  }
  return setters
}

export function getStateGetters() {
  const getters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [stateName, stateDefinition] of StateDefinitions) {
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const outputsockets = generateStateNodeSchema(stateDefinition)
    if (Object.keys(outputsockets).length === 0) {
      skipped.push(stateName)
      continue
    }
    const node = makeFlowNodeDefinition({
      typeName: `engine/state/get${stateName}`,
      category: NodeCategory.Query,
      label: `get ${stateName}`,
      in: {
        flow: 'flow'
      },
      out: {
        flow: 'flow',
        ...outputsockets
      },
      initialState: undefined,
      triggered: ({ read, write, commit, graph }) => {
        const outputs = Object.entries(node.out).splice(1)
        const props = Engine.instance.store.stateMap[stateName]
        if (typeof props !== 'object') {
          write(outputs[outputs.length - 1][0] as any, EnginetoNodetype(props))
        } else {
          for (const [output, type] of outputs) {
            write(output as any, EnginetoNodetype(props[output].value))
          }
        }
        commit('flow')
      }
    })
    getters.push(node)
  }
  return getters
}
