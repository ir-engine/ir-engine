import { Engine } from '../../ecs/classes/Engine'
import { LoadVolumeComponent, SCENE_COMPONENT_LOAD_VOLUME } from '../components/LoadVolumeComponent'
import { ScenePrefabs } from './SceneObjectUpdateSystem'

export default async function LoadVolumeSystem() {
  Engine.instance.sceneComponentRegistry.set(LoadVolumeComponent.name, SCENE_COMPONENT_LOAD_VOLUME)
  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.loadVolume, [{ name: SCENE_COMPONENT_LOAD_VOLUME, props: {} }])

  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_LOAD_VOLUME, {
    defaultData: { targets: {} }
  })

  return {}
}
