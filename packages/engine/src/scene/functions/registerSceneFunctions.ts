import { AudioComponent } from '../../audio/components/AudioComponent'
import { LoopAnimationComponent } from '../../avatar/components/LoopAnimationComponent'
import { World } from '../../ecs/classes/World'
import { EquippableComponent } from '../../interaction/components/EquippableComponent'
import { InteractableComponent } from '../../interaction/components/InteractableComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AmbientLightComponent } from '../components/AmbientLightComponent'
import { AssetComponent } from '../components/AssetComponent'
import { PositionalAudioSettingsComponent } from '../components/AudioSettingsComponent'
import { BoxColliderComponent } from '../components/BoxColliderComponent'
import { CameraPropertiesComponent } from '../components/CameraPropertiesComponent'
import { CloudComponent } from '../components/CloudComponent'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { FogComponent } from '../components/FogComponent'
import { GroundPlaneComponent } from '../components/GroundPlaneComponent'
import { GroupComponent } from '../components/GroupComponent'
import { HemisphereLightComponent } from '../components/HemisphereLightComponent'
import { ImageComponent } from '../components/ImageComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { InteriorComponent } from '../components/InteriorComponent'
import { MediaComponent } from '../components/MediaComponent'
import { ModelComponent } from '../components/ModelComponent'
import { MountPointComponent } from '../components/MountPointComponent'
import { OceanComponent } from '../components/OceanComponent'
import { ParticleEmitterComponent } from '../components/ParticleEmitterComponent'
import { PointLightComponent } from '../components/PointLightComponent'
import { PortalComponent } from '../components/PortalComponent'
import { PostprocessingComponent } from '../components/PostprocessingComponent'
import { PreventBakeTagComponent } from '../components/PreventBakeTagComponent'
import { RenderSettingComponent } from '../components/RenderSettingComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { ScenePreviewCameraTagComponent } from '../components/ScenePreviewCamera'
import { ScreenshareTargetComponent } from '../components/ScreenshareTargetComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { SimpleMaterialTagComponent } from '../components/SimpleMaterialTagComponent'
import { SkyboxComponent } from '../components/SkyboxComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { SplineComponent } from '../components/SplineComponent'
import { SpotLightComponent } from '../components/SpotLightComponent'
import { SystemComponent } from '../components/SystemComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'
import { VideoComponent } from '../components/VideoComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { VolumetricComponent } from '../components/VolumetricComponent'
import { WaterComponent } from '../components/WaterComponent'
import {
  deserializeAmbientLight,
  SCENE_COMPONENT_AMBIENT_LIGHT,
  serializeAmbientLight,
  shouldDeserializeAmbientLight,
  updateAmbientLight
} from './loaders/AmbientLightFunctions'
import { deserializeAsset, SCENE_COMPONENT_ASSET, serializeAsset } from './loaders/AssetComponentFunctions'
import { deserializeAudio, SCENE_COMPONENT_AUDIO, serializeAudio } from './loaders/AudioFunctions'
import {
  deserializeAudioSetting,
  SCENE_COMPONENT_AUDIO_SETTINGS,
  serializeAudioSetting
} from './loaders/AudioSettingFunctions'
import {
  deserializeBoxCollider,
  SCENE_COMPONENT_BOX_COLLIDER,
  serializeBoxCollider,
  updateBoxCollider
} from './loaders/BoxColliderFunctions'
import {
  deserializeCameraProperties,
  SCENE_COMPONENT_CAMERA_PROPERTIES,
  serializeCameraProperties
} from './loaders/CameraPropertiesFunctions'
import { deserializeCloud, SCENE_COMPONENT_CLOUD, serializeCloud, updateCloud } from './loaders/CloudFunctions'
import { deserializeCollider, SCENE_COMPONENT_COLLIDER, serializeCollider } from './loaders/ColliderFunctions'
import {
  deserializeDirectionalLight,
  SCENE_COMPONENT_DIRECTIONAL_LIGHT,
  serializeDirectionalLight,
  updateDirectionalLight
} from './loaders/DirectionalLightFunctions'
import {
  deserializeDynamicLoad,
  SCENE_COMPONENT_DYNAMIC_LOAD,
  serializeDynamicLoad
} from './loaders/DynamicLoadFunctions'
import { deserializeEnvMapBake, SCENE_COMPONENT_ENVMAP_BAKE, serializeEnvMapBake } from './loaders/EnvMapBakeFunctions'
import { deserializeEnvMap, SCENE_COMPONENT_ENVMAP, serializeEnvMap } from './loaders/EnvMapFunctions'
import { deserializeEquippable, SCENE_COMPONENT_EQUIPPABLE, serializeEquippable } from './loaders/EquippableFunctions'
import {
  deserializeFog,
  SCENE_COMPONENT_FOG,
  serializeFog,
  shouldDeserializeFog,
  updateFog
} from './loaders/FogFunctions'
import {
  deserializeGround,
  prepareGroundPlaneForGLTFExport,
  SCENE_COMPONENT_GROUND_PLANE,
  serializeGroundPlane,
  shouldDeserializeGroundPlane,
  updateGroundPlane
} from './loaders/GroundPlaneFunctions'
import { deserializeGroup, SCENE_COMPONENT_GROUP, serializeGroup } from './loaders/GroupFunctions'
import {
  deserializeHemisphereLight,
  SCENE_COMPONENT_HEMISPHERE_LIGHT,
  serializeHemisphereLight,
  shouldDeserializeHemisphereLight,
  updateHemisphereLight
} from './loaders/HemisphereLightFunctions'
import {
  deserializeImage,
  prepareImageForGLTFExport,
  SCENE_COMPONENT_IMAGE,
  serializeImage,
  updateImage
} from './loaders/ImageFunctions'
import { deserializeInstancing, SCENE_COMPONENT_INSTANCING, serializeInstancing } from './loaders/InstancingFunctions'
import {
  deserializeInteractable,
  SCENE_COMPONENT_INTERACTABLE,
  serializeInteractable
} from './loaders/InteractableFunctions'
import {
  deserializeInterior,
  SCENE_COMPONENT_INTERIOR,
  serializeInterior,
  updateInterior
} from './loaders/InteriorFunctions'
import {
  deserializeLoopAnimation,
  SCENE_COMPONENT_LOOP_ANIMATION,
  serializeLoopAnimation,
  updateLoopAnimation
} from './loaders/LoopAnimationFunctions'
import { deserializeMedia, SCENE_COMPONENT_MEDIA, serializeMedia } from './loaders/MediaFunctions'
import { deserializeModel, SCENE_COMPONENT_MODEL, serializeModel, updateModel } from './loaders/ModelFunctions'
import { deserializeMountPoint, SCENE_COMPONENT_MOUNT_POINT, serializeMountPoint } from './loaders/MountPointFunctions'
import { deserializeOcean, SCENE_COMPONENT_OCEAN, serializeOcean, updateOcean } from './loaders/OceanFunctions'
import {
  deserializeParticleEmitter,
  SCENE_COMPONENT_PARTICLE_EMITTER,
  serializeParticleEmitter,
  updateParticleEmitter
} from './loaders/ParticleEmitterFunctions'
import {
  deserializePointLight,
  SCENE_COMPONENT_POINT_LIGHT,
  serializePointLight,
  updatePointLight
} from './loaders/PointLightFunctions'
import { deserializePortal, SCENE_COMPONENT_PORTAL, serializePortal } from './loaders/PortalFunctions'
import {
  deserializePostprocessing,
  SCENE_COMPONENT_POSTPROCESSING,
  serializePostprocessing,
  shouldDeserializePostprocessing,
  updatePostprocessing
} from './loaders/PostprocessingFunctions'
import {
  deserializePreventBake,
  SCENE_COMPONENT_PREVENT_BAKE,
  serializePreventBake
} from './loaders/PreventBakeFunctions'
import {
  deserializeRenderSetting,
  SCENE_COMPONENT_RENDERER_SETTINGS,
  serializeRenderSettings,
  updateRenderSetting
} from './loaders/RenderSettingsFunction'
import {
  deserializeScenePreviewCamera,
  SCENE_COMPONENT_SCENE_PREVIEW_CAMERA,
  serializeScenePreviewCamera,
  shouldDeserializeScenePreviewCamera,
  updateScenePreviewCamera
} from './loaders/ScenePreviewCameraFunctions'
import {
  deserializeScreenshareTarget,
  SCENE_COMPONENT_SCREENSHARETARGET,
  serializeScreenshareTarget
} from './loaders/ScreenshareTargetFunctions'
import { deserializeShadow, SCENE_COMPONENT_SHADOW, serializeShadow, updateShadow } from './loaders/ShadowFunctions'
import {
  deserializeSimpleMaterial,
  SCENE_COMPONENT_SIMPLE_MATERIALS,
  serializeSimpleMaterial
} from './loaders/SimpleMaterialFunctions'
import {
  deserializeSkybox,
  SCENE_COMPONENT_SKYBOX,
  serializeSkybox,
  shouldDeserializeSkybox,
  updateSkybox
} from './loaders/SkyboxFunctions'
import { deserializeSpawnPoint, SCENE_COMPONENT_SPAWN_POINT, serializeSpawnPoint } from './loaders/SpawnPointFunctions'
import { deserializeSpline, SCENE_COMPONENT_SPLINE, serializeSpline } from './loaders/SplineFunctions'
import {
  deserializeSpotLight,
  SCENE_COMPONENT_SPOT_LIGHT,
  serializeSpotLight,
  updateSpotLight
} from './loaders/SpotLightFunctions'
import { deserializeSystem, SCENE_COMPONENT_SYSTEM, serializeSystem, updateSystem } from './loaders/SystemFunctions'
import { deserializeTransform, SCENE_COMPONENT_TRANSFORM, serializeTransform } from './loaders/TransformFunctions'
import {
  deserializeTriggerVolume,
  SCENE_COMPONENT_TRIGGER_VOLUME,
  serializeTriggerVolume,
  updateTriggerVolume
} from './loaders/TriggerVolumeFunctions'
import {
  deserializeVideo,
  prepareVideoForGLTFExport,
  SCENE_COMPONENT_VIDEO,
  serializeVideo
} from './loaders/VideoFunctions'
import { deserializeVisible, SCENE_COMPONENT_VISIBLE, serializeVisible } from './loaders/VisibleFunctions'
import {
  deserializeVolumetric,
  prepareVolumetricForGLTFExport,
  SCENE_COMPONENT_VOLUMETRIC,
  serializeVolumetric,
  updateVolumetric
} from './loaders/VolumetricFunctions'
import { deserializeWater, SCENE_COMPONENT_WATER, serializeWater, updateWater } from './loaders/WaterFunctions'

// TODO: split this into respective modules when we modularise the engine content

export const registerDefaultSceneFunctions = (world: World) => {
  /** BASE NODE INTERNALS */

  /** @todo: merge sceneComponentRegistry and sceneLoadingRegistry when scene loader IDs use XRE_ extension names*/

  world.sceneComponentRegistry.set(TransformComponent, SCENE_COMPONENT_TRANSFORM)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_TRANSFORM, {
    deserialize: deserializeTransform,
    serialize: serializeTransform
  })

  world.sceneComponentRegistry.set(SceneDynamicLoadTagComponent, SCENE_COMPONENT_DYNAMIC_LOAD)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DYNAMIC_LOAD, {
    deserialize: deserializeDynamicLoad,
    serialize: serializeDynamicLoad
  })

  world.sceneComponentRegistry.set(VisibleComponent, SCENE_COMPONENT_VISIBLE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VISIBLE, {
    deserialize: deserializeVisible,
    serialize: serializeVisible
  })

  world.sceneComponentRegistry.set(ShadowComponent, SCENE_COMPONENT_SHADOW)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SHADOW, {
    deserialize: deserializeShadow,
    serialize: serializeShadow,
    update: updateShadow
  })

  world.sceneComponentRegistry.set(PreventBakeTagComponent, SCENE_COMPONENT_PREVENT_BAKE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PREVENT_BAKE, {
    deserialize: deserializePreventBake,
    serialize: serializePreventBake
  })

  /** SCENE NODE INTERNALS */

  world.sceneComponentRegistry.set(PositionalAudioSettingsComponent, SCENE_COMPONENT_AUDIO_SETTINGS)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AUDIO_SETTINGS, {
    deserialize: deserializeAudioSetting,
    serialize: serializeAudioSetting
  })

  world.sceneComponentRegistry.set(EnvmapComponent, SCENE_COMPONENT_ENVMAP)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP, {
    deserialize: deserializeEnvMap,
    serialize: serializeEnvMap
  })

  world.sceneComponentRegistry.set(FogComponent, SCENE_COMPONENT_FOG)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_FOG, {
    deserialize: deserializeFog,
    serialize: serializeFog,
    update: updateFog,
    shouldDeserialize: shouldDeserializeFog
  })

  world.sceneComponentRegistry.set(RenderSettingComponent, SCENE_COMPONENT_RENDERER_SETTINGS)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_RENDERER_SETTINGS, {
    deserialize: deserializeRenderSetting,
    serialize: serializeRenderSettings,
    update: updateRenderSetting
  })

  world.sceneComponentRegistry.set(SimpleMaterialTagComponent, SCENE_COMPONENT_SIMPLE_MATERIALS)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SIMPLE_MATERIALS, {
    deserialize: deserializeSimpleMaterial,
    serialize: serializeSimpleMaterial
  })

  /** NODES */

  world.sceneComponentRegistry.set(DirectionalLightComponent, SCENE_COMPONENT_DIRECTIONAL_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DIRECTIONAL_LIGHT, {
    deserialize: deserializeDirectionalLight,
    serialize: serializeDirectionalLight,
    update: updateDirectionalLight
  })

  world.sceneComponentRegistry.set(GroundPlaneComponent, SCENE_COMPONENT_GROUND_PLANE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUND_PLANE, {
    deserialize: deserializeGround,
    serialize: serializeGroundPlane,
    update: updateGroundPlane,
    shouldDeserialize: shouldDeserializeGroundPlane,
    prepareForGLTFExport: prepareGroundPlaneForGLTFExport
  })

  world.sceneComponentRegistry.set(HemisphereLightComponent, SCENE_COMPONENT_HEMISPHERE_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_HEMISPHERE_LIGHT, {
    deserialize: deserializeHemisphereLight,
    serialize: serializeHemisphereLight,
    update: updateHemisphereLight,
    shouldDeserialize: shouldDeserializeHemisphereLight
  })

  world.sceneComponentRegistry.set(AmbientLightComponent, SCENE_COMPONENT_AMBIENT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AMBIENT_LIGHT, {
    deserialize: deserializeAmbientLight,
    serialize: serializeAmbientLight,
    update: updateAmbientLight,
    shouldDeserialize: shouldDeserializeAmbientLight
  })

  world.sceneComponentRegistry.set(PointLightComponent, SCENE_COMPONENT_POINT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POINT_LIGHT, {
    deserialize: deserializePointLight,
    serialize: serializePointLight,
    update: updatePointLight
  })

  world.sceneComponentRegistry.set(SpotLightComponent, SCENE_COMPONENT_SPOT_LIGHT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPOT_LIGHT, {
    deserialize: deserializeSpotLight,
    serialize: serializeSpotLight,
    update: updateSpotLight
  })

  world.sceneComponentRegistry.set(PostprocessingComponent, SCENE_COMPONENT_POSTPROCESSING)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POSTPROCESSING, {
    deserialize: deserializePostprocessing,
    serialize: serializePostprocessing,
    update: updatePostprocessing,
    shouldDeserialize: shouldDeserializePostprocessing
  })

  world.sceneComponentRegistry.set(ScenePreviewCameraTagComponent, SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, {
    deserialize: deserializeScenePreviewCamera,
    serialize: serializeScenePreviewCamera,
    update: updateScenePreviewCamera,
    shouldDeserialize: shouldDeserializeScenePreviewCamera
  })

  world.sceneComponentRegistry.set(SkyboxComponent, SCENE_COMPONENT_SKYBOX)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SKYBOX, {
    deserialize: deserializeSkybox,
    serialize: serializeSkybox,
    update: updateSkybox,
    shouldDeserialize: shouldDeserializeSkybox
  })

  world.sceneComponentRegistry.set(SpawnPointComponent, SCENE_COMPONENT_SPAWN_POINT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPAWN_POINT, {
    deserialize: deserializeSpawnPoint,
    serialize: serializeSpawnPoint
  })

  world.sceneComponentRegistry.set(ModelComponent, SCENE_COMPONENT_MODEL)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MODEL, {
    deserialize: deserializeModel,
    serialize: serializeModel,
    update: updateModel
  })

  world.sceneComponentRegistry.set(GroupComponent, SCENE_COMPONENT_GROUP)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUP, {
    deserialize: deserializeGroup,
    serialize: serializeGroup
  })

  world.sceneComponentRegistry.set(AssetComponent, SCENE_COMPONENT_ASSET)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ASSET, {
    deserialize: deserializeAsset,
    serialize: serializeAsset
  })

  world.sceneComponentRegistry.set(LoopAnimationComponent, SCENE_COMPONENT_LOOP_ANIMATION)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_LOOP_ANIMATION, {
    deserialize: deserializeLoopAnimation,
    serialize: serializeLoopAnimation,
    update: updateLoopAnimation
  })

  world.sceneComponentRegistry.set(ParticleEmitterComponent, SCENE_COMPONENT_PARTICLE_EMITTER)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PARTICLE_EMITTER, {
    deserialize: deserializeParticleEmitter,
    serialize: serializeParticleEmitter,
    update: updateParticleEmitter
  })

  world.sceneComponentRegistry.set(CameraPropertiesComponent, SCENE_COMPONENT_CAMERA_PROPERTIES)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_CAMERA_PROPERTIES, {
    deserialize: deserializeCameraProperties,
    serialize: serializeCameraProperties
  })

  world.sceneComponentRegistry.set(PortalComponent, SCENE_COMPONENT_PORTAL)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PORTAL, {
    deserialize: deserializePortal,
    serialize: serializePortal
  })

  world.sceneComponentRegistry.set(TriggerVolumeComponent, SCENE_COMPONENT_TRIGGER_VOLUME)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_TRIGGER_VOLUME, {
    deserialize: deserializeTriggerVolume,
    serialize: serializeTriggerVolume,
    update: updateTriggerVolume
  })

  // this is only ever loaded by gltf user data, thus does not need a component registry pair
  // world.sceneComponentRegistry.set(, SCENE_COMPONENT_COLLIDER)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_COLLIDER, {
    deserialize: deserializeCollider,
    serialize: serializeCollider
  })

  world.sceneComponentRegistry.set(BoxColliderComponent, SCENE_COMPONENT_BOX_COLLIDER)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_BOX_COLLIDER, {
    deserialize: deserializeBoxCollider,
    serialize: serializeBoxCollider,
    update: updateBoxCollider
  })

  world.sceneComponentRegistry.set(ImageComponent, SCENE_COMPONENT_IMAGE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_IMAGE, {
    deserialize: deserializeImage,
    serialize: serializeImage,
    update: updateImage,
    prepareForGLTFExport: prepareImageForGLTFExport
  })

  world.sceneComponentRegistry.set(AudioComponent, SCENE_COMPONENT_AUDIO)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AUDIO, {
    deserialize: deserializeAudio,
    serialize: serializeAudio
  })

  world.sceneComponentRegistry.set(VideoComponent, SCENE_COMPONENT_VIDEO)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VIDEO, {
    deserialize: deserializeVideo,
    serialize: serializeVideo,
    prepareForGLTFExport: prepareVideoForGLTFExport
  })

  world.sceneComponentRegistry.set(MediaComponent, SCENE_COMPONENT_MEDIA)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MEDIA, {
    deserialize: deserializeMedia,
    serialize: serializeMedia
  })

  world.sceneComponentRegistry.set(InteractableComponent, SCENE_COMPONENT_INTERACTABLE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_INTERACTABLE, {
    deserialize: deserializeInteractable,
    serialize: serializeInteractable
  })

  world.sceneComponentRegistry.set(VolumetricComponent, SCENE_COMPONENT_VOLUMETRIC)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VOLUMETRIC, {
    deserialize: deserializeVolumetric,
    serialize: serializeVolumetric,
    update: updateVolumetric,
    prepareForGLTFExport: prepareVolumetricForGLTFExport
  })

  world.sceneComponentRegistry.set(CloudComponent, SCENE_COMPONENT_CLOUD)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_CLOUD, {
    deserialize: deserializeCloud,
    serialize: serializeCloud,
    update: updateCloud
  })

  world.sceneComponentRegistry.set(OceanComponent, SCENE_COMPONENT_OCEAN)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_OCEAN, {
    deserialize: deserializeOcean,
    serialize: serializeOcean,
    update: updateOcean
  })

  world.sceneComponentRegistry.set(WaterComponent, SCENE_COMPONENT_WATER)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_WATER, {
    deserialize: deserializeWater,
    serialize: serializeWater,
    update: updateWater
  })

  world.sceneComponentRegistry.set(InteriorComponent, SCENE_COMPONENT_INTERIOR)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_INTERIOR, {
    deserialize: deserializeInterior,
    serialize: serializeInterior,
    update: updateInterior
  })

  world.sceneComponentRegistry.set(SystemComponent, SCENE_COMPONENT_SYSTEM)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SYSTEM, {
    deserialize: deserializeSystem,
    serialize: serializeSystem,
    update: updateSystem
  })

  world.sceneComponentRegistry.set(SplineComponent, SCENE_COMPONENT_SPLINE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPLINE, {
    deserialize: deserializeSpline,
    serialize: serializeSpline
  })

  world.sceneComponentRegistry.set(EnvMapBakeComponent, SCENE_COMPONENT_ENVMAP_BAKE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP_BAKE, {
    deserialize: deserializeEnvMapBake,
    serialize: serializeEnvMapBake
  })

  world.sceneComponentRegistry.set(InstancingComponent, SCENE_COMPONENT_INSTANCING)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_INSTANCING, {
    deserialize: deserializeInstancing,
    serialize: serializeInstancing
  })

  world.sceneComponentRegistry.set(ScreenshareTargetComponent, SCENE_COMPONENT_SCREENSHARETARGET)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SCREENSHARETARGET, {
    deserialize: deserializeScreenshareTarget,
    serialize: serializeScreenshareTarget
  })

  world.sceneComponentRegistry.set(MountPointComponent, SCENE_COMPONENT_MOUNT_POINT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MOUNT_POINT, {
    deserialize: deserializeMountPoint,
    serialize: serializeMountPoint
  })

  world.sceneComponentRegistry.set(EquippableComponent, SCENE_COMPONENT_EQUIPPABLE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_EQUIPPABLE, {
    deserialize: deserializeEquippable,
    serialize: serializeEquippable
  })
}
