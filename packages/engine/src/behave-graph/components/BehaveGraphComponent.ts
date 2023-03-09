import { GraphJSON, Registry } from 'behave-graph'
import matches, { Validator } from 'ts-matches'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'

import { defineComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { RuntimeGraphComponent } from './RuntimeGraphComponent'

export type GraphDomainID = OpaqueType<'GraphDomainID'> & string

export const SCENE_COMPONENT_BEHAVE_GRAPH = 'BehaveGraph'

export const BehaveGraphComponent = defineComponent({
  name: 'EE_behaveGraph',

  onInit: (entity) => {
    return {
      domain: 'ECS' as GraphDomainID,
      graph: {} as GraphJSON
    }
  },

  toJSON: (entity, component) => {
    return {
      domain: component.domain.value,
      graph: component.graph.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    const domainValidator = matches.string as Validator<unknown, GraphDomainID>
    if (domainValidator.test(json.domain)) {
      component.domain.value !== json.domain && component.domain.set(json.domain)
    }
    const graphValidator = matches.object as Validator<unknown, GraphJSON>
    if (graphValidator.test(json.graph)) {
      component.graph.value !== json.graph && component.graph.set(json.graph)
    }
  },

  onRemove: (entity, component) => {
    if (hasComponent(entity, RuntimeGraphComponent)) {
      removeComponent(entity, RuntimeGraphComponent)
    }
  }
})
