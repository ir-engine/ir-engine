import { World } from '@etherealengine/engine/src/ecs/classes/World'

import { LoadVolumeComponent, SCENE_COMPONENT_LOAD_VOLUME } from '../components/LoadVolumeComponent'
import { ScenePrefabs } from './SceneObjectUpdateSystem'

export default async function LoadVolumeSystem(world: World) {
  world.sceneComponentRegistry.set(LoadVolumeComponent.name, SCENE_COMPONENT_LOAD_VOLUME)
  world.scenePrefabRegistry.set(ScenePrefabs.loadVolume, [{ name: SCENE_COMPONENT_LOAD_VOLUME, props: {} }])

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_LOAD_VOLUME, {
    defaultData: { targets: {} }
  })

  return {}
}
