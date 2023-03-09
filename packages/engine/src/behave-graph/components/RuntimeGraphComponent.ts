import {
  DefaultLogger,
  Engine,
  ManualLifecycleEventEmitter,
  readGraphFromJSON,
  registerCoreProfile,
  Registry
} from 'behave-graph'

import { getMutableState } from '@etherealengine/hyperflux'

import { defineComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { BehaveGraphSystemState } from '../systems/BehaveGraphSystem'
import { BehaveGraphComponent } from './BehaveGraphComponent'

export const RuntimeGraphComponent = defineComponent({
  name: 'EE_runtimeGraph',

  onInit: (entity) => {
    const graphComponent = getComponent(entity, BehaveGraphComponent)
    const registry = new Registry()
    const logger = new DefaultLogger()
    const ticker = new ManualLifecycleEventEmitter()
    registerCoreProfile(registry, logger, ticker)
    const systemState = getMutableState(BehaveGraphSystemState)
    systemState.domains[graphComponent.domain]?.value.register(registry, logger, ticker)
    const graph = readGraphFromJSON(graphComponent.graph, registry)
    const engine = new Engine(graph)
    return { engine, ticker }
  },

  onRemove: (entity, component) => {
    component.engine.value.dispose()
  }
})
