import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { World } from '../../ecs/classes/World'
import {
  SCENE_COMPONENT_AMBIENT_LIGHT,
  SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES
} from './loaders/AmbientLightFunctions'
import {
  SCENE_COMPONENT_DIRECTIONAL_LIGHT,
  SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES
} from './loaders/DirectionalLightFunctions'
import {
  SCENE_COMPONENT_GROUND_PLANE,
  SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES
} from './loaders/GroundPlaneFunctions'
import { SCENE_COMPONENT_GROUP, SCENE_COMPONENT_GROUP_DEFAULT_VALUES } from './loaders/GroupFunctions'
import {
  SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES,
  SCENE_COMPONENT_HEMISPHERE_LIGHT
} from './loaders/HemisphereLightFunctions'
import {
  SCENE_COMPONENT_PREVENT_BAKE,
  SCENE_COMPONENT_PREVENT_BAKE_DEFAULT_VALUES
} from './loaders/PreventBakeFunctions'
import { SCENE_COMPONENT_MODEL, SCENE_COMPONENT_MODEL_DEFAULT_VALUE } from './loaders/ModelFunctions'
import {
  SCENE_COMPONENT_POSTPROCESSING,
  SCENE_COMPONENT_POSTPROCESSING_DEFAULT_VALUES
} from './loaders/PostprocessingFunctions'
import {
  SCENE_COMPONENT_SCENE_PREVIEW_CAMERA,
  SCENE_COMPONENT_SCENE_PREVIEW_CAMERA_DEFAULT_VALUES
} from './loaders/ScenePreviewCameraFunctions'
import { SCENE_COMPONENT_SHADOW, SCENE_COMPONENT_SHADOW_DEFAULT_VALUES } from './loaders/ShadowFunctions'
import { SCENE_COMPONENT_SKYBOX, SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES } from './loaders/SkyboxFunctions'
import { SCENE_COMPONENT_SPAWN_POINT, SCENE_COMPONENT_SPAWN_POINT_DEFAULT_VALUES } from './loaders/SpawnPointFunctions'
import { SCENE_COMPONENT_TRANSFORM, SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES } from './loaders/TransformFunctions'
import { SCENE_COMPONENT_VISIBLE, SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES } from './loaders/VisibleFunctions'
import {
  SCENE_COMPONENT_LOOP_ANIMATION,
  SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE
} from './loaders/LoopAnimationFunctions'
import { SCENE_COMPONENT_POINT_LIGHT, SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES } from './loaders/PointLightFunctions'
import { SCENE_COMPONENT_SPOT_LIGHT, SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES } from './loaders/StopLightFunctions'
import { SCENE_COMPONENT_LINK, SCENE_COMPONENT_LINK_DEFAULT_VALUES } from './loaders/LinkFunctions'
import {
  SCENE_COMPONENT_PARTICLE_EMITTER,
  SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES
} from './loaders/ParticleEmitterFunctions'
import {
  SCENE_COMPONENT_CAMERA_PROPERTIES,
  SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES
} from './loaders/CameraPropertiesFunctions'

export const ScenePrefabs = {
  directionalLight: 'Directional Light' as const,
  groundPlane: 'Ground Plane' as const,
  hemisphereLight: 'Hemisphere Light' as const,
  ambientLight: 'Ambient Light' as const,
  pointLight: 'Point Light' as const,
  spotLight: 'Spot Light' as const,
  metadata: 'Metadata' as const,
  model: 'Model' as const,
  link: 'Link' as const,
  cameraProperties: 'Camera Properties' as const,
  particleEmitter: 'Particle Emitter' as const,
  postProcessing: 'Post Processing' as const,
  previewCamera: 'Preview Camera' as const,
  skybox: 'Skybox' as const,
  spawnPoint: 'Spawn Point' as const,
  group: 'Group' as const
}

export type ScenePrefabTypes = typeof ScenePrefabs[keyof typeof ScenePrefabs]

export const defaultSpatialComponents: ComponentJson[] = [
  { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
  { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
  { name: SCENE_COMPONENT_SHADOW, props: SCENE_COMPONENT_SHADOW_DEFAULT_VALUES }
]

export const registerPrefabs = (world: World) => {
  world.scenePrefabRegistry.set(ScenePrefabs.directionalLight, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_DIRECTIONAL_LIGHT, props: SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.hemisphereLight, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_HEMISPHERE_LIGHT, props: SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.ambientLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_AMBIENT_LIGHT, props: SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.pointLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_POINT_LIGHT, props: SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.spotLight, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_SPOT_LIGHT, props: SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.group, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_GROUP, props: SCENE_COMPONENT_GROUP_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.groundPlane, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_GROUND_PLANE, props: SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.postProcessing, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_POSTPROCESSING, props: SCENE_COMPONENT_POSTPROCESSING_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_PREVENT_BAKE, props: SCENE_COMPONENT_PREVENT_BAKE_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.previewCamera, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, props: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.skybox, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_SKYBOX, props: SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.spawnPoint, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_SPAWN_POINT, props: SCENE_COMPONENT_SPAWN_POINT_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.model, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MODEL, props: SCENE_COMPONENT_MODEL_DEFAULT_VALUE },
    { name: SCENE_COMPONENT_LOOP_ANIMATION, props: SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.link, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_LINK, props: SCENE_COMPONENT_LINK_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.particleEmitter, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PARTICLE_EMITTER, props: SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.cameraProperties, [
    { name: SCENE_COMPONENT_CAMERA_PROPERTIES, props: SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES }
  ])
}
