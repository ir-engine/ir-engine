import { EntityJson, SceneJson, ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { ComponentName } from '../../common/constants/ComponentNames'
import { getAllComponents, getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PositionalAudioSettingsComponent } from '../components/AudioSettingsComponent'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { FogComponent } from '../components/FogComponent'
import { GroundPlaneComponent } from '../components/GroundPlaneComponent'
import { HemisphereLightComponent } from '../components/HemisphereLightComponent'
import { IncludeInCubemapBakeComponent } from '../components/IncludeInCubemapBakeComponent'
import { MetaDataComponent } from '../components/MetaDataComponent'
import { NameComponent } from '../components/NameComponent'
import { PersistTagComponent } from '../components/PersistTagComponent'
import { PostprocessingComponent } from '../components/PostprocessingComponent'
import { RenderSettingComponent } from '../components/RenderSettingComponent'
import { ScenePreviewCameraTagComponent } from '../components/ScenePreviewCamera'
import { ShadowComponent } from '../components/ShadowComponent'
import { SimpleMaterialTagComponent } from '../components/SimpleMaterialTagComponent'
import { SkyboxComponent } from '../components/SkyboxComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { WalkableTagComponent } from '../components/Walkable'
import { serializeAudioSetting } from './AudioSettingFunctions'
import { serializeDirectionalLight } from './DirectionalLightFunctions'
import { serializeEnvMap } from './EnvMapFunctions'
import { serializeFog } from './FogFunctions'
import { serializeGroundPlane } from './GroundPlaneFunctions'
import { serializeHemisphereLight } from './HemisphereLightFunctions'
import { serializeIncludeInCubeMapBake } from './IncludeInCubemapBakeFunctions'
import { serializeMetaData } from './MetaDataFunctions'
import { serializePersist } from './PersistFunctions'
import { serializePostprocessing } from './PostprocessingFunctions'
import { serializeRenderSettings } from './RenderSettingsFunction'
import { serializeScenePreviewCamera } from './ScenePreviewCameraFunctions'
import { serializeShadow } from './ShadowFunctions'
import { serializeSimpleMaterial } from './SimpleMaterialFunctions'
import { serializeSkybox } from './SkyboxFunctions'
import { serializeSpawnPoint } from './SpawnPointFunctions'
import { serializeTransform } from './TransformFunctions'
import { serializeVisible } from './VisibleFunctions'
import { serializeWalkable } from './WalkableFunctions'

export const serializeWorld = (world = useWorld()) => {
  const entityUuid = {}
  const sceneJson = { version: 4, entities: {} } as SceneJson

  world.entityTree.traverse((node, index) => {
    const components = getAllComponents(node.entity)

    const uuid = getComponent(node.entity, EntityNodeComponent).uuid
    const entityJson = (sceneJson.entities[uuid] = { components: [] as ComponentJson[] } as EntityJson)

    if (node.parentNode) {
      entityJson.parent = node.parentNode.entity as any
      entityJson.index = index
    } else {
      sceneJson.root = uuid
    }

    entityUuid[node.entity] = uuid
    entityJson.name = getComponent(node.entity, NameComponent)?.name

    components.forEach((comp) => {
      let data
      switch (comp) {
        case TransformComponent:
          data = serializeTransform(node.entity)
          break
        case VisibleComponent:
          data = serializeVisible(node.entity)
          break
        case PersistTagComponent:
          data = serializePersist(node.entity)
          break
        case IncludeInCubemapBakeComponent:
          data = serializeIncludeInCubeMapBake(node.entity)
          break
        case ShadowComponent:
          data = serializeShadow(node.entity)
          break
        case MetaDataComponent:
          data = serializeMetaData(node.entity)
          break
        case FogComponent:
          data = serializeFog(node.entity)
          break
        case EnvmapComponent:
          data = serializeEnvMap(node.entity)
          break
        case SimpleMaterialTagComponent:
          data = serializeSimpleMaterial(node.entity)
          break
        case RenderSettingComponent:
          data = serializeRenderSettings(node.entity)
          break
        case PositionalAudioSettingsComponent:
          data = serializeAudioSetting(node.entity)
          break
        case ScenePreviewCameraTagComponent:
          data = serializeScenePreviewCamera(node.entity)
          break
        case SkyboxComponent:
          data = serializeSkybox(node.entity)
          break
        case GroundPlaneComponent:
          data = serializeGroundPlane(node.entity)
          break
        case WalkableTagComponent:
          data = serializeWalkable(node.entity)
          break
        case SpawnPointComponent:
          data = serializeSpawnPoint(node.entity)
          break
        case PostprocessingComponent:
          data = serializePostprocessing(node.entity)
          break
        case HemisphereLightComponent:
          data = serializeHemisphereLight(node.entity)
          break
        case DirectionalLightComponent:
          data = serializeDirectionalLight(node.entity)
          break
      }
      if (data) entityJson.components.push(data)
    })
  })

  Object.keys(sceneJson.entities).forEach((key) => {
    const entity = sceneJson.entities[key]
    if (entity.parent) entity.parent = entityUuid[entity.parent]
  })

  return sceneJson
}
