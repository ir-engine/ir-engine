import { createActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import {
  defineQuery,
  getMutableComponent,
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

export default async function ScatterSystem() {
  Engine.instance.sceneComponentRegistry.set(InstancingComponent.name, SCENE_COMPONENT_INSTANCING)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_INSTANCING, {
    defaultData: {}
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.instancing, [
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
          removeComponent(entity, InstancingStagingComponent)
          const instancingState = getMutableComponent(entity, InstancingComponent)
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
      removeComponent(entity, InstancingUnstagingComponent)
      const instancingState = getMutableComponent(entity, InstancingComponent)
      instancingState.state.set(ScatterState.UNSTAGED)
    }
  }

  const cleanup = async () => {
    Engine.instance.sceneComponentRegistry.delete(InstancingComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_INSTANCING)
    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.instancing)

    removeQuery(instancingQuery)
    removeQuery(stagingQuery)
    removeQuery(unstagingQuery)

    removeActionQueue(modifyPropertyActionQueue)
  }

  return { execute, cleanup }
}
