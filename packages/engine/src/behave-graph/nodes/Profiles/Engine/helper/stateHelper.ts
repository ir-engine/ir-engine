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
import { Color, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from 'three'
import { Engine } from '../../../../../ecs/classes/Engine'
import { BehaveGraphState } from '../../../../state/BehaveGraphState'
import { EnginetoNodetype, NodetoEnginetype } from './componentHelper'

const skipState = [BehaveGraphState.name]

export function generateStateNodeschema(state) {
  const nodeschema = {}
  const getType = (name, value) => {
    switch (typeof value) {
      case 'number':
        if (name.toLowerCase().includes('entity')) nodeschema[name] = 'entity'
        else {
          nodeschema[name] = 'float'
        }
        // use float
        break
      case 'boolean':
        nodeschema[name] = 'boolean'
        // use boolean
        break
      case 'string':
      case 'undefined':
        nodeschema[name] = 'string'
      case 'object':
        if (value instanceof Vector2) {
          nodeschema[name] = 'vec2'
        } else if (value instanceof Vector3) {
          nodeschema[name] = 'vec3'
        } else if (value instanceof Vector4) {
          nodeschema[name] = 'vec4'
        } else if (value instanceof Quaternion) {
          nodeschema[name] = 'quat'
        } else if (value instanceof Matrix4) {
          nodeschema[name] = 'mat4'
        } else if (value instanceof Matrix3) {
          nodeschema[name] = 'mat3'
        } else if (value instanceof Color) {
          nodeschema[name] = 'color'
        }
        break
      case 'function':
        break
      default: // for objects will handle them later maybe decompose furthur?
        break
      // use string
    }
  }
  console.log('DEBUG', state)
  const schema = state.value
  if (schema === null) {
    return nodeschema
  }
  if (schema === undefined) {
    return nodeschema
  }
  //console.log("DEBUG", component.name )
  for (const [name, value] of Object.entries(schema)) {
    getType(name, value)
  }
  //console.log("DEBUG", nodeschema )
  return nodeschema
}

export function getStateSetters() {
  const setters: NodeDefinition[] = []
  const skipped: string[] = []
  console.log('DEBUG', Object.entries(Engine.instance.store.stateMap))
  for (const [stateName, state] of Object.entries(Engine.instance.store.stateMap)) {
    console.log('DEBUG', stateName, state)
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const inputsockets = generateStateNodeschema(state)
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
        //console.log("DEBUG",inputs)
        for (const [input, type] of inputs) {
          state[input].set(NodetoEnginetype(read(input as any), type))
        }
        console.log('DEBUG after ', state)
        //console.log("DEBUG",values)
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
    const outputsockets = generateStateNodeschema(state)
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
        console.log('DEBUG before ', state)
        if (typeof props !== 'object') {
          console.log(outputs[outputs.length - 1][0], props)
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
