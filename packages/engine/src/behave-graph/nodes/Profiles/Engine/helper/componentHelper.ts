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

import { NodeCategory, NodeDefinition, makeFlowNodeDefinition, makeFunctionNodeDefinition } from '@behave-graph/core'
import { AvatarAnimationComponent } from '../../../../../avatar/components/AvatarAnimationComponent'
import { Entity, UndefinedEntity } from '../../../../../ecs/classes/Entity'
import { Component, ComponentMap, getComponent, setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { PostProcessingComponent } from '../../../../../scene/components/PostProcessingComponent'
import { TransformComponent } from '../../../../../transform/components/TransformComponent'
import { EnginetoNodetype, NodetoEnginetype, getSocketType } from './commonHelper'

const skipComponents = [
  TransformComponent.name, // already implemented
  PostProcessingComponent.name, //needs special attention
  AvatarAnimationComponent.name // needs special attention
]

export function generateComponentNodeSchema(component: Component) {
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
    if (socketValue) nodeschema[name] = socketValue
    return nodeschema
  }
  for (const [name, value] of Object.entries(schema)) {
    const socketValue = getSocketType(name, value)
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
        const values = {}
        for (const [input, type] of inputs) {
          values[input] = NodetoEnginetype(read(input as any), type)
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
    const node = makeFunctionNodeDefinition({
      typeName: `engine/component/get${componentName}`,
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
        const outputs = Object.entries(node.out).splice(2)
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
