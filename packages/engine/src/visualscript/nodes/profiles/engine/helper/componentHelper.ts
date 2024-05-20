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

import { uniqueId } from 'lodash'
import { useEffect } from 'react'

import {
  Component,
  ComponentMap,
  getComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { defineSystem, destroySystem, SystemUUID } from '@etherealengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import {
  makeEventNodeDefinition,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
  NodeCategory,
  NodeDefinition
} from '@etherealengine/visual-script'

import { EnginetoNodetype, getSocketType, NodetoEnginetype } from './commonHelper'

const skipComponents = [
  TransformComponent.name, // already implemented
  'PostProcessingComponent', //needs special attention
  'AvatarAnimationComponent' // needs special attention
]

const listenerSkipComponents = [
  ...skipComponents, // needs special attention
  NameComponent.name // use component is broken
]

export function generateComponentNodeSchema(component: Component, withFlow = false) {
  const nodeschema = {}
  if (skipComponents.includes(component.name)) return nodeschema
  const schema = component?.onInit(UndefinedEntity)
  if (schema === null) {
    return nodeschema
  }
  if (schema === undefined) {
    return nodeschema
  }
  if (typeof schema !== 'object') {
    const name = component.name.replace('Component', '')
    const socketValue = getSocketType(name, schema)
    if (withFlow) nodeschema[`${name}Change`] = 'flow'
    if (socketValue) nodeschema[name] = socketValue
    return nodeschema
  }
  for (const [name, value] of Object.entries(schema)) {
    const socketValue = getSocketType(name, value)
    if (withFlow) nodeschema[`${name}Change`] = 'flow'
    if (socketValue) nodeschema[name] = socketValue
  }
  return nodeschema
}

export function registerComponentSetters() {
  const setters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [componentName, component] of ComponentMap) {
    if (skipComponents.includes(componentName)) {
      skipped.push(componentName)
      continue
    }
    const inputsockets = generateComponentNodeSchema(component)
    if (Object.keys(inputsockets).length === 0) {
      skipped.push(componentName)
      continue
    }
    const node = makeFlowNodeDefinition({
      typeName: `engine/component/${componentName}/set`,
      category: NodeCategory.Action,
      label: `set ${componentName}`,
      in: {
        flow: 'flow',
        entity: 'entity',
        ...inputsockets
      },
      out: { flow: 'flow', entity: 'entity' },
      initialState: undefined,
      triggered: ({ read, write, commit }) => {
        const entity = Number.parseInt(read('entity')) as Entity
        const inputs = Object.entries(node.in).splice(2)
        let values = {} as any
        if (inputs.length === 1) {
          values = NodetoEnginetype(read(inputs[0][0] as any), inputs[0][1])
        } else {
          for (const [input, type] of inputs) {
            values[input] = NodetoEnginetype(read(input as any), type)
          }
        }
        setComponent(entity, component, values)
        write('entity', entity)
        commit('flow')
      }
    })
    setters.push(node)
  }
  return setters
}

export function registerComponentGetters() {
  const getters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [componentName, component] of ComponentMap) {
    if (skipComponents.includes(componentName)) {
      skipped.push(componentName)
      continue
    }
    const outputsockets = generateComponentNodeSchema(component)
    if (Object.keys(outputsockets).length === 0) {
      skipped.push(componentName)
      continue
    }
    const node = makeFunctionNodeDefinition({
      typeName: `engine/component/${componentName}/get`,
      category: NodeCategory.Query,
      label: `get ${componentName}`,
      in: {
        entity: 'entity'
      },
      out: {
        entity: 'entity',
        ...outputsockets
      },
      exec: ({ read, write, graph }) => {
        const entity = Number.parseInt(read('entity')) as Entity

        const props = getComponent(entity, component)
        const outputs = Object.entries(node.out).splice(1)
        if (typeof props !== 'object') {
          write(outputs[outputs.length - 1][0] as any, EnginetoNodetype(props))
        } else {
          for (const [output, type] of outputs) {
            write(output as any, EnginetoNodetype(props[output]))
          }
        }
        write('entity', entity)
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

export function registerComponentListeners() {
  const getters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [componentName, component] of ComponentMap) {
    if (listenerSkipComponents.includes(componentName)) {
      skipped.push(componentName)
      continue
    }
    const outputsockets = generateComponentNodeSchema(component, true)
    if (Object.keys(outputsockets).length === 0) {
      skipped.push(componentName)
      continue
    }

    const node = makeEventNodeDefinition({
      typeName: `engine/component/${componentName}/use`,
      category: NodeCategory.Event,
      label: `use ${componentName}`,
      in: {
        entity: 'entity'
      },
      out: {
        entity: 'entity',
        ...outputsockets
      },
      initialState: initialState(),
      init: ({ read, write, commit }) => {
        const entity = Number.parseInt(read('entity')) as Entity
        const valueOutputs: any = Object.entries(node.out)
          .splice(1)
          .filter(([output, type]) => type !== 'flow')
        const flowOutputs: any = Object.entries(node.out)
          .splice(1)
          .filter(([output, type]) => type === 'flow')

        const systemUUID = defineSystem({
          uuid: `visual-script-use-${componentName}` + uniqueId(),
          insert: { with: InputSystemGroup },
          execute: () => {},
          reactor: () => {
            const componentValue = useComponent(entity, component)
            if (typeof componentValue !== 'object') {
              useEffect(() => {
                const value = EnginetoNodetype((componentValue as any).value)
                write(valueOutputs[valueOutputs.length - 1][0] as any, value)
                commit(flowOutputs[flowOutputs.length - 1][0] as any)
              }, [componentValue])
            } else {
              valueOutputs.forEach(([output, type], index) => {
                useEffect(() => {
                  const value = EnginetoNodetype(componentValue[output].value)
                  const flowSocket = flowOutputs.find(([flowOutput, flowType]) => flowOutput === `${output}Change`)
                  write(output as any, value)
                  commit(flowSocket[0] as any)
                }, [componentValue[output]])
              })
            }
            return null
          }
        })

        write('entity', entity)
        const state: State = {
          systemUUID
        }

        return state
      },
      dispose: ({ state: { systemUUID } }) => {
        destroySystem(systemUUID)
        return initialState()
      }
    })
    getters.push(node)
  }
  return getters
}
