import { useEffect } from 'react'

import { getMutableState, startReactor, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import { XRState } from '../../xr/XRState'
import { EnvMapBakeComponent, SCENE_COMPONENT_ENVMAP_BAKE } from '../components/EnvMapBakeComponent'
import { EnvmapComponent, SCENE_COMPONENT_ENVMAP } from '../components/EnvmapComponent'
import { SCENE_COMPONENT_SKYBOX, SkyboxComponent } from '../components/SkyboxComponent'
import { SCENE_COMPONENT_VISIBLE } from '../components/VisibleComponent'
import { ScenePrefabs } from './SceneObjectUpdateSystem'

const reactor = () => {
  const background = useHookstate(getMutableState(SceneState).background)
  const sessionMode = useHookstate(getMutableState(XRState).sessionMode)

  useEffect(() => {
    Engine.instance.scene.background = sessionMode.value === 'immersive-ar' ? null : background.value
  }, [background, sessionMode])

  useEffect(() => {
    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.skybox, [
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_SKYBOX, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(SkyboxComponent.name, SCENE_COMPONENT_SKYBOX)
    Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SKYBOX, {})

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.envMapbake, [
      { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_ENVMAP_BAKE, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(EnvMapBakeComponent.name, SCENE_COMPONENT_ENVMAP_BAKE)
    Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP_BAKE, {})

    Engine.instance.sceneComponentRegistry.set(EnvmapComponent.name, SCENE_COMPONENT_ENVMAP)
    Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP, {})

    return () => {
      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.skybox)

      Engine.instance.sceneComponentRegistry.delete(SkyboxComponent.name)
      Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SKYBOX)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.envMapbake)

      Engine.instance.sceneComponentRegistry.delete(EnvMapBakeComponent.name)
      Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_ENVMAP_BAKE)

      Engine.instance.sceneComponentRegistry.delete(EnvmapComponent.name)
      Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_ENVMAP)
    }
  }, [])
  return null
}

export const EnvironmentSystem = defineSystem(
  {
    uuid: 'ee.engine.EnvironmentSystem',
    execute: () => {},
    reactor
  },
  { after: [PresentationSystemGroup] }
)
