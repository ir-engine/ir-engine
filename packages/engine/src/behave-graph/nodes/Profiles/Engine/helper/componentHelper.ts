import { NodeCategory, NodeDefinition, makeFlowNodeDefinition } from '@behave-graph/core'
import { Entity, UndefinedEntity } from '../../../../../ecs/classes/Entity'
import { Component, ComponentMap, setComponent } from '../../../../../ecs/functions/ComponentFunctions'

export function generateComponentNodeschema(component: Component) {
  const schema = component.onInit(UndefinedEntity)
  const nodeschema = {}
  for (const [name, value] of schema) {
    switch (typeof value) {
      case 'number':
        nodeschema[name] = 'float'
        // use float
        break
      case 'boolean':
        nodeschema[name] = 'boolean'
        // use boolean
        break
      case 'string':
        nodeschema[name] = 'string'
        // use boolean
        break
      default: // for objects will handle them later maybe decompose furthur?
        // skip for now
        break
      // use string
    }
  }
  return nodeschema
}

export function getComponentSetters() {
  const setters: NodeDefinition[] = []
  for (const [componentName, component] of ComponentMap) {
    const node = makeFlowNodeDefinition({
      typeName: `engine/component/set${componentName}`,
      category: NodeCategory.Action,
      label: 'Add Component',
      in: {
        flow: 'flow',
        entity: 'entity',
        ...generateComponentNodeschema(component)
      },
      out: { flow: 'flow', entity: 'entity' },
      initialState: undefined,
      triggered: ({ read, write, commit, graph }) => {
        const entity = Number.parseInt(read('entity')) as Entity
        //read from the read and set dict acccordingly
        const values = {}

        setComponent(entity, component, values)
        write('entity', entity)
        commit('flow')
      }
    })
    setters.push(node)
  }
  return setters
}
