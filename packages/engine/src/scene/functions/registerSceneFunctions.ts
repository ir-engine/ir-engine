import { World } from '../../ecs/classes/World'
import { deserializeAudioSetting, SCENE_COMPONENT_AUDIO_SETTINGS, serializeAudioSetting } from './AudioSettingFunctions'
import {
  deserializeDirectionalLight,
  SCENE_COMPONENT_DIRECTIONAL_LIGHT,
  serializeDirectionalLight,
  updateDirectionalLight
} from './DirectionalLightFunctions'
import { SCENE_COMPONENT_ENVMAP, deserializeEnvMap, serializeEnvMap, updateEnvMap } from './EnvMapFunctions'
import { SCENE_COMPONENT_FOG, deserializeFog, serializeFog, updateFog } from './FogFunctions'
import {
  SCENE_COMPONENT_GROUND_PLANE,
  deserializeGround,
  serializeGroundPlane,
  updateGroundPlane
} from './GroundPlaneFunctions'
import {
  SCENE_COMPONENT_HEMISPHERE_LIGHT,
  deserializeHemisphereLight,
  serializeHemisphereLight,
  updateHemisphereLight
} from './HemisphereLightFunctions'
import {
  SCENE_COMPONENT_CUBEMAP_BAKE,
  deserializeIncludeInCubeMapBake,
  serializeIncludeInCubeMapBake
} from './IncludeInCubemapBakeFunctions'
import { SCENE_COMPONENT_METADATA, deserializeMetaData, serializeMetaData, updateMetaData } from './MetaDataFunctions'
import { SCENE_COMPONENT_PERSIST, deserializePersist, serializePersist } from './PersistFunctions'
import {
  SCENE_COMPONENT_POSTPROCESSING,
  deserializePostprocessing,
  serializePostprocessing,
  updatePostProcessing
} from './PostprocessingFunctions'
import {
  SCENE_COMPONENT_RENDERER_SETTINGS,
  deserializeRenderSetting,
  serializeRenderSettings,
  updateRenderSetting
} from './RenderSettingsFunction'
import {
  SCENE_COMPONENT_SCENE_PREVIEW_CAMERA,
  deserializeScenePreviewCamera,
  serializeScenePreviewCamera,
  updateScenePreviewCamera
} from './ScenePreviewCameraFunctions'
import { SCENE_COMPONENT_SHADOW, deserializeShadow, serializeShadow, updateShadow } from './ShadowFunctions'
import {
  SCENE_COMPONENT_SIMPLE_MATERIALS,
  deserializeSimpleMaterial,
  serializeSimpleMaterial
} from './SimpleMaterialFunctions'
import { SCENE_COMPONENT_SKYBOX, deserializeSkybox, serializeSkybox, updateSkybox } from './SkyboxFunctions'
import { SCENE_COMPONENT_SPAWN_POINT, deserializeSpawnPoint, serializeSpawnPoint } from './SpawnPointFunctions'
import { SCENE_COMPONENT_TRANSFORM, deserializeTransform, serializeTransform } from './TransformFunctions'
import { SCENE_COMPONENT_VISIBLE, deserializeVisible, serializeVisible } from './VisibleFunctions'

// TODO: split this into respective modules when we modularise the engine content

export const registerDefaultSceneFunctions = (world: World) => {
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VISIBLE, {
    deserialize: deserializeVisible,
    serialize: serializeVisible
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AUDIO_SETTINGS, {
    deserialize: deserializeAudioSetting,
    serialize: serializeAudioSetting
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DIRECTIONAL_LIGHT, {
    deserialize: deserializeDirectionalLight,
    serialize: serializeDirectionalLight,
    update: updateDirectionalLight
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

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_GROUND_PLANE, {
    deserialize: deserializeGround,
    serialize: serializeGroundPlane,
    update: updateGroundPlane
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_HEMISPHERE_LIGHT, {
    deserialize: deserializeHemisphereLight,
    serialize: serializeHemisphereLight,
    update: updateHemisphereLight
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_CUBEMAP_BAKE, {
    deserialize: deserializeIncludeInCubeMapBake,
    serialize: serializeIncludeInCubeMapBake
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_METADATA, {
    deserialize: deserializeMetaData,
    serialize: serializeMetaData,
    update: updateMetaData
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PERSIST, {
    deserialize: deserializePersist,
    serialize: serializePersist
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POSTPROCESSING, {
    deserialize: deserializePostprocessing,
    serialize: serializePostprocessing,
    update: updatePostProcessing
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_RENDERER_SETTINGS, {
    deserialize: deserializeRenderSetting,
    serialize: serializeRenderSettings,
    update: updateRenderSetting
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, {
    deserialize: deserializeScenePreviewCamera,
    serialize: serializeScenePreviewCamera,
    update: updateScenePreviewCamera
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SHADOW, {
    deserialize: deserializeShadow,
    serialize: serializeShadow,
    update: updateShadow
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SIMPLE_MATERIALS, {
    deserialize: deserializeSimpleMaterial,
    serialize: serializeSimpleMaterial
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SKYBOX, {
    deserialize: deserializeSkybox,
    serialize: serializeSkybox,
    update: updateSkybox
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SPAWN_POINT, {
    deserialize: deserializeSpawnPoint,
    serialize: serializeSpawnPoint
  })

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_TRANSFORM, {
    deserialize: deserializeTransform,
    serialize: serializeTransform
  })
}
