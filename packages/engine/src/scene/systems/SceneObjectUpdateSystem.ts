import { Not } from 'bitecs'
import { Color } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import {
  LoopAnimationComponent,
  SCENE_COMPONENT_LOOP_ANIMATION,
  SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE
} from '../../avatar/components/LoopAnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
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
import {
  GroundPlaneComponent,
  SCENE_COMPONENT_GROUND_PLANE,
  SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES
} from '../components/GroundPlaneComponent'
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
import { deserializeGround, serializeGroundPlane, updateGroundPlane } from '../functions/loaders/GroundPlaneFunctions'
import { deserializeGroup } from '../functions/loaders/GroupFunctions'
import { deserializeInterior, serializeInterior, updateInterior } from '../functions/loaders/InteriorFunctions'
import { serializeLoopAnimation, updateLoopAnimation } from '../functions/loaders/LoopAnimationFunctions'
import { deserializeModel } from '../functions/loaders/ModelFunctions'
import { deserializeOcean, serializeOcean, updateOcean } from '../functions/loaders/OceanFunctions'
import { deserializePrefab } from '../functions/loaders/PrefabComponentFunctions'
import { deserializeSkybox, serializeSkybox, updateSkybox } from '../functions/loaders/SkyboxFunctions'
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

export default async function SceneObjectUpdateSystem(world: World) {
  /**
   * Tag components
   */

  world.sceneComponentRegistry.set(VisibleComponent.name, SCENE_COMPONENT_VISIBLE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VISIBLE, {})

  world.sceneComponentRegistry.set(ShadowComponent.name, SCENE_COMPONENT_SHADOW)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SHADOW, {
    defaultData: SCENE_COMPONENT_SHADOW_DEFAULT_VALUES
  })

  world.sceneComponentRegistry.set(PreventBakeTagComponent.name, SCENE_COMPONENT_PREVENT_BAKE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PREVENT_BAKE, {})

  /**
   * Metadata
   */

  world.scenePrefabRegistry.set(ScenePrefabs.previewCamera, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, props: true }
  ])

  world.sceneComponentRegistry.set(ScenePreviewCameraComponent.name, SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, {})

  world.scenePrefabRegistry.set(ScenePrefabs.system, [
    { name: SCENE_COMPONENT_SYSTEM, props: SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(SystemComponent.name, SCENE_COMPONENT_SYSTEM)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SYSTEM, {
    defaultData: SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES
  })

  world.scenePrefabRegistry.set(ScenePrefabs.spawnPoint, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SPAWN_POINT, props: true }
  ])

  world.sceneComponentRegistry.set(SpawnPointComponent.name, SCENE_COMPONENT_SPAWN_POINT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPAWN_POINT, {
    defaultData: {}
  })

  /**
   * Assets
   */

  world.scenePrefabRegistry.set(ScenePrefabs.prefab, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_PREFAB, props: {} }
  ])

  world.sceneComponentRegistry.set(PrefabComponent.name, SCENE_COMPONENT_PREFAB)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PREFAB, {
    deserialize: deserializePrefab
  })

  /**
   * Portals
   */

  world.scenePrefabRegistry.set(ScenePrefabs.portal, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PORTAL, props: {} }
  ])

  world.sceneComponentRegistry.set(PortalComponent.name, SCENE_COMPONENT_PORTAL)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PORTAL, {
    defaultData: {}
  })

  /**
   * Environment
   */

  world.scenePrefabRegistry.set(ScenePrefabs.skybox, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SKYBOX, props: {} }
  ])

  world.sceneComponentRegistry.set(SkyboxComponent.name, SCENE_COMPONENT_SKYBOX)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SKYBOX, {
    defaultData: {},
    deserialize: deserializeSkybox,
    serialize: serializeSkybox
  })

  world.scenePrefabRegistry.set(ScenePrefabs.envMapbake, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_ENVMAP_BAKE, props: {} }
  ])

  world.sceneComponentRegistry.set(EnvMapBakeComponent.name, SCENE_COMPONENT_ENVMAP_BAKE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP_BAKE, {
    defaultData: {}
  })

  /**
   * Objects
   */

  world.scenePrefabRegistry.set(ScenePrefabs.model, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MODEL, props: {} },
    { name: SCENE_COMPONENT_ENVMAP, props: {} },
    { name: SCENE_COMPONENT_LOOP_ANIMATION, props: SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE }
  ])

  world.sceneComponentRegistry.set(ModelComponent.name, SCENE_COMPONENT_MODEL)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MODEL, {
    deserialize: deserializeModel
  })

  world.sceneComponentRegistry.set(EnvmapComponent.name, SCENE_COMPONENT_ENVMAP)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP, {
    deserialize: deserializeEnvMap,
    serialize: serializeEnvMap
  })

  world.sceneComponentRegistry.set(ScreenshareTargetComponent.name, SCENE_COMPONENT_SCREENSHARETARGET)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SCREENSHARETARGET, {})

  world.scenePrefabRegistry.set(ScenePrefabs.group, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_GROUP, props: [] }
  ])

  world.sceneComponentRegistry.set(GroupComponent.name, SCENE_COMPONENT_GROUP)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUP, {
    deserialize: deserializeGroup,
    serialize: () => undefined!
  })

  world.scenePrefabRegistry.set(ScenePrefabs.groundPlane, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_GROUND_PLANE, props: SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(GroundPlaneComponent.name, SCENE_COMPONENT_GROUND_PLANE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUND_PLANE, {
    defaultData: SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES,
    deserialize: deserializeGround,
    serialize: serializeGroundPlane
  })

  world.scenePrefabRegistry.set(ScenePrefabs.image, [
    ...defaultSpatialComponents,
    {
      name: SCENE_COMPONENT_IMAGE,
      props: { source: '__$project$__/default-project/assets/sample_etc1s.ktx2' }
    }
  ])

  world.sceneComponentRegistry.set(ImageComponent.name, SCENE_COMPONENT_IMAGE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_IMAGE, {
    defaultData: {}
  })

  world.sceneComponentRegistry.set(LoopAnimationComponent.name, SCENE_COMPONENT_LOOP_ANIMATION)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_LOOP_ANIMATION, {
    defaultData: SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE,
    serialize: serializeLoopAnimation
  })

  world.scenePrefabRegistry.set(ScenePrefabs.cloud, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_CLOUD, props: SCENE_COMPONENT_CLOUD_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(CloudComponent.name, SCENE_COMPONENT_CLOUD)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_CLOUD, {
    defaultData: SCENE_COMPONENT_CLOUD_DEFAULT_VALUES,
    deserialize: deserializeCloud,
    serialize: serializeCloud
  })
  world.scenePrefabRegistry.set(ScenePrefabs.ocean, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_OCEAN, props: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(OceanComponent.name, SCENE_COMPONENT_OCEAN)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_OCEAN, {
    defaultData: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES,
    deserialize: deserializeOcean,
    serialize: serializeOcean
  })
  world.scenePrefabRegistry.set(ScenePrefabs.water, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_WATER, props: true }
  ])

  world.sceneComponentRegistry.set(WaterComponent.name, SCENE_COMPONENT_WATER)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_WATER, {
    deserialize: deserializeWater
  })

  world.scenePrefabRegistry.set(ScenePrefabs.interior, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_INTERIOR, props: SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(InteriorComponent.name, SCENE_COMPONENT_INTERIOR)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_INTERIOR, {
    defaultData: SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES,
    deserialize: deserializeInterior,
    serialize: serializeInterior
  })

  world.scenePrefabRegistry.set(ScenePrefabs.spline, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_SPLINE, props: SCENE_COMPONENT_SPLINE_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(SplineComponent.name, SCENE_COMPONENT_SPLINE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPLINE, {
    defaultData: SCENE_COMPONENT_SPLINE_DEFAULT_VALUES,
    deserialize: deserializeSpline,
    serialize: serializeSpline
  })

  world.scenePrefabRegistry.set(ScenePrefabs.particleEmitter, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PARTICLE_SYSTEM, props: {} }
  ])

  world.sceneComponentRegistry.set(ParticleSystemComponent.name, SCENE_COMPONENT_PARTICLE_SYSTEM)

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PARTICLE_SYSTEM, {
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
        if (hasComponent(entity, GroundPlaneComponent)) updateGroundPlane(entity)
        if (hasComponent(entity, LoopAnimationComponent)) updateLoopAnimation(entity)
        if (hasComponent(entity, CloudComponent)) updateCloud(entity)
        if (hasComponent(entity, OceanComponent)) updateOcean(entity)
        if (hasComponent(entity, InteriorComponent)) updateInterior(entity)
      }
    }

    for (const entity of envmapQuery.enter()) updateEnvMap(entity)
    for (const entity of loopableAnimationQuery.enter()) updateLoopAnimation(entity)
    for (const entity of skyboxQuery.enter()) updateSkybox(entity)
    for (const _ of skyboxQuery.exit()) Engine.instance.currentWorld.scene.background = new Color('black')
    for (const entity of groundPlaneQuery.enter()) updateGroundPlane(entity)
    for (const entity of cloudQuery.enter()) updateCloud(entity)
    for (const entity of oceanQuery.enter()) updateOcean(entity)
    for (const entity of interiorQuery.enter()) updateInterior(entity)
    for (const entity of spawnPointComponent()) getComponent(entity, SpawnPointComponent).helperBox?.update()
  }

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(VisibleComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_VISIBLE)

    world.sceneComponentRegistry.delete(ShadowComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_SHADOW)

    world.sceneComponentRegistry.delete(PreventBakeTagComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_PREVENT_BAKE)

    /**
     * Metadata
     */

    world.scenePrefabRegistry.delete(ScenePrefabs.previewCamera)

    world.sceneComponentRegistry.delete(ScenePreviewCameraComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)

    world.scenePrefabRegistry.delete(ScenePrefabs.system)

    world.sceneComponentRegistry.delete(SystemComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_SYSTEM)

    world.scenePrefabRegistry.delete(ScenePrefabs.spawnPoint)

    world.sceneComponentRegistry.delete(SpawnPointComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_SPAWN_POINT)

    /**
     * Assets
     */

    world.scenePrefabRegistry.delete(ScenePrefabs.prefab)

    world.sceneComponentRegistry.delete(PrefabComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_PREFAB)

    /**
     * Portals
     */

    world.scenePrefabRegistry.delete(ScenePrefabs.portal)

    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_PORTAL)
    world.sceneComponentRegistry.delete(PortalComponent.name)

    /**
     * Environment
     */

    world.scenePrefabRegistry.delete(ScenePrefabs.skybox)

    world.sceneComponentRegistry.delete(SkyboxComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_SKYBOX)

    world.scenePrefabRegistry.delete(ScenePrefabs.envMapbake)

    world.sceneComponentRegistry.delete(EnvMapBakeComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_ENVMAP_BAKE)

    /**
     * Objects
     */

    world.scenePrefabRegistry.delete(ScenePrefabs.model)

    world.sceneComponentRegistry.delete(ModelComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_MODEL)

    world.sceneComponentRegistry.delete(EnvmapComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_ENVMAP)

    world.sceneComponentRegistry.delete(ScreenshareTargetComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_SCREENSHARETARGET)

    world.scenePrefabRegistry.delete(ScenePrefabs.group)

    world.sceneComponentRegistry.delete(GroupComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_GROUP)

    world.scenePrefabRegistry.delete(ScenePrefabs.groundPlane)

    world.sceneComponentRegistry.delete(GroundPlaneComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_GROUND_PLANE)

    world.scenePrefabRegistry.delete(ScenePrefabs.image)

    world.sceneComponentRegistry.delete(ImageComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_IMAGE)

    world.sceneComponentRegistry.delete(LoopAnimationComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_LOOP_ANIMATION)

    world.scenePrefabRegistry.delete(ScenePrefabs.cloud)

    world.sceneComponentRegistry.delete(CloudComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_CLOUD)
    world.scenePrefabRegistry.delete(ScenePrefabs.ocean)

    world.sceneComponentRegistry.delete(OceanComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_OCEAN)
    world.scenePrefabRegistry.delete(ScenePrefabs.water)

    world.sceneComponentRegistry.delete(WaterComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_WATER)

    world.scenePrefabRegistry.delete(ScenePrefabs.interior)

    world.sceneComponentRegistry.delete(InteriorComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_INTERIOR)

    world.scenePrefabRegistry.delete(ScenePrefabs.spline)

    world.sceneComponentRegistry.delete(SplineComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_SPLINE)

    world.scenePrefabRegistry.delete(ScenePrefabs.particleEmitter)
    world.sceneComponentRegistry.delete(ParticleSystemComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_PARTICLE_SYSTEM)

    removeQuery(world, envmapQuery)
    removeQuery(world, imageQuery)
    removeQuery(world, sceneEnvmapQuery)
    removeQuery(world, loopableAnimationQuery)
    removeQuery(world, skyboxQuery)
    removeQuery(world, portalQuery)
    removeQuery(world, modelQuery)
    removeQuery(world, groundPlaneQuery)
    removeQuery(world, cloudQuery)
    removeQuery(world, oceanQuery)
    removeQuery(world, interiorQuery)
    removeQuery(world, scenePreviewCameraQuery)

    removeActionQueue(modifyPropertyActionQueue)
  }

  return { execute, cleanup }
}
