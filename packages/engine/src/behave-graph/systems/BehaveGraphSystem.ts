import { ILifecycleEventEmitter, ILogger, Registry } from 'behave-graph'
import { matches, Validator } from 'ts-matches'

import { createActionQueue, defineAction, defineState, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { ScenePrefabs } from '../../scene/systems/SceneObjectUpdateSystem'
import { BehaveGraphComponent, GraphDomainID, SCENE_COMPONENT_BEHAVE_GRAPH } from '../components/BehaveGraphComponent'
import { RuntimeGraphComponent } from '../components/RuntimeGraphComponent'

export type BehaveGraphDomainType = {
  register: (registry: Registry, logger?: ILogger, ticker?: ILifecycleEventEmitter) => void
}

export type BehaveGraphSystemStateType = {
  domains: Record<GraphDomainID, BehaveGraphDomainType>
}

export const BehaveGraphSystemState = defineState({
  name: 'BehaveGraphSystemState',
  initial: {
    domains: {}
  } as BehaveGraphSystemStateType
})

export const BehaveGraphActions = {
  execute: defineAction({
    type: 'BehaveGraph.EXECUTE',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stop: defineAction({
    type: 'BehaveGraph.STOP',
    entity: matches.number as Validator<unknown, Entity>
  })
}

export default async function BehaveGraphSystem() {
  Engine.instance.sceneComponentRegistry.set(BehaveGraphComponent.name, SCENE_COMPONENT_BEHAVE_GRAPH)
  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.behaveGraph, [{ name: SCENE_COMPONENT_BEHAVE_GRAPH, props: {} }])
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_BEHAVE_GRAPH, {
    defaultData: {}
  })

  const graphQuery = defineQuery([BehaveGraphComponent])
  const runtimeQuery = defineQuery([RuntimeGraphComponent])

  const executeQueue = createActionQueue(BehaveGraphActions.execute.matches)
  const stopQueue = createActionQueue(BehaveGraphActions.stop.matches)
  function execute() {
    for (const entity of runtimeQuery.enter()) {
      const runtimeComponent = getComponent(entity, RuntimeGraphComponent)
      runtimeComponent.ticker.startEvent.emit()
      runtimeComponent.engine.executeAllSync()
    }

    for (const entity of runtimeQuery()) {
      const runtimeComponent = getComponent(entity, RuntimeGraphComponent)
      runtimeComponent.ticker.tickEvent.emit()
      runtimeComponent.engine.executeAllSync()
    }

    for (const action of executeQueue()) {
      const entity = action.entity
      if (hasComponent(entity, RuntimeGraphComponent)) {
        removeComponent(entity, RuntimeGraphComponent)
      }
      addComponent(entity, RuntimeGraphComponent)
    }

    for (const action of stopQueue()) {
      const entity = action.entity
      removeComponent(entity, RuntimeGraphComponent)
    }
  }

  async function cleanup() {
    removeQuery(graphQuery)
    removeQuery(runtimeQuery)
    removeActionQueue(executeQueue)
    removeActionQueue(stopQueue)

    Engine.instance.sceneComponentRegistry.delete(BehaveGraphComponent.name)
    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.behaveGraph)
  }

  return { execute, cleanup }
}
