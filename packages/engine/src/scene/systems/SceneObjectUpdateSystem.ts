import { Not } from 'bitecs'
import { Color } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import {
  LoopAnimationComponent,
  SCENE_COMPONENT_LOOP_ANIMATION,
  SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE
} from '../../avatar/components/LoopAnimationComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import {
  AssetComponent,
  SCENE_COMPONENT_ASSET,
  SCENE_COMPONENT_ASSET_DEFAULT_VALUES
} from '../components/AssetComponent'
import {
  CameraPropertiesComponent,
  SCENE_COMPONENT_CAMERA_PROPERTIES,
  SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES
} from '../components/CameraPropertiesComponent'
import {
  CloudComponent,
  SCENE_COMPONENT_CLOUD,
  SCENE_COMPONENT_CLOUD_DEFAULT_VALUES
} from '../components/CloudComponent'
import {
  EnvMapBakeComponent,
  SCENE_COMPONENT_ENVMAP_BAKE,
  SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES
} from '../components/EnvMapBakeComponent'
import {
  EnvmapComponent,
  SCENE_COMPONENT_ENVMAP,
  SCENE_COMPONENT_ENVMAP_DEFAULT_VALUES
} from '../components/EnvmapComponent'
import {
  GroundPlaneComponent,
  SCENE_COMPONENT_GROUND_PLANE,
  SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES
} from '../components/GroundPlaneComponent'
import { addObjectToGroup, GroupComponent, SCENE_COMPONENT_GROUP } from '../components/GroupComponent'
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
  PortalComponent,
  SCENE_COMPONENT_PORTAL,
  SCENE_COMPONENT_PORTAL_COLLIDER_VALUES,
  SCENE_COMPONENT_PORTAL_DEFAULT_VALUES
} from '../components/PortalComponent'
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
import {
  SCENE_COMPONENT_SKYBOX,
  SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES,
  SkyboxComponent
} from '../components/SkyboxComponent'
import {
  SCENE_COMPONENT_SPAWN_POINT,
  SCENE_COMPONENT_SPAWN_POINT_DEFAULT_DATA,
  SpawnPointComponent
} from '../components/SpawnPointComponent'
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
import { FogType } from '../constants/FogType'
import { deserializeAsset, serializeAsset } from '../functions/loaders/AssetComponentFunctions'
import { deserializeCameraProperties, updateCameraProperties } from '../functions/loaders/CameraPropertiesFunctions'
import { deserializeCloud, serializeCloud, updateCloud } from '../functions/loaders/CloudFunctions'
import { deserializeEnvMapBake, serializeEnvMapBake } from '../functions/loaders/EnvMapBakeFunctions'
import { deserializeEnvMap, serializeEnvMap, updateEnvMap } from '../functions/loaders/EnvMapFunctions'
import {
  deserializeGround,
  serializeGroundPlane,
  shouldDeserializeGroundPlane,
  updateGroundPlane
} from '../functions/loaders/GroundPlaneFunctions'
import { deserializeGroup } from '../functions/loaders/GroupFunctions'
import { deserializeImage, enterImage, serializeImage } from '../functions/loaders/ImageFunctions'
import { deserializeInterior, serializeInterior, updateInterior } from '../functions/loaders/InteriorFunctions'
import { serializeLoopAnimation, updateLoopAnimation } from '../functions/loaders/LoopAnimationFunctions'
import { deserializeModel, serializeModel } from '../functions/loaders/ModelFunctions'
import { deserializeOcean, serializeOcean, updateOcean } from '../functions/loaders/OceanFunctions'
import { deserializePortal, serializePortal, updatePortal } from '../functions/loaders/PortalFunctions'
import {
  enterScenePreviewCamera,
  serializeScenePreviewCamera,
  shouldDeserializeScenePreviewCamera
} from '../functions/loaders/ScenePreviewCameraFunctions'
import { updateShadow } from '../functions/loaders/ShadowFunctions'
import {
  deserializeSkybox,
  serializeSkybox,
  shouldDeserializeSkybox,
  updateSkybox
} from '../functions/loaders/SkyboxFunctions'
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
  cameraProperties: 'Camera Properties' as const,
  particleEmitter: 'Particle Emitter' as const,
  portal: 'Portal' as const,
  chair: 'Chair' as const,
  previewCamera: 'Preview Camera' as const,
  skybox: 'Skybox' as const,
  spawnPoint: 'Spawn Point' as const,
  group: 'Group' as const,
  asset: 'Asset' as const,
  image: 'Image' as const,
  cloud: 'Cloud' as const,
  water: 'Water' as const,
  ocean: 'Ocean' as const,
  interior: 'Interior' as const,
  system: 'System' as const,
  spline: 'Spline' as const,
  envMapbake: 'EnvMap Bake' as const,
  instancing: 'Instancing' as const,
  loadVolume: 'Load Volume' as const
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

  world.scenePrefabRegistry.set(ScenePrefabs.cameraProperties, [
    { name: SCENE_COMPONENT_CAMERA_PROPERTIES, props: SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(CameraPropertiesComponent.name, SCENE_COMPONENT_CAMERA_PROPERTIES)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_CAMERA_PROPERTIES, {
    deserialize: deserializeCameraProperties
  })

  world.scenePrefabRegistry.set(ScenePrefabs.previewCamera, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, props: true }
  ])

  world.sceneComponentRegistry.set(ScenePreviewCameraComponent.name, SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, {
    shouldDeserialize: shouldDeserializeScenePreviewCamera,
    serialize: serializeScenePreviewCamera
  })

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
    defaultData: SCENE_COMPONENT_SPAWN_POINT_DEFAULT_DATA
  })

  /**
   * Assets
   */

  world.scenePrefabRegistry.set(ScenePrefabs.asset, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_ASSET, props: SCENE_COMPONENT_ASSET_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(AssetComponent.name, SCENE_COMPONENT_ASSET)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ASSET, {
    defaultData: SCENE_COMPONENT_ASSET_DEFAULT_VALUES,
    deserialize: deserializeAsset,
    serialize: serializeAsset
  })

  /**
   * Portals
   */

  world.scenePrefabRegistry.set(ScenePrefabs.portal, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PORTAL, props: SCENE_COMPONENT_PORTAL_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(PortalComponent.name, SCENE_COMPONENT_PORTAL)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PORTAL, {
    deserialize: deserializePortal,
    serialize: serializePortal
  })

  /**
   * Environment
   */

  world.scenePrefabRegistry.set(ScenePrefabs.skybox, [
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_SKYBOX, props: SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(SkyboxComponent.name, SCENE_COMPONENT_SKYBOX)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SKYBOX, {
    defaultData: SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES,
    deserialize: deserializeSkybox,
    serialize: serializeSkybox,
    shouldDeserialize: shouldDeserializeSkybox
  })

  world.scenePrefabRegistry.set(ScenePrefabs.envMapbake, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_ENVMAP_BAKE, props: SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(EnvMapBakeComponent.name, SCENE_COMPONENT_ENVMAP_BAKE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP_BAKE, {
    defaultData: SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES,
    deserialize: deserializeEnvMapBake,
    serialize: serializeEnvMapBake
  })

  /**
   * Objects
   */

  world.scenePrefabRegistry.set(ScenePrefabs.model, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MODEL, props: {} },
    { name: SCENE_COMPONENT_ENVMAP, props: SCENE_COMPONENT_ENVMAP_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_LOOP_ANIMATION, props: SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE }
  ])

  world.sceneComponentRegistry.set(ModelComponent.name, SCENE_COMPONENT_MODEL)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MODEL, {
    defaultData: {},
    deserialize: deserializeModel,
    serialize: serializeModel
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
    serialize: serializeGroundPlane,
    shouldDeserialize: shouldDeserializeGroundPlane
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
    defaultData: {},
    deserialize: deserializeImage,
    serialize: serializeImage
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

  const cameraQuery = defineQuery([CameraComponent])
  const obj3dQuery = defineQuery([GroupComponent])
  const shadowQuery = defineQuery([GroupComponent, ShadowComponent])
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
  const cameraPropertiesQuery = defineQuery([CameraPropertiesComponent, FollowCameraComponent, CameraComponent])
  const scenePreviewCameraQuery = defineQuery([ScenePreviewCameraComponent])

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  const execute = () => {
    for (const entity of obj3dQuery())
      for (const obj of getComponent(entity, GroupComponent)) obj.visible = hasComponent(entity, VisibleComponent)

    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, ShadowComponent) && hasComponent(entity, GroupComponent)) updateShadow(entity)
        if (hasComponent(entity, EnvmapComponent) && hasComponent(entity, GroupComponent)) updateEnvMap(entity)
        if (hasComponent(entity, SkyboxComponent)) updateSkybox(entity)
        if (hasComponent(entity, PortalComponent)) updatePortal(entity)
        if (hasComponent(entity, GroundPlaneComponent)) updateGroundPlane(entity)
        if (hasComponent(entity, LoopAnimationComponent)) updateLoopAnimation(entity)
        if (hasComponent(entity, CloudComponent)) updateCloud(entity)
        if (hasComponent(entity, OceanComponent)) updateOcean(entity)
        if (hasComponent(entity, InteriorComponent)) updateInterior(entity)
        if (hasComponent(entity, CameraPropertiesComponent)) updateCameraProperties(entity)
      }
    }

    for (const entity of cameraQuery.enter()) addObjectToGroup(entity, getComponent(entity, CameraComponent).camera)
    for (const entity of imageQuery.enter()) enterImage(entity)
    for (const entity of shadowQuery.enter()) updateShadow(entity)
    for (const entity of envmapQuery.enter()) updateEnvMap(entity)
    for (const entity of loopableAnimationQuery.enter()) updateLoopAnimation(entity)
    for (const entity of skyboxQuery.enter()) updateSkybox(entity)
    for (const _ of skyboxQuery.exit()) Engine.instance.currentWorld.scene.background = new Color('black')
    for (const entity of portalQuery.enter()) updatePortal(entity)
    for (const entity of groundPlaneQuery.enter()) updateGroundPlane(entity)
    for (const entity of cloudQuery.enter()) updateCloud(entity)
    for (const entity of oceanQuery.enter()) updateOcean(entity)
    for (const entity of interiorQuery.enter()) updateInterior(entity)
    for (const entity of cameraPropertiesQuery.enter()) updateCameraProperties(entity)
    for (const entity of scenePreviewCameraQuery.enter()) enterScenePreviewCamera(entity)
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

    world.scenePrefabRegistry.delete(ScenePrefabs.cameraProperties)

    world.sceneComponentRegistry.delete(CameraPropertiesComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_CAMERA_PROPERTIES)

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

    world.scenePrefabRegistry.delete(ScenePrefabs.asset)

    world.sceneComponentRegistry.delete(AssetComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_ASSET)

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

    removeQuery(world, cameraQuery)
    removeQuery(world, obj3dQuery)
    removeQuery(world, shadowQuery)
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
    removeQuery(world, cameraPropertiesQuery)
    removeQuery(world, scenePreviewCameraQuery)

    removeActionQueue(modifyPropertyActionQueue)
  }

  return { execute, cleanup }
}
