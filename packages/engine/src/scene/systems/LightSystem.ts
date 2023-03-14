import { Engine } from '../../ecs/classes/Engine'
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

export default async function LightSystem() {
  Engine.instance.sceneComponentRegistry.set(DirectionalLightComponent.name, SCENE_COMPONENT_DIRECTIONAL_LIGHT)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_DIRECTIONAL_LIGHT, {
    defaultData: {}
  })

  Engine.instance.sceneComponentRegistry.set(HemisphereLightComponent.name, SCENE_COMPONENT_HEMISPHERE_LIGHT)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_HEMISPHERE_LIGHT, {
    defaultData: {}
  })

  Engine.instance.sceneComponentRegistry.set(AmbientLightComponent.name, SCENE_COMPONENT_AMBIENT_LIGHT)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_AMBIENT_LIGHT, {
    defaultData: {}
  })

  Engine.instance.sceneComponentRegistry.set(PointLightComponent.name, SCENE_COMPONENT_POINT_LIGHT)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_POINT_LIGHT, {
    defaultData: {}
  })

  Engine.instance.sceneComponentRegistry.set(SpotLightComponent.name, SCENE_COMPONENT_SPOT_LIGHT)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SPOT_LIGHT, {
    defaultData: {}
  })

  Engine.instance.scenePrefabRegistry.set(LightPrefabs.directionalLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_DIRECTIONAL_LIGHT, props: {} }
  ])

  Engine.instance.scenePrefabRegistry.set(LightPrefabs.hemisphereLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_HEMISPHERE_LIGHT, props: {} }
  ])

  Engine.instance.scenePrefabRegistry.set(LightPrefabs.ambientLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_AMBIENT_LIGHT, props: {} }
  ])

  Engine.instance.scenePrefabRegistry.set(LightPrefabs.pointLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_POINT_LIGHT, props: {} }
  ])

  Engine.instance.scenePrefabRegistry.set(LightPrefabs.spotLight, [
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
    Engine.instance.sceneComponentRegistry.delete(DirectionalLightComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_DIRECTIONAL_LIGHT)

    Engine.instance.sceneComponentRegistry.delete(HemisphereLightComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_HEMISPHERE_LIGHT)

    Engine.instance.sceneComponentRegistry.delete(AmbientLightComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_AMBIENT_LIGHT)

    Engine.instance.sceneComponentRegistry.delete(PointLightComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_POINT_LIGHT)

    Engine.instance.sceneComponentRegistry.delete(SpotLightComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SPOT_LIGHT)

    Engine.instance.scenePrefabRegistry.delete(LightPrefabs.directionalLight)
    Engine.instance.scenePrefabRegistry.delete(LightPrefabs.hemisphereLight)
    Engine.instance.scenePrefabRegistry.delete(LightPrefabs.ambientLight)
    Engine.instance.scenePrefabRegistry.delete(LightPrefabs.pointLight)
    Engine.instance.scenePrefabRegistry.delete(LightPrefabs.spotLight)

    removeQuery(directionalLightSelectQuery)
  }

  return { execute, cleanup }
}
