import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  TransformComponent
} from '../../transform/components/TransformComponent'
import { AmbientLightComponent, SCENE_COMPONENT_AMBIENT_LIGHT } from '../components/AmbientLightComponent'
import { DirectionalLightComponent, SCENE_COMPONENT_DIRECTIONAL_LIGHT } from '../components/DirectionalLightComponent'
import { HemisphereLightComponent, SCENE_COMPONENT_HEMISPHERE_LIGHT } from '../components/HemisphereLightComponent'
import { PointLightComponent, SCENE_COMPONENT_POINT_LIGHT } from '../components/PointLightComponent'
import { SelectTagComponent } from '../components/SelectTagComponent'
import { SCENE_COMPONENT_SPOT_LIGHT, SpotLightComponent } from '../components/SpotLightComponent'
import { SCENE_COMPONENT_VISIBLE } from '../components/VisibleComponent'

export const LightPrefabs = {
  directionalLight: 'Directional Light' as const,
  hemisphereLight: 'Hemisphere Light' as const,
  ambientLight: 'Ambient Light' as const,
  pointLight: 'Point Light' as const,
  spotLight: 'Spot Light' as const
}

export default async function LightSystem(world: World) {
  world.sceneComponentRegistry.set(DirectionalLightComponent.name, SCENE_COMPONENT_DIRECTIONAL_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DIRECTIONAL_LIGHT, {
    defaultData: {}
  })

  world.sceneComponentRegistry.set(HemisphereLightComponent.name, SCENE_COMPONENT_HEMISPHERE_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_HEMISPHERE_LIGHT, {
    defaultData: {}
  })

  world.sceneComponentRegistry.set(AmbientLightComponent.name, SCENE_COMPONENT_AMBIENT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AMBIENT_LIGHT, {
    defaultData: {}
  })

  world.sceneComponentRegistry.set(PointLightComponent.name, SCENE_COMPONENT_POINT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POINT_LIGHT, {
    defaultData: {}
  })

  world.sceneComponentRegistry.set(SpotLightComponent.name, SCENE_COMPONENT_SPOT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPOT_LIGHT, {
    defaultData: {}
  })

  world.scenePrefabRegistry.set(LightPrefabs.directionalLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_DIRECTIONAL_LIGHT, props: {} }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.hemisphereLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_HEMISPHERE_LIGHT, props: {} }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.ambientLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_AMBIENT_LIGHT, props: {} }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.pointLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_POINT_LIGHT, props: {} }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.spotLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SPOT_LIGHT, props: {} }
  ])

  const directionalLightSelectQuery = defineQuery([TransformComponent, DirectionalLightComponent, SelectTagComponent])

  const execute = () => {
    for (const entity of directionalLightSelectQuery()) {
      const helper = getComponent(entity, DirectionalLightComponent)?.helper
      if (helper) helper.update()
      // light.cameraHelper.update()
    }
  }

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(DirectionalLightComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_DIRECTIONAL_LIGHT)

    world.sceneComponentRegistry.delete(HemisphereLightComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_HEMISPHERE_LIGHT)

    world.sceneComponentRegistry.delete(AmbientLightComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_AMBIENT_LIGHT)

    world.sceneComponentRegistry.delete(PointLightComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_POINT_LIGHT)

    world.sceneComponentRegistry.delete(SpotLightComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_SPOT_LIGHT)

    world.scenePrefabRegistry.delete(LightPrefabs.directionalLight)
    world.scenePrefabRegistry.delete(LightPrefabs.hemisphereLight)
    world.scenePrefabRegistry.delete(LightPrefabs.ambientLight)
    world.scenePrefabRegistry.delete(LightPrefabs.pointLight)
    world.scenePrefabRegistry.delete(LightPrefabs.spotLight)

    removeQuery(world, directionalLightSelectQuery)
  }

  return { execute, cleanup }
}
