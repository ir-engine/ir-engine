import { createActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, hasComponent } from '../../ecs/functions/ComponentFunctions'
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
  SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES
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
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../functions/loaders/TransformFunctions'
import { SCENE_COMPONENT_VISIBLE, SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES } from '../functions/loaders/VisibleFunctions'

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
    deserialize: deserializeDirectionalLight,
    serialize: serializeDirectionalLight,
    update: updateDirectionalLight
  })

  world.sceneComponentRegistry.set(HemisphereLightComponent._name, SCENE_COMPONENT_HEMISPHERE_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_HEMISPHERE_LIGHT, {
    deserialize: deserializeHemisphereLight,
    serialize: serializeHemisphereLight,
    update: updateHemisphereLight,
    shouldDeserialize: shouldDeserializeHemisphereLight
  })

  world.sceneComponentRegistry.set(AmbientLightComponent._name, SCENE_COMPONENT_AMBIENT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AMBIENT_LIGHT, {
    deserialize: deserializeAmbientLight,
    serialize: serializeAmbientLight,
    update: updateAmbientLight,
    shouldDeserialize: shouldDeserializeAmbientLight
  })

  world.sceneComponentRegistry.set(PointLightComponent._name, SCENE_COMPONENT_POINT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POINT_LIGHT, {
    deserialize: deserializePointLight,
    serialize: serializePointLight,
    update: updatePointLight
  })

  world.sceneComponentRegistry.set(SpotLightComponent._name, SCENE_COMPONENT_SPOT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPOT_LIGHT, {
    deserialize: deserializeSpotLight,
    serialize: serializeSpotLight,
    update: updateSpotLight
  })

  world.scenePrefabRegistry.set(LightPrefabs.directionalLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_DIRECTIONAL_LIGHT, props: SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.hemisphereLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_HEMISPHERE_LIGHT, props: SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.ambientLight, [
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_AMBIENT_LIGHT, props: SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.pointLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_POINT_LIGHT, props: SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(LightPrefabs.spotLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_SPOT_LIGHT, props: SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES }
  ])

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)
  const ambientLightQuery = defineQuery([AmbientLightComponent, Object3DComponent])
  const directionalLightQuery = defineQuery([DirectionalLightComponent, Object3DComponent])
  const hemisphereLightQuery = defineQuery([HemisphereLightComponent, Object3DComponent])
  const pointLightQuery = defineQuery([PointLightComponent, Object3DComponent])
  const spotLightQuery = defineQuery([SpotLightComponent, Object3DComponent])

  return () => {
    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, AmbientLightComponent) && hasComponent(entity, Object3DComponent))
          updateAmbientLight(entity)
        if (hasComponent(entity, DirectionalLightComponent) && hasComponent(entity, Object3DComponent))
          updateDirectionalLight(entity)
        if (hasComponent(entity, HemisphereLightComponent) && hasComponent(entity, Object3DComponent))
          updateHemisphereLight(entity)
        if (hasComponent(entity, PointLightComponent) && hasComponent(entity, Object3DComponent))
          updatePointLight(entity)
        if (hasComponent(entity, SpotLightComponent) && hasComponent(entity, Object3DComponent)) updateSpotLight(entity)
      }
    }

    for (const entity of ambientLightQuery.enter()) updateAmbientLight(entity)
    for (const entity of directionalLightQuery.enter()) updateDirectionalLight(entity)
    for (const entity of hemisphereLightQuery.enter()) updateHemisphereLight(entity)
    for (const entity of pointLightQuery.enter()) updatePointLight(entity)
    for (const entity of spotLightQuery.enter()) updateSpotLight(entity)
  }
}
