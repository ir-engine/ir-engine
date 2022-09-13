import { createActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import {
  AmbientLightComponent,
  SCENE_COMPONENT_AMBIENT_LIGHT,
  SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES
} from '../components/AmbientLightComponent'
import {
  DirectionalLightComponent,
  SCENE_COMPONENT_DIRECTIONAL_LIGHT,
  SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES
} from '../components/DirectionalLightComponent'
import {
  HemisphereLightComponent,
  SCENE_COMPONENT_HEMISPHERE_LIGHT,
  SCENE_COMPONENT_HEMISPHERE_LIGHT_DEFAULT_VALUES
} from '../components/HemisphereLightComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import {
  PointLightComponent,
  SCENE_COMPONENT_POINT_LIGHT,
  SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES
} from '../components/PointLightComponent'
import {
  SCENE_COMPONENT_SPOT_LIGHT,
  SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES,
  SpotLightComponent
} from '../components/SpotLightComponent'
import { SCENE_COMPONENT_VISIBLE } from '../components/VisibleComponent'
import {
  deserializeAmbientLight,
  serializeAmbientLight,
  shouldDeserializeAmbientLight,
  updateAmbientLight
} from '../functions/loaders/AmbientLightFunctions'
import {
  deserializeDirectionalLight,
  serializeDirectionalLight,
  updateDirectionalLight
} from '../functions/loaders/DirectionalLightFunctions'
import {
  deserializeHemisphereLight,
  serializeHemisphereLight,
  shouldDeserializeHemisphereLight,
  updateHemisphereLight
} from '../functions/loaders/HemisphereLightFunctions'
import { deserializePointLight, serializePointLight, updatePointLight } from '../functions/loaders/PointLightFunctions'
import { deserializeSpotLight, serializeSpotLight, updateSpotLight } from '../functions/loaders/SpotLightFunctions'

export const LightPrefabs = {
  directionalLight: 'Directional Light' as const,
  hemisphereLight: 'Hemisphere Light' as const,
  ambientLight: 'Ambient Light' as const,
  pointLight: 'Point Light' as const,
  spotLight: 'Spot Light' as const
}

export default async function LightSystem(world: World) {
  world.sceneComponentRegistry.set(DirectionalLightComponent._name, SCENE_COMPONENT_DIRECTIONAL_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DIRECTIONAL_LIGHT, {
    defaultData: SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES,
    deserialize: deserializeDirectionalLight,
    serialize: serializeDirectionalLight
  })

  world.sceneComponentRegistry.set(HemisphereLightComponent._name, SCENE_COMPONENT_HEMISPHERE_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_HEMISPHERE_LIGHT, {
    defaultData: SCENE_COMPONENT_HEMISPHERE_LIGHT_DEFAULT_VALUES,
    deserialize: deserializeHemisphereLight,
    serialize: serializeHemisphereLight,
    shouldDeserialize: shouldDeserializeHemisphereLight
  })

  world.sceneComponentRegistry.set(AmbientLightComponent._name, SCENE_COMPONENT_AMBIENT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AMBIENT_LIGHT, {
    defaultData: SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES,
    deserialize: deserializeAmbientLight,
    serialize: serializeAmbientLight,
    shouldDeserialize: shouldDeserializeAmbientLight
  })

  world.sceneComponentRegistry.set(PointLightComponent._name, SCENE_COMPONENT_POINT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POINT_LIGHT, {
    defaultData: SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES,
    deserialize: deserializePointLight,
    serialize: serializePointLight
  })

  world.sceneComponentRegistry.set(SpotLightComponent._name, SCENE_COMPONENT_SPOT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPOT_LIGHT, {
    defaultData: SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES,
    deserialize: deserializeSpotLight,
    serialize: serializeSpotLight
  })

  world.scenePrefabRegistry.set(LightPrefabs.directionalLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_DIRECTIONAL_LIGHT, props: SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.hemisphereLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_HEMISPHERE_LIGHT, props: SCENE_COMPONENT_HEMISPHERE_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.ambientLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_AMBIENT_LIGHT, props: SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.pointLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_POINT_LIGHT, props: SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.spotLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SPOT_LIGHT, props: SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES }
  ])

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)
  const ambientLightQuery = defineQuery([AmbientLightComponent])
  const directionalLightQuery = defineQuery([DirectionalLightComponent])
  const hemisphereLightQuery = defineQuery([HemisphereLightComponent])
  const pointLightQuery = defineQuery([PointLightComponent])
  const spotLightQuery = defineQuery([SpotLightComponent])

  return () => {
    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, AmbientLightComponent)) updateAmbientLight(entity)
        if (hasComponent(entity, DirectionalLightComponent)) updateDirectionalLight(entity)
        if (hasComponent(entity, HemisphereLightComponent)) updateHemisphereLight(entity)
        if (hasComponent(entity, PointLightComponent)) updatePointLight(entity)
        if (hasComponent(entity, SpotLightComponent)) updateSpotLight(entity)
      }
    }

    for (const entity of ambientLightQuery.enter()) updateAmbientLight(entity)
    for (const entity of directionalLightQuery.enter()) updateDirectionalLight(entity)
    for (const entity of directionalLightQuery.exit())
      EngineRenderer.instance.directionalLightEntities.splice(
        EngineRenderer.instance.directionalLightEntities.indexOf(entity),
        1
      )
    for (const entity of hemisphereLightQuery.enter()) updateHemisphereLight(entity)
    for (const entity of pointLightQuery.enter()) updatePointLight(entity)
    for (const entity of spotLightQuery.enter()) updateSpotLight(entity)
  }
}
