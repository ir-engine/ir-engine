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
import { SCENE_COMPONENT_SPOT_LIGHT, SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES } from './loaders/SpotLightFunctions'
import { SCENE_COMPONENT_LINK, SCENE_COMPONENT_LINK_DEFAULT_VALUES } from './loaders/LinkFunctions'
import {
  SCENE_COMPONENT_PARTICLE_EMITTER,
  SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES
} from './loaders/ParticleEmitterFunctions'
import {
  SCENE_COMPONENT_CAMERA_PROPERTIES,
  SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES
} from './loaders/CameraPropertiesFunctions'
import { SCENE_COMPONENT_PORTAL, SCENE_COMPONENT_PORTAL_DEFAULT_VALUES } from './loaders/PortalFunctions'
import {
  SCENE_COMPONENT_TRIGGER_VOLUME,
  SCENE_COMPONENT_TRIGGER_VOLUME_DEFAULT_VALUES
} from './loaders/TriggerVolumeFunctions'
import {
  SCENE_COMPONENT_BOX_COLLIDER,
  SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES
} from './loaders/BoxColliderFunctions'
import { SCENE_COMPONENT_IMAGE, SCENE_COMPONENT_IMAGE_DEFAULT_VALUES } from './loaders/ImageFunctions'
import { SCENE_COMPONENT_AUDIO, SCENE_COMPONENT_AUDIO_DEFAULT_VALUES } from './loaders/AudioFunctions'
import { SCENE_COMPONENT_VIDEO, SCENE_COMPONENT_VIDEO_DEFAULT_VALUES } from './loaders/VideoFunctions'
import { SCENE_COMPONENT_MEDIA, SCENE_COMPONENT_MEDIA_DEFAULT_VALUES } from './loaders/MediaFunctions'
import {
  SCENE_COMPONENT_INTERACTABLE,
  SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES
} from './loaders/InteractableFunctions'
import { SCENE_COMPONENT_VOLUMETRIC, SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES } from './loaders/VolumetricFunctions'
import { SCENE_COMPONENT_CLOUD, SCENE_COMPONENT_CLOUD_DEFAULT_VALUES } from './loaders/CloudFunctions'
import { SCENE_COMPONENT_OCEAN, SCENE_COMPONENT_OCEAN_DEFAULT_VALUES } from './loaders/OceanFunctions'
import { SCENE_COMPONENT_WATER, SCENE_COMPONENT_WATER_DEFAULT_VALUES } from './loaders/WaterFunctions'
import { SCENE_COMPONENT_INTERIOR, SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES } from './loaders/InteriorFunctions'
import { SCENE_COMPONENT_SYSTEM, SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES } from './loaders/SystemFunctions'
import { SCENE_COMPONENT_SPLINE, SCENE_COMPONENT_SPLINE_DEFAULT_VALUES } from './loaders/SplineFunctions'
import {
  SCENE_COMPONENT_CUBEMAP_BAKE,
  SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES
} from './loaders/CubemapBakeFunctions'

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
  portal: 'Portal' as const,
  triggerVolume: 'Trigger Volume' as const,
  boxCollider: 'Box Collider' as const,
  postProcessing: 'Post Processing' as const,
  previewCamera: 'Preview Camera' as const,
  skybox: 'Skybox' as const,
  spawnPoint: 'Spawn Point' as const,
  group: 'Group' as const,
  image: 'Image' as const,
  audio: 'Audio' as const,
  video: 'Video' as const,
  volumetric: 'Volumetric' as const,
  cloud: 'Cloud' as const,
  water: 'Water' as const,
  ocean: 'Ocean' as const,
  interior: 'Interior' as const,
  system: 'System' as const,
  spline: 'Spline' as const,
  cubemapbake: 'CubemapBake' as const
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
    { name: SCENE_COMPONENT_LOOP_ANIMATION, props: SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE },
    { name: SCENE_COMPONENT_INTERACTABLE, props: SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES }
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

  world.scenePrefabRegistry.set(ScenePrefabs.portal, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PORTAL, props: SCENE_COMPONENT_PORTAL_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_TRIGGER_VOLUME, props: SCENE_COMPONENT_TRIGGER_VOLUME_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.triggerVolume, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_TRIGGER_VOLUME, props: SCENE_COMPONENT_TRIGGER_VOLUME_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.boxCollider, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_BOX_COLLIDER, props: SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.image, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_IMAGE, props: SCENE_COMPONENT_IMAGE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_INTERACTABLE, props: SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.audio, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_AUDIO, props: SCENE_COMPONENT_AUDIO_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_MEDIA, props: SCENE_COMPONENT_MEDIA_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_INTERACTABLE, props: SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.video, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_VIDEO, props: SCENE_COMPONENT_VIDEO_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_AUDIO, props: SCENE_COMPONENT_AUDIO_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_IMAGE, props: SCENE_COMPONENT_IMAGE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_MEDIA, props: SCENE_COMPONENT_MEDIA_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_INTERACTABLE, props: SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.volumetric, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_VOLUMETRIC, props: SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_AUDIO, props: SCENE_COMPONENT_AUDIO_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_MEDIA, props: SCENE_COMPONENT_MEDIA_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_INTERACTABLE, props: SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.cloud, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_CLOUD, props: SCENE_COMPONENT_CLOUD_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.ocean, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_OCEAN, props: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.water, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_WATER, props: SCENE_COMPONENT_WATER_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.interior, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_INTERIOR, props: SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(ScenePrefabs.system, [
    { name: SCENE_COMPONENT_SYSTEM, props: SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES }
  ])

  // world.scenePrefabRegistry.set(ScenePrefabs.spline, [
  //   ...defaultSpatialComponents,
  //   { name: SCENE_COMPONENT_SPLINE, props: SCENE_COMPONENT_SPLINE_DEFAULT_VALUES }
  // ])

  world.scenePrefabRegistry.set(ScenePrefabs.cubemapbake, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_CUBEMAP_BAKE, props: SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES }
  ])
}
