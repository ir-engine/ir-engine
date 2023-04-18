import { useEffect } from 'react'

import { ComponentJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { createActionQueue } from '@etherealengine/hyperflux'

import { LoopAnimationComponent } from '../../avatar/components/LoopAnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CloudComponent } from '../components/CloudComponent'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { GroundPlaneComponent } from '../components/GroundPlaneComponent'
import { GroupComponent } from '../components/GroupComponent'
import { ImageComponent } from '../components/ImageComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { InteriorComponent } from '../components/InteriorComponent'
import { LoadVolumeComponent } from '../components/LoadVolumeComponent'
import { ModelComponent } from '../components/ModelComponent'
import { OceanComponent } from '../components/OceanComponent'
import { ParticleSystemComponent } from '../components/ParticleSystemComponent'
import { PrefabComponent } from '../components/PrefabComponent'
import { ScenePreviewCameraComponent } from '../components/ScenePreviewCamera'
import { ShadowComponent } from '../components/ShadowComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { SplineComponent } from '../components/SplineComponent'
import { SystemComponent } from '../components/SystemComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { WaterComponent } from '../components/WaterComponent'
import { updateCloud } from '../functions/loaders/CloudFunctions'
import { updateOcean } from '../functions/loaders/OceanFunctions'

export const defaultSpatialComponents: ComponentJson[] = [
  { name: TransformComponent.jsonID },
  { name: VisibleComponent.jsonID },
  { name: ShadowComponent.jsonID }
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

    /**
     * Metadata
     */

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.previewCamera, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: ScenePreviewCameraComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.system, [{ name: SystemComponent.jsonID }])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.spawnPoint, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: SpawnPointComponent.jsonID }
    ])

    /**
     * Assets
     */

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.prefab, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: PrefabComponent.jsonID }
    ])

    /**
     * Objects
     */

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.model, [
      ...defaultSpatialComponents,
      { name: ModelComponent.jsonID },
      { name: EnvmapComponent.jsonID },
      { name: LoopAnimationComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.instancing, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: InstancingComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.loadVolume, [{ name: LoadVolumeComponent.jsonID }])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.group, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: GroupComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.groundPlane, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: ShadowComponent.jsonID, props: { receive: true, cast: false } },
      { name: GroundPlaneComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.image, [
      ...defaultSpatialComponents,
      {
        name: ImageComponent.jsonID,
        props: { source: '__$project$__/default-project/assets/sample_etc1s.ktx2' }
      }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.cloud, [
      ...defaultSpatialComponents,
      { name: CloudComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.ocean, [
      ...defaultSpatialComponents,
      { name: OceanComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.water, [
      ...defaultSpatialComponents,
      { name: WaterComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.interior, [
      ...defaultSpatialComponents,
      { name: InteriorComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.spline, [
      ...defaultSpatialComponents,
      { name: SplineComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.particleEmitter, [
      ...defaultSpatialComponents,
      { name: ParticleSystemComponent.jsonID }
    ])

    return () => {
      /**
       * Metadata
       */

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.previewCamera)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.system)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.spawnPoint)

      /**
       * Assets
       */

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.prefab)

      /**
       * Objects
       */

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.model)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.instancing)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.loadVolume)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.group)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.groundPlane)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.image)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.cloud)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.ocean)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.water)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.interior)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.spline)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.particleEmitter)
    }
  }, [])
  return null
}

export const SceneObjectUpdateSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectUpdateSystem',
  execute,
  reactor
})
