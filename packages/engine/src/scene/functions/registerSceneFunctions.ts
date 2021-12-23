import { World } from '../../ecs/classes/World'
import {
  deserializeAmbientLight,
  SCENE_COMPONENT_AMBIENT_LIGHT,
  serializeAmbientLight,
  shouldDeserializeAmbientLight,
  updateAmbientLight
} from './loaders/AmbientLightFunctions'
import {
  deserializeAudioSetting,
  SCENE_COMPONENT_AUDIO_SETTINGS,
  serializeAudioSetting
} from './loaders/AudioSettingFunctions'
import {
  deserializeDirectionalLight,
  prepareDirectionalLightForGLTFExport,
  SCENE_COMPONENT_DIRECTIONAL_LIGHT,
  serializeDirectionalLight,
  updateDirectionalLight
} from './loaders/DirectionalLightFunctions'
import { SCENE_COMPONENT_ENVMAP, deserializeEnvMap, serializeEnvMap, updateEnvMap } from './loaders/EnvMapFunctions'
import { SCENE_COMPONENT_FOG, deserializeFog, serializeFog, updateFog } from './loaders/FogFunctions'
import {
  SCENE_COMPONENT_GROUND_PLANE,
  deserializeGround,
  serializeGroundPlane,
  updateGroundPlane,
  shouldDeserializeGroundPlane,
  prepareGroundPlaneForGLTFExport
} from './loaders/GroundPlaneFunctions'
import { deserializeGroup, SCENE_COMPONENT_GROUP, serializeGroup } from './loaders/GroupFunctions'
import {
  SCENE_COMPONENT_HEMISPHERE_LIGHT,
  deserializeHemisphereLight,
  serializeHemisphereLight,
  updateHemisphereLight,
  shouldDeserializeHemisphereLight
} from './loaders/HemisphereLightFunctions'
import {
  SCENE_COMPONENT_PREVENT_BAKE,
  deserializePreventBake,
  serializePreventBake
} from './loaders/PreventBakeFunctions'
import {
  SCENE_COMPONENT_METADATA,
  deserializeMetaData,
  serializeMetaData,
  updateMetaData
} from './loaders/MetaDataFunctions'
import { deserializeModel, SCENE_COMPONENT_MODEL, serializeModel, updateModel } from './loaders/ModelFunctions'
import { SCENE_COMPONENT_PERSIST, deserializePersist, serializePersist } from './loaders/PersistFunctions'
import {
  SCENE_COMPONENT_POSTPROCESSING,
  deserializePostprocessing,
  serializePostprocessing,
  updatePostProcessing,
  shouldDeserializePostprocessing
} from './loaders/PostprocessingFunctions'
import {
  SCENE_COMPONENT_RENDERER_SETTINGS,
  deserializeRenderSetting,
  serializeRenderSettings,
  updateRenderSetting
} from './loaders/RenderSettingsFunction'
import {
  SCENE_COMPONENT_SCENE_PREVIEW_CAMERA,
  deserializeScenePreviewCamera,
  serializeScenePreviewCamera,
  updateScenePreviewCamera,
  shouldDeserializeScenePreviewCamera
} from './loaders/ScenePreviewCameraFunctions'
import { SCENE_COMPONENT_SHADOW, deserializeShadow, serializeShadow, updateShadow } from './loaders/ShadowFunctions'
import {
  SCENE_COMPONENT_SIMPLE_MATERIALS,
  deserializeSimpleMaterial,
  serializeSimpleMaterial
} from './loaders/SimpleMaterialFunctions'
import {
  SCENE_COMPONENT_SKYBOX,
  deserializeSkybox,
  serializeSkybox,
  updateSkybox,
  shouldDeserializeSkybox
} from './loaders/SkyboxFunctions'
import {
  SCENE_COMPONENT_SPAWN_POINT,
  deserializeSpawnPoint,
  serializeSpawnPoint,
  prepareSpawnPointForGLTFExport
} from './loaders/SpawnPointFunctions'
import { SCENE_COMPONENT_TRANSFORM, deserializeTransform, serializeTransform } from './loaders/TransformFunctions'
import { SCENE_COMPONENT_VISIBLE, deserializeVisible, serializeVisible } from './loaders/VisibleFunctions'
import {
  deserializeLoopAnimation,
  SCENE_COMPONENT_LOOP_ANIMATION,
  serializeLoopAnimation,
  updateLoopAnimation
} from './loaders/LoopAnimationFunctions'

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

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_METADATA, {
    deserialize: deserializeMetaData,
    serialize: serializeMetaData,
    update: updateMetaData
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POSTPROCESSING, {
    deserialize: deserializePostprocessing,
    serialize: serializePostprocessing,
    update: updatePostProcessing,
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

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_LOOP_ANIMATION, {
    deserialize: deserializeLoopAnimation,
    serialize: serializeLoopAnimation,
    update: updateLoopAnimation
  })
}
