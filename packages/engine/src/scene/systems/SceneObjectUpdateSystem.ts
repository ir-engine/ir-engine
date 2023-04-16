import { useEffect } from 'react'

import { ComponentJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { createActionQueue } from '@etherealengine/hyperflux'

import { LoopAnimationComponent, SCENE_COMPONENT_LOOP_ANIMATION } from '../../avatar/components/LoopAnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import {
  CloudComponent,
  SCENE_COMPONENT_CLOUD,
  SCENE_COMPONENT_CLOUD_DEFAULT_VALUES
} from '../components/CloudComponent'
import { SCENE_COMPONENT_ENVMAP } from '../components/EnvmapComponent'
import { GroundPlaneComponent, SCENE_COMPONENT_GROUND_PLANE } from '../components/GroundPlaneComponent'
import { GroupComponent, SCENE_COMPONENT_GROUP } from '../components/GroupComponent'
import { ImageComponent, SCENE_COMPONENT_IMAGE } from '../components/ImageComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import {
  InteriorComponent,
  SCENE_COMPONENT_INTERIOR,
  SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES
} from '../components/InteriorComponent'
import { LoadVolumeComponent, SCENE_COMPONENT_LOAD_VOLUME } from '../components/LoadVolumeComponent'
import { ModelComponent, SCENE_COMPONENT_MODEL } from '../components/ModelComponent'
import {
  OceanComponent,
  SCENE_COMPONENT_OCEAN,
  SCENE_COMPONENT_OCEAN_DEFAULT_VALUES
} from '../components/OceanComponent'
import { ParticleSystemComponent, SCENE_COMPONENT_PARTICLE_SYSTEM } from '../components/ParticleSystemComponent'
import { PrefabComponent, SCENE_COMPONENT_PREFAB } from '../components/PrefabComponent'
import { SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, ScenePreviewCameraComponent } from '../components/ScenePreviewCamera'
import { SCENE_COMPONENT_SCREENSHARETARGET, ScreenshareTargetComponent } from '../components/ScreenshareTargetComponent'
import {
  SCENE_COMPONENT_SHADOW,
  SCENE_COMPONENT_SHADOW_DEFAULT_VALUES,
  ShadowComponent
} from '../components/ShadowComponent'
import { SCENE_COMPONENT_SPAWN_POINT, SpawnPointComponent } from '../components/SpawnPointComponent'
import { SCENE_COMPONENT_SPLINE, SplineComponent } from '../components/SplineComponent'
import { SCENE_COMPONENT_SYSTEM, SystemComponent } from '../components/SystemComponent'
import { SCENE_COMPONENT_VISIBLE, VisibleComponent } from '../components/VisibleComponent'
import { SCENE_COMPONENT_WATER, WaterComponent } from '../components/WaterComponent'
import { updateCloud } from '../functions/loaders/CloudFunctions'
import { SCENE_COMPONENT_INSTANCING } from '../functions/loaders/InstancingFunctions'
import { updateOcean } from '../functions/loaders/OceanFunctions'

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

const cloudQuery = defineQuery([CloudComponent])
const oceanQuery = defineQuery([OceanComponent])
const interiorQuery = defineQuery([InteriorComponent])
const spawnPointComponent = defineQuery([SpawnPointComponent])

const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

const execute = () => {
  for (const action of modifyPropertyActionQueue()) {
    for (const entity of action.entities) {
      if (hasComponent(entity, CloudComponent)) updateCloud(entity)
      if (hasComponent(entity, OceanComponent)) updateOcean(entity)
    }
  }

  for (const entity of cloudQuery.enter()) updateCloud(entity)
  for (const entity of oceanQuery.enter()) updateOcean(entity)
  for (const entity of spawnPointComponent()) getComponent(entity, SpawnPointComponent).helperBox?.update()
}

const reactor = () => {
  useEffect(() => {
    /**
     * Tag components
     */

    Engine.instance.sceneComponentRegistry.set(VisibleComponent.name, SCENE_COMPONENT_VISIBLE)

    Engine.instance.sceneComponentRegistry.set(ShadowComponent.name, SCENE_COMPONENT_SHADOW)

    /**
     * Metadata
     */

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.previewCamera, [
      { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, props: true }
    ])

    Engine.instance.sceneComponentRegistry.set(ScenePreviewCameraComponent.name, SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.system, [{ name: SCENE_COMPONENT_SYSTEM, props: {} }])

    Engine.instance.sceneComponentRegistry.set(SystemComponent.name, SCENE_COMPONENT_SYSTEM)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.spawnPoint, [
      { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_SPAWN_POINT, props: true }
    ])

    Engine.instance.sceneComponentRegistry.set(SpawnPointComponent.name, SCENE_COMPONENT_SPAWN_POINT)

    /**
     * Assets
     */

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.prefab, [
      { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_PREFAB, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(PrefabComponent.name, SCENE_COMPONENT_PREFAB)

    /**
     * Objects
     */

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.model, [
      ...defaultSpatialComponents,
      { name: SCENE_COMPONENT_MODEL, props: {} },
      { name: SCENE_COMPONENT_ENVMAP, props: {} },
      { name: SCENE_COMPONENT_LOOP_ANIMATION, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(ModelComponent.name, SCENE_COMPONENT_MODEL)

    Engine.instance.sceneComponentRegistry.set(InstancingComponent.name, SCENE_COMPONENT_INSTANCING)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.instancing, [
      { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_INSTANCING, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(LoadVolumeComponent.name, SCENE_COMPONENT_LOAD_VOLUME)
    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.loadVolume, [{ name: SCENE_COMPONENT_LOAD_VOLUME, props: {} }])

    Engine.instance.sceneComponentRegistry.set(ScreenshareTargetComponent.name, SCENE_COMPONENT_SCREENSHARETARGET)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.group, [
      { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_GROUP, props: [] }
    ])

    Engine.instance.sceneComponentRegistry.set(GroupComponent.name, SCENE_COMPONENT_GROUP)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.groundPlane, [
      { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_SHADOW, props: { receive: true, cast: false } },
      { name: SCENE_COMPONENT_GROUND_PLANE, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(GroundPlaneComponent.name, SCENE_COMPONENT_GROUND_PLANE)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.image, [
      ...defaultSpatialComponents,
      {
        name: SCENE_COMPONENT_IMAGE,
        props: { source: '__$project$__/default-project/assets/sample_etc1s.ktx2' }
      }
    ])

    Engine.instance.sceneComponentRegistry.set(ImageComponent.name, SCENE_COMPONENT_IMAGE)

    Engine.instance.sceneComponentRegistry.set(LoopAnimationComponent.name, SCENE_COMPONENT_LOOP_ANIMATION)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.cloud, [
      ...defaultSpatialComponents,
      { name: SCENE_COMPONENT_CLOUD, props: SCENE_COMPONENT_CLOUD_DEFAULT_VALUES }
    ])

    Engine.instance.sceneComponentRegistry.set(CloudComponent.name, SCENE_COMPONENT_CLOUD)
    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.ocean, [
      ...defaultSpatialComponents,
      { name: SCENE_COMPONENT_OCEAN, props: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES }
    ])

    Engine.instance.sceneComponentRegistry.set(OceanComponent.name, SCENE_COMPONENT_OCEAN)
    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.water, [
      ...defaultSpatialComponents,
      { name: SCENE_COMPONENT_WATER, props: true }
    ])

    Engine.instance.sceneComponentRegistry.set(WaterComponent.name, SCENE_COMPONENT_WATER)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.interior, [
      ...defaultSpatialComponents,
      { name: SCENE_COMPONENT_INTERIOR, props: SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES }
    ])

    Engine.instance.sceneComponentRegistry.set(InteriorComponent.name, SCENE_COMPONENT_INTERIOR)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.spline, [
      ...defaultSpatialComponents,
      { name: SCENE_COMPONENT_SPLINE, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(SplineComponent.name, SCENE_COMPONENT_SPLINE)

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.particleEmitter, [
      ...defaultSpatialComponents,
      { name: SCENE_COMPONENT_PARTICLE_SYSTEM, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(ParticleSystemComponent.name, SCENE_COMPONENT_PARTICLE_SYSTEM)

    return () => {
      Engine.instance.sceneComponentRegistry.delete(VisibleComponent.name)

      Engine.instance.sceneComponentRegistry.delete(ShadowComponent.name)

      /**
       * Metadata
       */

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.previewCamera)

      Engine.instance.sceneComponentRegistry.delete(ScenePreviewCameraComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.system)

      Engine.instance.sceneComponentRegistry.delete(SystemComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.spawnPoint)

      Engine.instance.sceneComponentRegistry.delete(SpawnPointComponent.name)

      /**
       * Assets
       */

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.prefab)

      Engine.instance.sceneComponentRegistry.delete(PrefabComponent.name)

      /**
       * Objects
       */

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.model)

      Engine.instance.sceneComponentRegistry.delete(ModelComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.instancing)
      Engine.instance.sceneComponentRegistry.delete(InstancingComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.loadVolume)
      Engine.instance.sceneComponentRegistry.delete(LoadVolumeComponent.name)

      Engine.instance.sceneComponentRegistry.delete(ScreenshareTargetComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.group)

      Engine.instance.sceneComponentRegistry.delete(GroupComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.groundPlane)

      Engine.instance.sceneComponentRegistry.delete(GroundPlaneComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.image)

      Engine.instance.sceneComponentRegistry.delete(ImageComponent.name)

      Engine.instance.sceneComponentRegistry.delete(LoopAnimationComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.cloud)

      Engine.instance.sceneComponentRegistry.delete(CloudComponent.name)
      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.ocean)

      Engine.instance.sceneComponentRegistry.delete(OceanComponent.name)
      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.water)

      Engine.instance.sceneComponentRegistry.delete(WaterComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.interior)

      Engine.instance.sceneComponentRegistry.delete(InteriorComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.spline)

      Engine.instance.sceneComponentRegistry.delete(SplineComponent.name)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.particleEmitter)
      Engine.instance.sceneComponentRegistry.delete(ParticleSystemComponent.name)
    }
  }, [])
  return null
}

export const SceneObjectUpdateSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectUpdateSystem',
  execute,
  reactor
})
