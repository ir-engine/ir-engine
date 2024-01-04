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
import { isEqual, uniqueId } from 'lodash'
import { AvatarAnimationComponent } from '../../../../../avatar/components/AvatarAnimationComponent'
import { Entity, UndefinedEntity } from '../../../../../ecs/classes/Entity'
import { Component, ComponentMap, getComponent, setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { InputSystemGroup } from '../../../../../ecs/functions/EngineFunctions'
import { SystemUUID, defineSystem, destroySystem } from '../../../../../ecs/functions/SystemFunctions'
import { PostProcessingComponent } from '../../../../../scene/components/PostProcessingComponent'
import { TransformComponent } from '../../../../../transform/components/TransformComponent'
import { EnginetoNodetype, NodetoEnginetype, getSocketType } from './commonHelper'

const skipComponents = [
  TransformComponent.name, // already implemented
  PostProcessingComponent.name, //needs special attention
  AvatarAnimationComponent.name // needs special attention
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

export function getComponentSetters() {
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
      typeName: `engine/component/set${componentName}`,
      category: NodeCategory.Action,
      label: `set ${componentName}`,
      in: {
        flow: 'flow',
        entity: 'entity',
        ...inputsockets
      },
      out: { flow: 'flow', entity: 'entity' },
      initialState: undefined,
      triggered: ({ read, write, commit, graph }) => {
        const entity = Number.parseInt(read('entity')) as Entity
        //read from the read and set dict acccordingly
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

export function getComponentGetters() {
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
    const node = makeFlowNodeDefinition({
      typeName: `engine/component/get${componentName}`,
      category: NodeCategory.Query,
      label: `get ${componentName}`,
      in: {
        flow: 'flow',
        entity: 'entity'
      },
      out: {
        flow: 'flow',
        entity: 'entity',
        ...outputsockets
      },
      initialState: undefined,
      triggered: ({ read, write, commit, graph }) => {
        const entity = Number.parseInt(read('entity')) as Entity
        const props = getComponent(entity, component)
        const outputs = Object.entries(node.out).splice(2)
        if (typeof props !== 'object') {
          write(outputs[outputs.length - 1][0] as any, EnginetoNodetype(props))
        } else {
          for (const [output, type] of outputs) {
            write(output as any, EnginetoNodetype(props[output]))
          }
        }
        write('entity', entity)
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

export function getComponentListeners() {
  const getters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [componentName, component] of ComponentMap) {
    if (skipComponents.includes(componentName)) {
      skipped.push(componentName)
      continue
    }
    const outputsockets = generateComponentNodeSchema(component, true)
    if (Object.keys(outputsockets).length === 0) {
      skipped.push(componentName)
      continue
    }

    const node = makeEventNodeDefinition({
      typeName: `engine/component/on ${componentName} change`,
      category: NodeCategory.Event,
      label: `on ${componentName} change`,
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

        let prevComponentValue = {}
        const systemUUID = defineSystem({
          uuid: `behave-graph-on-${componentName}-change` + uniqueId(),
          insert: { with: InputSystemGroup },
          execute: () => {
            const componentValue = getComponent(entity, component)
            if (typeof componentValue !== 'object') {
              if (prevComponentValue === componentValue) return
              const value = EnginetoNodetype(componentValue)
              write(valueOutputs[valueOutputs.length - 1][0] as any, value)
              commit(flowOutputs[flowOutputs.length - 1][0] as any)
              prevComponentValue = componentValue
            } else {
              valueOutputs.forEach(([output, type], index) => {
                if (Object.hasOwn(prevComponentValue, output)) {
                  if (isEqual(prevComponentValue[output], componentValue[output])) return
                }
                const value = EnginetoNodetype(componentValue[output])
                write(output as any, value)
                commit(flowOutputs[index][0] as any)
                prevComponentValue[output] = componentValue[output]
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
