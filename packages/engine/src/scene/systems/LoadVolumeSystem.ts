import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  deserializeLoadVolume,
  serializeLoadVolume,
  updateLoadVolume
} from '@xrengine/engine/src/scene/functions/loaders/LoadVolumeFunctions'
import { createActionQueue } from '@xrengine/hyperflux'

import {
  LoadVolumeComponent,
  SCENE_COMPONENT_LOAD_VOLUME,
  SCENE_COMPONENT_LOAD_VOLUME_DEFAULT_VALUES
} from '../components/LoadVolumeComponent'
import { ScenePrefabs } from './SceneObjectUpdateSystem'

export default async function LoadVolumeSystem(world: World) {
  world.sceneComponentRegistry.set(LoadVolumeComponent._name, SCENE_COMPONENT_LOAD_VOLUME)
  world.scenePrefabRegistry.set(ScenePrefabs.loadVolume, [
    { name: SCENE_COMPONENT_LOAD_VOLUME, props: SCENE_COMPONENT_LOAD_VOLUME_DEFAULT_VALUES }
  ])

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_LOAD_VOLUME, {
    deserialize: deserializeLoadVolume,
    serialize: serializeLoadVolume
  })

  const loadVolumeQuery = defineQuery([LoadVolumeComponent])
  const modifiedQuery = createActionQueue(EngineActions.sceneObjectUpdate.matches)
  const execute = () => {
    for (const entity of loadVolumeQuery.enter()) {
      updateLoadVolume(entity)
    }
    for (const action of modifiedQuery()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, LoadVolumeComponent)) updateLoadVolume(entity)
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
