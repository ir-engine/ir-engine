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

import { NodeCategory, NodeDefinition, makeEventNodeDefinition, makeFlowNodeDefinition } from '@behave-graph/core'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { isEqual, uniqueId } from 'lodash'
import { Engine } from '../../../../../ecs/classes/Engine'
import { Entity } from '../../../../../ecs/classes/Entity'
import { InputSystemGroup } from '../../../../../ecs/functions/EngineFunctions'
import { SystemUUID, defineSystem } from '../../../../../ecs/functions/SystemFunctions'
import { EnginetoNodetype, NodetoEnginetype, getSocketType } from './commonHelper'

const skipState = [''] // behave graph state is skipped since its a type of record we do want to skip it anyways

export function generateStateNodeSchema(state, withFlow = false) {
  const nodeschema = {}
  const schema = state.get(NO_PROXY)
  if (schema === null) {
    return nodeschema
  }
  if (schema === undefined) {
    return nodeschema
  }
  for (const [name, value] of Object.entries(schema)) {
    const socketValue = getSocketType(name, value)
    if (withFlow) nodeschema[`${name}Change`] = 'flow'
    if (socketValue) nodeschema[name] = socketValue
  }
  return nodeschema
}

export function getStateSetters() {
  const setters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [stateName, state] of Object.entries(Engine.instance.store.stateMap)) {
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const inputsockets = generateStateNodeSchema(state)
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
  for (const [stateName, state] of Object.entries(Engine.instance.store.stateMap)) {
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const outputsockets = generateStateNodeSchema(state)
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
        const props = state
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

type State = {
  systemUUID: SystemUUID
}

const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})

export function getStateListeners() {
  const getters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [stateName, state] of Object.entries(Engine.instance.store.stateMap)) {
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const outputsockets = generateStateNodeSchema(state)
    if (Object.keys(outputsockets).length === 0) {
      skipped.push(stateName)
      continue
    }
    const node = makeEventNodeDefinition({
      typeName: `engine/component/on ${stateName} change`,
      category: NodeCategory.Event,
      label: `on ${stateName} change`,
      in: {
        entity: 'entity'
      },
      out: {
        entity: 'entity',
        ...outputsockets
      },
      initialState: initialState(),
      init: ({ read, write, commit, graph }) => {
        const entity = Number.parseInt(read('entity')) as Entity
        const valueOutputs = Object.entries(node.out)
          .splice(1)
          .filter(([output, type]) => type !== 'flow')
        const flowOutputs = Object.entries(node.out)
          .splice(1)
          .filter(([output, type]) => type === 'flow')

        let prevStateValue = {}
        const systemUUID = defineSystem({
          uuid: `behave-graph-on-${stateName}-change` + uniqueId(),
          insert: { with: InputSystemGroup },
          execute: () => {
            const stateValue = state
            if (typeof stateValue !== 'object') {
              if (prevStateValue === stateValue) return
              const value = EnginetoNodetype(stateValue)
              write(valueOutputs[valueOutputs.length - 1][0] as any, value)
              commit(flowOutputs[flowOutputs.length - 1][0] as any)
              prevStateValue = structuredClone(stateValue)
            } else {
              valueOutputs.forEach(([output, type], index) => {
                if (Object.hasOwn(prevStateValue, output)) {
                  if (isEqual(prevStateValue[output], structuredClone(stateValue[output]))) return
                }
                const value = EnginetoNodetype(stateValue[output])
                write(output as any, value)
                commit(flowOutputs[index][0] as any)
                prevStateValue[output] = structuredClone(stateValue[output])
              })
            }
          }
        })

        write('entity', entity)
        const state: State = {
          systemUUID
        }

        return state
      },
      dispose: ({ state: { systemUUID }, graph: { getDependency } }) => {
        destroySystem(systemUUID)
        return initialState()
      }
    })
    getters.push(node)
  }
  return getters
}
