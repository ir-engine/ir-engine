import { World } from '../../ecs/classes/World'
import {
  SCENE_COMPONENT_DIRECTIONAL_LIGHT,
  SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES
} from './loaders/DirectionalLightFunctions'
import { SCENE_COMPONENT_GROUND_PLANE } from './loaders/GroundPlaneFunctions'
import { SCENE_COMPONENT_HEMISPHERE_LIGHT } from './loaders/HemisphereLightFunctions'
import { SCENE_COMPONENT_CUBEMAP_BAKE } from './loaders/IncludeInCubemapBakeFunctions'
import { SCENE_COMPONENT_METADATA } from './loaders/MetaDataFunctions'
import { SCENE_COMPONENT_MODEL } from './loaders/ModelFunctions'
import { SCENE_COMPONENT_POSTPROCESSING } from './loaders/PostprocessingFunctions'
import { SCENE_COMPONENT_SCENE_PREVIEW_CAMERA } from './loaders/ScenePreviewCameraFunctions'
import { SCENE_COMPONENT_SHADOW, SCENE_COMPONENT_SHADOW_DEFAULT_VALUES } from './loaders/ShadowFunctions'
import { SCENE_COMPONENT_SKYBOX } from './loaders/SkyboxFunctions'
import { SCENE_COMPONENT_SPAWN_POINT } from './loaders/SpawnPointFunctions'
import { SCENE_COMPONENT_TRANSFORM, SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES } from './loaders/TransformFunctions'
import { SCENE_COMPONENT_VISIBLE, SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES } from './loaders/VisibleFunctions'

export const ScenePrefabs = {
  directionalLight: 'Directional Light' as const,
  groundPlane: 'Ground Plane' as const,
  hemisphereLight: 'Hemisphere Light' as const,
  metadata: 'Metadata' as const,
  model: 'Model' as const,
  postProcessing: 'Post Processing' as const,
  previewCamera: 'Preview Camera' as const,
  skybox: 'Skybox' as const,
  spawnPoint: 'Spawn Point' as const
}

export type ScenePrefabTypes = typeof ScenePrefabs[keyof typeof ScenePrefabs]

export const defaultSpatialComponents = [
  { [SCENE_COMPONENT_TRANSFORM]: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
  { [SCENE_COMPONENT_VISIBLE]: SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES },
  { [SCENE_COMPONENT_SHADOW]: SCENE_COMPONENT_SHADOW_DEFAULT_VALUES }
]

export const registerPrefabs = (world: World) => {
  world.scenePrefabRegistry.set(ScenePrefabs.directionalLight, [
    ...defaultSpatialComponents,
    {
      [SCENE_COMPONENT_DIRECTIONAL_LIGHT]: SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES
    }
  ])
  // world.scenePrefabRegistry.set(ScenePrefabs.groundPlane, [...defaultSpatialComponents, SCENE_COMPONENT_GROUND_PLANE])
  // world.scenePrefabRegistry.set(ScenePrefabs.hemisphereLight, [...defaultSpatialComponents, SCENE_COMPONENT_HEMISPHERE_LIGHT])
  // world.scenePrefabRegistry.set(ScenePrefabs.metadata, [...defaultSpatialComponents, SCENE_COMPONENT_METADATA])
  // world.scenePrefabRegistry.set(ScenePrefabs.model, [...defaultSpatialComponents, SCENE_COMPONENT_MODEL, /*SCENE_COMPONENT_INTERACTABLE, SCENE_LOOP_ANIMATION*/])
  // world.scenePrefabRegistry.set(ScenePrefabs.postProcessing, [SCENE_COMPONENT_POSTPROCESSING])
  // world.scenePrefabRegistry.set(ScenePrefabs.previewCamera, [...defaultSpatialComponents, SCENE_COMPONENT_SCENE_PREVIEW_CAMERA])
  // world.scenePrefabRegistry.set(ScenePrefabs.skybox, [SCENE_COMPONENT_SKYBOX])
  // world.scenePrefabRegistry.set(ScenePrefabs.spawnPoint, [...defaultSpatialComponents, SCENE_COMPONENT_SPAWN_POINT])
}
