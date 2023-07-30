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

import {
  NodeCategory,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
  makeInNOutFunctionDesc
} from '@behave-graph/core'
import { Entity } from '../../../../../ecs/classes/Entity'
import {
  ComponentMap,
  getComponent,
  removeComponent,
  setComponent
} from '../../../../../ecs/functions/ComponentFunctions'

export const getComponentFromRegistry = makeFunctionNodeDefinition({
  typeName: 'engine/getComponentfromRegistry',
  category: NodeCategory.Query,
  label: 'Get Component',
  in: {
    component: (_, graphApi) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { component: 'string' },
  exec: ({ read, write, graph }) => {
    const ComponentType: any = read('component')
    write('component', ComponentType)
  }
})

export const getComponentFromEntity = makeFunctionNodeDefinition({
  typeName: 'engine/getComponentfromEntity',
  category: NodeCategory.Query,
  label: 'Get Component in entity',
  in: {
    entity: 'entity',
    componentName: (_, graphApi) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { component: 'component' },
  exec: ({ read, write, graph }) => {
    const entity: Entity = read('entity')
    const componentName: string = read('componentName')
    const component = ComponentMap.get(componentName)!
    const componentType = getComponent(entity, component)
    write('component', componentType)
  }
})

export const addComponent = makeFlowNodeDefinition({
  typeName: 'engine/addComponent',
  category: NodeCategory.Action,
  label: 'Add Component',
  in: {
    flow: 'flow',
    entity: 'entity',
    componentName: (_, graphApi) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const entity: Entity = read('entity')
    const componentName: string = read('componentName')
    const component = ComponentMap.get(componentName)!
    setComponent(entity, component)
    write('entity', entity)
    commit('flow')
  }
})

export const deleteComponent = makeFlowNodeDefinition({
  typeName: 'engine/deleteComponent',
  category: NodeCategory.Action,
  label: 'Delete Component',
  in: {
    flow: 'flow',
    entity: 'entity',
    componentName: (_, graphApi) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const entity: Entity = read('entity')
    const componentName: string = read('componentName')
    const component = ComponentMap.get(componentName)!
    removeComponent(entity, component)
    write('entity', entity)
    commit('flow')
  }
})

export const Constant = makeInNOutFunctionDesc({
  name: 'engine/entity',
  label: 'Entity',
  in: ['entity'],
  out: 'entity',
  exec: (a: Entity) => a
})

export const Equal = makeInNOutFunctionDesc({
  name: 'engine/equal/entity',
  label: 'Entity =',
  in: ['entity', 'entity'],
  out: 'boolean',
  exec: (a: Entity, b: Entity) => a === b
})
