import { Engine } from '../../ecs/classes/Engine'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { SCENE_COMPONENT_VISIBLE } from '../components/VisibleComponent'
import { SCENE_COMPONENT_INSTANCING } from '../functions/loaders/InstancingFunctions'
import { ScenePrefabs } from './SceneObjectUpdateSystem'

export default async function ScatterSystem() {
  Engine.instance.sceneComponentRegistry.set(InstancingComponent.name, SCENE_COMPONENT_INSTANCING)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_INSTANCING, {})

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.instancing, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_INSTANCING, props: {} }
  ])

  const execute = () => {}

  const cleanup = async () => {
    Engine.instance.sceneComponentRegistry.delete(InstancingComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_INSTANCING)
    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.instancing)
  }

  return { execute, cleanup }
}
