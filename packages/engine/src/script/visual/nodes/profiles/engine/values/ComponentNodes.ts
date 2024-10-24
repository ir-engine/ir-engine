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

import { ComponentMap, defineComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { Assert, NodeCategory, makeFlowNodeDefinition } from '@ir-engine/visual-script'

export const addComponent = makeFlowNodeDefinition({
  typeName: 'engine/component/addComponent',
  category: NodeCategory.Engine,
  label: 'Add Component',
  in: {
    flow: 'flow',
    entity: 'entity',
    componentName: (_) => {
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
  triggered: ({ read, write, commit }) => {
    const entity = Number.parseInt(read('entity')) as Entity
    const componentName = read<string>('componentName')
    const component = ComponentMap.get(componentName)!
    setComponent(entity, component)
    write('entity', entity)
    commit('flow')
  }
})

export const deleteComponent = makeFlowNodeDefinition({
  typeName: 'engine/component/deleteComponent',
  category: NodeCategory.Engine,
  label: 'Delete Component',
  in: {
    flow: 'flow',
    entity: 'entity',
    componentName: (_) => {
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
  triggered: ({ read, write, commit }) => {
    const entity = Number.parseInt(read('entity')) as Entity
    const componentName = read<string>('componentName')
    const component = ComponentMap.get(componentName)!
    removeComponent(entity, component)
    write('entity', entity)
    commit('flow')
  }
})

export const setTag = makeFlowNodeDefinition({
  typeName: 'engine/component/tag/set',
  category: NodeCategory.Engine,
  label: 'set Tag',
  in: {
    flow: 'flow',
    entity: 'entity',
    tagName: 'string'
  },
  out: { flow: 'flow', entity: 'entity', tagName: 'string' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const entity = Number.parseInt(read('entity')) as Entity
    const tagName = read<string>('tagName')
    const tag = defineComponent({ name: `bg-tag.${tagName}` })

    setComponent(entity, tag)

    write('entity', entity)
    write('tagName', tagName)
    commit('flow')
  }
})

export const removeTag = makeFlowNodeDefinition({
  typeName: 'engine/component/tag/remove',
  category: NodeCategory.Engine,
  label: 'remove Tag',
  in: {
    flow: 'flow',
    entity: 'entity',
    tagName: 'string'
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const entity = Number.parseInt(read('entity')) as Entity
    const tagName = `bg-tag.${read<string>('tagName')}`
    const component = ComponentMap.get(tagName)!
    Assert.mustBeDefined(component, `Component ${tagName} does not exist`)
    removeComponent(entity, component)
    write('entity', entity)
    commit('flow')
  }
})
