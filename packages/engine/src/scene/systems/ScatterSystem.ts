import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import {
  ScatterComponent,
  ScatterComponentType,
  ScatterStagingComponent,
  ScatterState,
  ScatterUnstagingComponent
} from '../components/ScatterComponent'
import { stageScatter, unstageScatter } from '../functions/loaders/ScatterFunctions'

export default async function ScatterSystem(world: World) {
  const scatterQuery = defineQuery([ScatterComponent])
  const stagingQuery = defineQuery([ScatterComponent, ScatterStagingComponent])
  const unstagingQuery = defineQuery([ScatterComponent, ScatterUnstagingComponent])
  return () => {
    stagingQuery.enter().forEach((entity) => {
      stageScatter(entity).then(() => {
        removeComponent(entity, ScatterStagingComponent, world)
      })
    })

    unstagingQuery.enter().forEach((entity) => {
      unstageScatter(entity)
      removeComponent(entity, ScatterUnstagingComponent, world)
    })
  }
}
