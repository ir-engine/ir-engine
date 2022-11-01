import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  deserializeLoadVolume,
  serializeLoadVolume
} from '@xrengine/engine/src/scene/functions/loaders/LoadVolumeFunctions'
import { createActionQueue } from '@xrengine/hyperflux'

import { LoadVolumeComponent, SCENE_COMPONENT_LOAD_VOLUME } from '../components/LoadVolumeComponent'
import { ScenePrefabs } from './SceneObjectUpdateSystem'

export default async function LoadVolumeSystem(world: World) {
  world.sceneComponentRegistry.set(LoadVolumeComponent.name, SCENE_COMPONENT_LOAD_VOLUME)
  world.scenePrefabRegistry.set(ScenePrefabs.loadVolume, [{ name: SCENE_COMPONENT_LOAD_VOLUME, props: {} }])

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_LOAD_VOLUME, {
    defaultData: {},
    deserialize: deserializeLoadVolume,
    serialize: serializeLoadVolume
  })

  return {}
}
