import { Not } from 'bitecs'
import { Color } from 'three'

import { ComponentJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { createActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import {
  LoopAnimationComponent,
  SCENE_COMPONENT_LOOP_ANIMATION,
  SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE
} from '../../avatar/components/LoopAnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import {
  CloudComponent,
  SCENE_COMPONENT_CLOUD,
  SCENE_COMPONENT_CLOUD_DEFAULT_VALUES
} from '../components/CloudComponent'
import { EnvMapBakeComponent, SCENE_COMPONENT_ENVMAP_BAKE } from '../components/EnvMapBakeComponent'
import { EnvmapComponent, SCENE_COMPONENT_ENVMAP } from '../components/EnvmapComponent'
import { GroundPlaneComponent, SCENE_COMPONENT_GROUND_PLANE } from '../components/GroundPlaneComponent'
import { GroupComponent, SCENE_COMPONENT_GROUP } from '../components/GroupComponent'
import { ImageComponent, SCENE_COMPONENT_IMAGE } from '../components/ImageComponent'
import {
  InteriorComponent,
  SCENE_COMPONENT_INTERIOR,
  SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES
} from '../components/InteriorComponent'
import { ModelComponent, SCENE_COMPONENT_MODEL } from '../components/ModelComponent'
import {
  OceanComponent,
  SCENE_COMPONENT_OCEAN,
  SCENE_COMPONENT_OCEAN_DEFAULT_VALUES
} from '../components/OceanComponent'
import {
  DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
  ParticleSystemComponent,
  SCENE_COMPONENT_PARTICLE_SYSTEM
} from '../components/ParticleSystemComponent'
import { PortalComponent, SCENE_COMPONENT_PORTAL } from '../components/PortalComponent'
import { PrefabComponent, SCENE_COMPONENT_PREFAB } from '../components/PrefabComponent'
import { PreventBakeTagComponent, SCENE_COMPONENT_PREVENT_BAKE } from '../components/PreventBakeTagComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, ScenePreviewCameraComponent } from '../components/ScenePreviewCamera'
import { SceneTagComponent } from '../components/SceneTagComponent'
import { SCENE_COMPONENT_SCREENSHARETARGET, ScreenshareTargetComponent } from '../components/ScreenshareTargetComponent'
import {
  SCENE_COMPONENT_SHADOW,
  SCENE_COMPONENT_SHADOW_DEFAULT_VALUES,
  ShadowComponent
} from '../components/ShadowComponent'
import { SCENE_COMPONENT_SKYBOX, SkyboxComponent } from '../components/SkyboxComponent'
import { SCENE_COMPONENT_SPAWN_POINT, SpawnPointComponent } from '../components/SpawnPointComponent'
import {
  SCENE_COMPONENT_SPLINE,
  SCENE_COMPONENT_SPLINE_DEFAULT_VALUES,
  SplineComponent
} from '../components/SplineComponent'
import {
  SCENE_COMPONENT_SYSTEM,
  SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES,
  SystemComponent
} from '../components/SystemComponent'
import { SCENE_COMPONENT_VISIBLE, VisibleComponent } from '../components/VisibleComponent'
import { SCENE_COMPONENT_WATER, WaterComponent } from '../components/WaterComponent'
import { deserializeCloud, serializeCloud, updateCloud } from '../functions/loaders/CloudFunctions'
import { deserializeEnvMap, serializeEnvMap, updateEnvMap } from '../functions/loaders/EnvMapFunctions'
import { deserializeGroup } from '../functions/loaders/GroupFunctions'
import { deserializeInterior, serializeInterior, updateInterior } from '../functions/loaders/InteriorFunctions'
import { serializeLoopAnimation, updateLoopAnimation } from '../functions/loaders/LoopAnimationFunctions'
import { deserializeModel } from '../functions/loaders/ModelFunctions'
import { deserializeOcean, serializeOcean, updateOcean } from '../functions/loaders/OceanFunctions'
import { deserializePrefab } from '../functions/loaders/PrefabComponentFunctions'
import { updateSkybox } from '../functions/loaders/SkyboxFunctions'
import { deserializeSpline, serializeSpline } from '../functions/loaders/SplineFunctions'
import { deserializeWater } from '../functions/loaders/WaterFunctions'

export const defaultSpatialComponents: ComponentJson[] = [
  { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
  { name: SCENE_COMPONENT_VISIBLE, props: true },
  { name: SCENE_COMPONENT_SHADOW, props: SCENE_COMPONENT_SHADOW_DEFAULT_VALUES }
]

export const ScenePrefabs = {
  groundPlane: 'Ground Plane' as const,
  model: 'Model' as const,
  particleEmitter: 'Particle Emitter' as const,
  portal: 'Portal' as const,
  chair: 'Chair' as const,
  previewCamera: 'Preview Camera' as const,
  skybox: 'Skybox' as const,
  spawnPoint: 'Spawn Point' as const,
  group: 'Group' as const,
  prefab: 'Prefab' as const,
  image: 'Image' as const,
  cloud: 'Cloud' as const,
  water: 'Water' as const,
  ocean: 'Ocean' as const,
  interior: 'Interior' as const,
  system: 'System' as const,
  spline: 'Spline' as const,
  envMapbake: 'EnvMap Bake' as const,
  instancing: 'Instancing' as const,
  loadVolume: 'Load Volume' as const,
  behaveGraph: 'Behave Graph' as const
}

export default async function SceneObjectUpdateSystem() {
  /**
   * Tag components
   */

  Engine.instance.sceneComponentRegistry.set(VisibleComponent.name, SCENE_COMPONENT_VISIBLE)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_VISIBLE, {})

  Engine.instance.sceneComponentRegistry.set(ShadowComponent.name, SCENE_COMPONENT_SHADOW)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SHADOW, {
    defaultData: true
  })

  Engine.instance.sceneComponentRegistry.set(PreventBakeTagComponent.name, SCENE_COMPONENT_PREVENT_BAKE)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_PREVENT_BAKE, {})

  /**
   * Metadata
   */

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.previewCamera, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, props: true }
  ])

  Engine.instance.sceneComponentRegistry.set(ScenePreviewCameraComponent.name, SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, {})

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.system, [
    { name: SCENE_COMPONENT_SYSTEM, props: SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES }
  ])

  Engine.instance.sceneComponentRegistry.set(SystemComponent.name, SCENE_COMPONENT_SYSTEM)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SYSTEM, {
    defaultData: SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.spawnPoint, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SPAWN_POINT, props: true }
  ])

  Engine.instance.sceneComponentRegistry.set(SpawnPointComponent.name, SCENE_COMPONENT_SPAWN_POINT)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SPAWN_POINT, {
    defaultData: {}
  })

  /**
   * Assets
   */

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.prefab, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_PREFAB, props: {} }
  ])

  Engine.instance.sceneComponentRegistry.set(PrefabComponent.name, SCENE_COMPONENT_PREFAB)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_PREFAB, {
    deserialize: deserializePrefab
  })

  /**
   * Portals
   */

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.portal, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PORTAL, props: {} }
  ])

  Engine.instance.sceneComponentRegistry.set(PortalComponent.name, SCENE_COMPONENT_PORTAL)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_PORTAL, {
    defaultData: {}
  })

  /**
   * Environment
   */

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.skybox, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SKYBOX, props: {} }
  ])

  Engine.instance.sceneComponentRegistry.set(SkyboxComponent.name, SCENE_COMPONENT_SKYBOX)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SKYBOX, {
    defaultData: {}
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.envMapbake, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_ENVMAP_BAKE, props: {} }
  ])

  Engine.instance.sceneComponentRegistry.set(EnvMapBakeComponent.name, SCENE_COMPONENT_ENVMAP_BAKE)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP_BAKE, {
    defaultData: {}
  })

  /**
   * Objects
   */

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.model, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MODEL, props: {} },
    { name: SCENE_COMPONENT_ENVMAP, props: {} },
    { name: SCENE_COMPONENT_LOOP_ANIMATION, props: SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE }
  ])

  Engine.instance.sceneComponentRegistry.set(ModelComponent.name, SCENE_COMPONENT_MODEL)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_MODEL, {
    deserialize: deserializeModel
  })

  Engine.instance.sceneComponentRegistry.set(EnvmapComponent.name, SCENE_COMPONENT_ENVMAP)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP, {
    deserialize: deserializeEnvMap,
    serialize: serializeEnvMap
  })

  Engine.instance.sceneComponentRegistry.set(ScreenshareTargetComponent.name, SCENE_COMPONENT_SCREENSHARETARGET)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SCREENSHARETARGET, {})

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.group, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_GROUP, props: [] }
  ])

  Engine.instance.sceneComponentRegistry.set(GroupComponent.name, SCENE_COMPONENT_GROUP)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUP, {
    deserialize: deserializeGroup,
    serialize: () => undefined!
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.groundPlane, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SHADOW, props: { receive: true, cast: false } },
    { name: SCENE_COMPONENT_GROUND_PLANE, props: {} }
  ])

  Engine.instance.sceneComponentRegistry.set(GroundPlaneComponent.name, SCENE_COMPONENT_GROUND_PLANE)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUND_PLANE, {
    defaultData: {}
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.image, [
    ...defaultSpatialComponents,
    {
      name: SCENE_COMPONENT_IMAGE,
      props: { source: '__$project$__/default-project/assets/sample_etc1s.ktx2' }
    }
  ])

  Engine.instance.sceneComponentRegistry.set(ImageComponent.name, SCENE_COMPONENT_IMAGE)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_IMAGE, {
    defaultData: {}
  })

  Engine.instance.sceneComponentRegistry.set(LoopAnimationComponent.name, SCENE_COMPONENT_LOOP_ANIMATION)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_LOOP_ANIMATION, {
    defaultData: SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE,
    serialize: serializeLoopAnimation
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.cloud, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_CLOUD, props: SCENE_COMPONENT_CLOUD_DEFAULT_VALUES }
  ])

  Engine.instance.sceneComponentRegistry.set(CloudComponent.name, SCENE_COMPONENT_CLOUD)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_CLOUD, {
    defaultData: SCENE_COMPONENT_CLOUD_DEFAULT_VALUES,
    deserialize: deserializeCloud,
    serialize: serializeCloud
  })
  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.ocean, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_OCEAN, props: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES }
  ])

  Engine.instance.sceneComponentRegistry.set(OceanComponent.name, SCENE_COMPONENT_OCEAN)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_OCEAN, {
    defaultData: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES,
    deserialize: deserializeOcean,
    serialize: serializeOcean
  })
  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.water, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_WATER, props: true }
  ])

  Engine.instance.sceneComponentRegistry.set(WaterComponent.name, SCENE_COMPONENT_WATER)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_WATER, {
    deserialize: deserializeWater
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.interior, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_INTERIOR, props: SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES }
  ])

  Engine.instance.sceneComponentRegistry.set(InteriorComponent.name, SCENE_COMPONENT_INTERIOR)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_INTERIOR, {
    defaultData: SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES,
    deserialize: deserializeInterior,
    serialize: serializeInterior
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.spline, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_SPLINE, props: SCENE_COMPONENT_SPLINE_DEFAULT_VALUES }
  ])

  Engine.instance.sceneComponentRegistry.set(SplineComponent.name, SCENE_COMPONENT_SPLINE)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_SPLINE, {
    defaultData: SCENE_COMPONENT_SPLINE_DEFAULT_VALUES,
    deserialize: deserializeSpline,
    serialize: serializeSpline
  })

  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.particleEmitter, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PARTICLE_SYSTEM, props: {} }
  ])

  Engine.instance.sceneComponentRegistry.set(ParticleSystemComponent.name, SCENE_COMPONENT_PARTICLE_SYSTEM)

  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_PARTICLE_SYSTEM, {
    defaultData: {}
  })

  const envmapQuery = defineQuery([GroupComponent, EnvmapComponent])
  const imageQuery = defineQuery([ImageComponent])
  const sceneEnvmapQuery = defineQuery([SceneTagComponent, EnvmapComponent])
  const loopableAnimationQuery = defineQuery([LoopAnimationComponent, Not(SceneAssetPendingTagComponent)])
  const skyboxQuery = defineQuery([SkyboxComponent])
  const portalQuery = defineQuery([PortalComponent])
  const modelQuery = defineQuery([ModelComponent])
  const groundPlaneQuery = defineQuery([GroundPlaneComponent])
  const cloudQuery = defineQuery([CloudComponent])
  const oceanQuery = defineQuery([OceanComponent])
  const interiorQuery = defineQuery([InteriorComponent])
  const scenePreviewCameraQuery = defineQuery([ScenePreviewCameraComponent])
  const spawnPointComponent = defineQuery([SpawnPointComponent])

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  const execute = () => {
    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, EnvmapComponent) && hasComponent(entity, GroupComponent)) updateEnvMap(entity)
        if (hasComponent(entity, SkyboxComponent)) updateSkybox(entity)
        if (hasComponent(entity, LoopAnimationComponent)) updateLoopAnimation(entity)
        if (hasComponent(entity, CloudComponent)) updateCloud(entity)
        if (hasComponent(entity, OceanComponent)) updateOcean(entity)
        if (hasComponent(entity, InteriorComponent)) updateInterior(entity)
      }
    }

    for (const entity of envmapQuery.enter()) updateEnvMap(entity)
    for (const entity of loopableAnimationQuery.enter()) updateLoopAnimation(entity)
    for (const entity of skyboxQuery.enter()) updateSkybox(entity)
    for (const _ of skyboxQuery.exit()) Engine.instance.scene.background = new Color('black')
    for (const entity of cloudQuery.enter()) updateCloud(entity)
    for (const entity of oceanQuery.enter()) updateOcean(entity)
    for (const entity of interiorQuery.enter()) updateInterior(entity)
    for (const entity of spawnPointComponent()) getComponent(entity, SpawnPointComponent).helperBox?.update()
  }

  const cleanup = async () => {
    Engine.instance.sceneComponentRegistry.delete(VisibleComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_VISIBLE)

    Engine.instance.sceneComponentRegistry.delete(ShadowComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SHADOW)

    Engine.instance.sceneComponentRegistry.delete(PreventBakeTagComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_PREVENT_BAKE)

    /**
     * Metadata
     */

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.previewCamera)

    Engine.instance.sceneComponentRegistry.delete(ScenePreviewCameraComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.system)

    Engine.instance.sceneComponentRegistry.delete(SystemComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SYSTEM)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.spawnPoint)

    Engine.instance.sceneComponentRegistry.delete(SpawnPointComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SPAWN_POINT)

    /**
     * Assets
     */

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.prefab)

    Engine.instance.sceneComponentRegistry.delete(PrefabComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_PREFAB)

    /**
     * Portals
     */

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.portal)

    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_PORTAL)
    Engine.instance.sceneComponentRegistry.delete(PortalComponent.name)

    /**
     * Environment
     */

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.skybox)

    Engine.instance.sceneComponentRegistry.delete(SkyboxComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SKYBOX)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.envMapbake)

    Engine.instance.sceneComponentRegistry.delete(EnvMapBakeComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_ENVMAP_BAKE)

    /**
     * Objects
     */

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.model)

    Engine.instance.sceneComponentRegistry.delete(ModelComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_MODEL)

    Engine.instance.sceneComponentRegistry.delete(EnvmapComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_ENVMAP)

    Engine.instance.sceneComponentRegistry.delete(ScreenshareTargetComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SCREENSHARETARGET)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.group)

    Engine.instance.sceneComponentRegistry.delete(GroupComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_GROUP)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.groundPlane)

    Engine.instance.sceneComponentRegistry.delete(GroundPlaneComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_GROUND_PLANE)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.image)

    Engine.instance.sceneComponentRegistry.delete(ImageComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_IMAGE)

    Engine.instance.sceneComponentRegistry.delete(LoopAnimationComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_LOOP_ANIMATION)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.cloud)

    Engine.instance.sceneComponentRegistry.delete(CloudComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_CLOUD)
    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.ocean)

    Engine.instance.sceneComponentRegistry.delete(OceanComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_OCEAN)
    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.water)

    Engine.instance.sceneComponentRegistry.delete(WaterComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_WATER)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.interior)

    Engine.instance.sceneComponentRegistry.delete(InteriorComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_INTERIOR)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.spline)

    Engine.instance.sceneComponentRegistry.delete(SplineComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_SPLINE)

    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.particleEmitter)
    Engine.instance.sceneComponentRegistry.delete(ParticleSystemComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_PARTICLE_SYSTEM)

    removeQuery(envmapQuery)
    removeQuery(imageQuery)
    removeQuery(sceneEnvmapQuery)
    removeQuery(loopableAnimationQuery)
    removeQuery(skyboxQuery)
    removeQuery(portalQuery)
    removeQuery(modelQuery)
    removeQuery(groundPlaneQuery)
    removeQuery(cloudQuery)
    removeQuery(oceanQuery)
    removeQuery(interiorQuery)
    removeQuery(scenePreviewCameraQuery)

    removeActionQueue(modifyPropertyActionQueue)
  }

  return { execute, cleanup }
}
