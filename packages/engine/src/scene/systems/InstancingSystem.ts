import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import {
  InstancingComponent,
  InstancingComponentType,
  InstancingStagingComponent,
  InstancingUnstagingComponent,
  ScatterState
} from '../components/InstancingComponent'
import { stageInstancing, unstageInstancing } from '../functions/loaders/InstancingFunctions'

export default async function ScatterSystem(world: World) {
  const scatterQuery = defineQuery([InstancingComponent])
  const stagingQuery = defineQuery([InstancingComponent, InstancingStagingComponent])
  const unstagingQuery = defineQuery([InstancingComponent, InstancingUnstagingComponent])
  return () => {
    stagingQuery.enter().forEach((entity) => {
      stageInstancing(entity).then(() => {
        removeComponent(entity, InstancingStagingComponent, world)
      })
    })

    unstagingQuery.enter().forEach((entity) => {
      unstageInstancing(entity)
      removeComponent(entity, InstancingUnstagingComponent, world)
    })
  }
}
