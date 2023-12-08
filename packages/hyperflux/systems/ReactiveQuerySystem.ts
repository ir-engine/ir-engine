import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/SystemGroups'
import { HyperFlux } from '../functions/StoreFunctions'

export const ReactiveQuerySystem = defineSystem({
  uuid: 'ee.hyperflux.ReactiveQuerySystem',
  insert: { after: PresentationSystemGroup },
  execute: () => {
    for (const { query, result } of HyperFlux.store.reactiveQueryStates) {
      const entitiesAdded = query.enter().length
      const entitiesRemoved = query.exit().length
      if (entitiesAdded || entitiesRemoved) {
        result.set(query())
      }
    }
  }
})
