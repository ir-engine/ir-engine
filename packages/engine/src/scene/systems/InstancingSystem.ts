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
import { Object3DComponent } from '../components/Object3DComponent'
import { stageInstancing, unstageInstancing } from '../functions/loaders/InstancingFunctions'

export default async function ScatterSystem(world: World) {
  const scatterQuery = defineQuery([InstancingComponent])
  const stagingQuery = defineQuery([Object3DComponent, InstancingComponent, InstancingStagingComponent])
  const unstagingQuery = defineQuery([Object3DComponent, InstancingComponent, InstancingUnstagingComponent])
  return () => {
    for (const entity of stagingQuery.enter()) {
      stageInstancing(entity).then(() => {
        removeComponent(entity, InstancingStagingComponent, world)
      })
    }

    for (const entity of unstagingQuery.enter()) {
      unstageInstancing(entity)
      removeComponent(entity, InstancingUnstagingComponent, world)
    }
  }
}
