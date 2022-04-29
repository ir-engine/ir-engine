import { World } from '../../ecs/classes/World'
import {
  deserializeAmbientLight,
  SCENE_COMPONENT_AMBIENT_LIGHT,
  serializeAmbientLight,
  shouldDeserializeAmbientLight,
  updateAmbientLight
} from './loaders/AmbientLightFunctions'
import { deserializeAsset, SCENE_COMPONENT_ASSET, serializeAsset } from './loaders/AssetComponentFunctions'
import {
  deserializeAudio,
  prepareAudioForGLTFExport,
  SCENE_COMPONENT_AUDIO,
  serializeAudio,
  updateAudio
} from './loaders/AudioFunctions'
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
  deserializeCubemapBake,
  SCENE_COMPONENT_CUBEMAP_BAKE,
  serializeCubemapBake,
  updateCubemapBake
} from './loaders/CubemapBakeFunctions'
import {
  deserializeDirectionalLight,
  prepareDirectionalLightForGLTFExport,
  SCENE_COMPONENT_DIRECTIONAL_LIGHT,
  serializeDirectionalLight,
  updateDirectionalLight
} from './loaders/DirectionalLightFunctions'
import { deserializeEnvMap, SCENE_COMPONENT_ENVMAP, serializeEnvMap, updateEnvMap } from './loaders/EnvMapFunctions'
import { deserializeFog, SCENE_COMPONENT_FOG, serializeFog, updateFog } from './loaders/FogFunctions'
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
import {
  deserializeInteractable,
  SCENE_COMPONENT_INTERACTABLE,
  serializeInteractable,
  updateInteractable
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
import { deserializeMedia, SCENE_COMPONENT_MEDIA, serializeMedia, updateMedia } from './loaders/MediaFunctions'
import {
  deserializeMetaData,
  SCENE_COMPONENT_METADATA,
  serializeMetaData,
  updateMetaData
} from './loaders/MetaDataFunctions'
import { deserializeModel, SCENE_COMPONENT_MODEL, serializeModel, updateModel } from './loaders/ModelFunctions'
import { deserializeOcean, SCENE_COMPONENT_OCEAN, serializeOcean, updateOcean } from './loaders/OceanFunctions'
import {
  deserializeParticleEmitter,
  SCENE_COMPONENT_PARTICLE_EMITTER,
  serializeParticleEmitter,
  updateParticleEmitter
} from './loaders/ParticleEmitterFunctions'
import { deserializePersist, SCENE_COMPONENT_PERSIST, serializePersist } from './loaders/PersistFunctions'
import {
  deserializePointLight,
  preparePointLightForGLTFExport,
  SCENE_COMPONENT_POINT_LIGHT,
  serializePointLight,
  updatePointLight
} from './loaders/PointLightFunctions'
import { deserializePortal, SCENE_COMPONENT_PORTAL, serializePortal, updatePortal } from './loaders/PortalFunctions'
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
import {
  deserializeSpawnPoint,
  prepareSpawnPointForGLTFExport,
  SCENE_COMPONENT_SPAWN_POINT,
  serializeSpawnPoint
} from './loaders/SpawnPointFunctions'
import { deserializeSpline, SCENE_COMPONENT_SPLINE, serializeSpline, updateSpline } from './loaders/SplineFunctions'
import {
  deserializeSpotLight,
  prepareSpotLightForGLTFExport,
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
  serializeVideo,
  updateVideo
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

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_TRANSFORM, {
    deserialize: deserializeTransform,
    serialize: serializeTransform
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VISIBLE, {
    deserialize: deserializeVisible,
    serialize: serializeVisible
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PERSIST, {
    deserialize: deserializePersist,
    serialize: serializePersist
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SHADOW, {
    deserialize: deserializeShadow,
    serialize: serializeShadow,
    update: updateShadow
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PREVENT_BAKE, {
    deserialize: deserializePreventBake,
    serialize: serializePreventBake
  })

  /** SCENE NODE INTERNALS */

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AUDIO_SETTINGS, {
    deserialize: deserializeAudioSetting,
    serialize: serializeAudioSetting
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ENVMAP, {
    deserialize: deserializeEnvMap,
    serialize: serializeEnvMap,
    update: updateEnvMap
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_FOG, {
    deserialize: deserializeFog,
    serialize: serializeFog,
    update: updateFog
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_RENDERER_SETTINGS, {
    deserialize: deserializeRenderSetting,
    serialize: serializeRenderSettings,
    update: updateRenderSetting
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SIMPLE_MATERIALS, {
    deserialize: deserializeSimpleMaterial,
    serialize: serializeSimpleMaterial
  })

  /** NODES */

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DIRECTIONAL_LIGHT, {
    deserialize: deserializeDirectionalLight,
    serialize: serializeDirectionalLight,
    update: updateDirectionalLight,
    prepareForGLTFExport: prepareDirectionalLightForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUND_PLANE, {
    deserialize: deserializeGround,
    serialize: serializeGroundPlane,
    update: updateGroundPlane,
    shouldDeserialize: shouldDeserializeGroundPlane,
    prepareForGLTFExport: prepareGroundPlaneForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_HEMISPHERE_LIGHT, {
    deserialize: deserializeHemisphereLight,
    serialize: serializeHemisphereLight,
    update: updateHemisphereLight,
    shouldDeserialize: shouldDeserializeHemisphereLight
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AMBIENT_LIGHT, {
    deserialize: deserializeAmbientLight,
    serialize: serializeAmbientLight,
    update: updateAmbientLight,
    shouldDeserialize: shouldDeserializeAmbientLight
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POINT_LIGHT, {
    deserialize: deserializePointLight,
    serialize: serializePointLight,
    update: updatePointLight,
    prepareForGLTFExport: preparePointLightForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPOT_LIGHT, {
    deserialize: deserializeSpotLight,
    serialize: serializeSpotLight,
    update: updateSpotLight,
    prepareForGLTFExport: prepareSpotLightForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_METADATA, {
    deserialize: deserializeMetaData,
    serialize: serializeMetaData,
    update: updateMetaData
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POSTPROCESSING, {
    deserialize: deserializePostprocessing,
    serialize: serializePostprocessing,
    update: updatePostprocessing,
    shouldDeserialize: shouldDeserializePostprocessing
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, {
    deserialize: deserializeScenePreviewCamera,
    serialize: serializeScenePreviewCamera,
    update: updateScenePreviewCamera,
    shouldDeserialize: shouldDeserializeScenePreviewCamera
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SKYBOX, {
    deserialize: deserializeSkybox,
    serialize: serializeSkybox,
    update: updateSkybox,
    shouldDeserialize: shouldDeserializeSkybox
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPAWN_POINT, {
    deserialize: deserializeSpawnPoint,
    serialize: serializeSpawnPoint,
    prepareForGLTFExport: prepareSpawnPointForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MODEL, {
    deserialize: deserializeModel,
    serialize: serializeModel,
    update: updateModel
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUP, {
    deserialize: deserializeGroup,
    serialize: serializeGroup
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_ASSET, {
    deserialize: deserializeAsset,
    serialize: serializeAsset
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_LOOP_ANIMATION, {
    deserialize: deserializeLoopAnimation,
    serialize: serializeLoopAnimation,
    update: updateLoopAnimation
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PARTICLE_EMITTER, {
    deserialize: deserializeParticleEmitter,
    serialize: serializeParticleEmitter,
    update: updateParticleEmitter
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_CAMERA_PROPERTIES, {
    deserialize: deserializeCameraProperties,
    serialize: serializeCameraProperties
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PORTAL, {
    deserialize: deserializePortal,
    serialize: serializePortal,
    update: updatePortal
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_TRIGGER_VOLUME, {
    deserialize: deserializeTriggerVolume,
    serialize: serializeTriggerVolume,
    update: updateTriggerVolume
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_COLLIDER, {
    deserialize: deserializeCollider,
    serialize: serializeCollider
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_BOX_COLLIDER, {
    deserialize: deserializeBoxCollider,
    serialize: serializeBoxCollider,
    update: updateBoxCollider
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_IMAGE, {
    deserialize: deserializeImage,
    serialize: serializeImage,
    update: updateImage,
    prepareForGLTFExport: prepareImageForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AUDIO, {
    deserialize: deserializeAudio,
    serialize: serializeAudio,
    update: updateAudio,
    prepareForGLTFExport: prepareAudioForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VIDEO, {
    deserialize: deserializeVideo,
    serialize: serializeVideo,
    update: updateVideo,
    prepareForGLTFExport: prepareVideoForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MEDIA, {
    deserialize: deserializeMedia,
    serialize: serializeMedia,
    update: updateMedia
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_INTERACTABLE, {
    deserialize: deserializeInteractable,
    serialize: serializeInteractable,
    update: updateInteractable
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VOLUMETRIC, {
    deserialize: deserializeVolumetric,
    serialize: serializeVolumetric,
    update: updateVolumetric,
    prepareForGLTFExport: prepareVolumetricForGLTFExport
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_CLOUD, {
    deserialize: deserializeCloud,
    serialize: serializeCloud,
    update: updateCloud
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_OCEAN, {
    deserialize: deserializeOcean,
    serialize: serializeOcean,
    update: updateOcean
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_WATER, {
    deserialize: deserializeWater,
    serialize: serializeWater,
    update: updateWater
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_INTERIOR, {
    deserialize: deserializeInterior,
    serialize: serializeInterior,
    update: updateInterior
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SYSTEM, {
    deserialize: deserializeSystem,
    serialize: serializeSystem,
    update: updateSystem
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPLINE, {
    deserialize: deserializeSpline,
    serialize: serializeSpline,
    update: updateSpline
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_CUBEMAP_BAKE, {
    deserialize: deserializeCubemapBake,
    serialize: serializeCubemapBake,
    update: updateCubemapBake
  })
}
