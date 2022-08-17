import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState, getEngineState, useEngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import {
  InstancingComponent,
  InstancingComponentType,
  InstancingStagingComponent,
  InstancingUnstagingComponent,
  ScatterState
} from '../components/InstancingComponent'
import { stageInstancing, unstageInstancing } from '../functions/loaders/InstancingFunctions'

export default async function ScatterSystem(world: World) {
  const stagingQuery = defineQuery([InstancingComponent, InstancingStagingComponent])
  const unstagingQuery = defineQuery([InstancingComponent, InstancingUnstagingComponent])
  const engineState = getEngineState()
  return () => {
    for (const entity of stagingQuery.enter()) {
      const executeStaging = () =>
        stageInstancing(entity).then(() => {
          removeComponent(entity, InstancingStagingComponent, world)
        })
      if (engineState.sceneLoaded) executeStaging()
      else
        matchActionOnce(EngineActions.sceneLoaded.matches, () => {
          executeStaging()
        })
    }

    for (const entity of unstagingQuery.enter()) {
      unstageInstancing(entity)
      removeComponent(entity, InstancingUnstagingComponent, world)
    }
  }
}
