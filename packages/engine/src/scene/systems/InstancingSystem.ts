import { createActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import {
  defineQuery,
  getComponentState,
  hasComponent,
  removeComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import {
  InstancingComponent,
  InstancingStagingComponent,
  InstancingUnstagingComponent,
  ScatterState
} from '../components/InstancingComponent'
import { SCENE_COMPONENT_VISIBLE } from '../components/VisibleComponent'
import {
  SCENE_COMPONENT_INSTANCING,
  stageInstancing,
  unstageInstancing,
  updateInstancing
} from '../functions/loaders/InstancingFunctions'
import { ScenePrefabs } from './SceneObjectUpdateSystem'

export default async function ScatterSystem(world: World) {
  world.sceneComponentRegistry.set(InstancingComponent.name, SCENE_COMPONENT_INSTANCING)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_INSTANCING, {
    defaultData: {}
  })

  world.scenePrefabRegistry.set(ScenePrefabs.instancing, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_INSTANCING, props: {} }
  ])

  const instancingQuery = defineQuery([InstancingComponent])
  const stagingQuery = defineQuery([InstancingComponent, InstancingStagingComponent])
  const unstagingQuery = defineQuery([InstancingComponent, InstancingUnstagingComponent])
  const engineState = getEngineState()

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  const execute = () => {
    instancingQuery.enter().map(updateInstancing)

    modifyPropertyActionQueue().map((action) =>
      action.entities.filter((entity) => hasComponent(entity, InstancingComponent)).map(updateInstancing)
    )

    for (const entity of stagingQuery.enter()) {
      const executeStaging = () =>
        stageInstancing(entity).then(() => {
          removeComponent(entity, InstancingStagingComponent, world)
          const instancingState = getComponentState(entity, InstancingComponent)
          instancingState.state.set(ScatterState.STAGED)
        })
      if (engineState.sceneLoaded.value) executeStaging()
      else
        matchActionOnce(EngineActions.sceneLoaded.matches, () => {
          executeStaging()
        })
    }

    for (const entity of unstagingQuery.enter()) {
      unstageInstancing(entity)
      removeComponent(entity, InstancingUnstagingComponent, world)
      const instancingState = getComponentState(entity, InstancingComponent)
      instancingState.state.set(ScatterState.UNSTAGED)
    }
  }

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(InstancingComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_INSTANCING)
    world.scenePrefabRegistry.delete(ScenePrefabs.instancing)

    removeQuery(world, instancingQuery)
    removeQuery(world, stagingQuery)
    removeQuery(world, unstagingQuery)

    removeActionQueue(modifyPropertyActionQueue)
  }

  return { execute, cleanup }
}
