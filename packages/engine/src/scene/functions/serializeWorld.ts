import { EntityJson, SceneJson, ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { ComponentName } from '../../common/constants/ComponentNames'
import { getAllComponents, getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { NameComponent } from '../components/NameComponent'
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
      switch (comp._type) {
        case ComponentName.TRANSFORM:
          data = serializeTransform(node.entity)
          break
        case ComponentName.VISIBILE:
          data = serializeVisible(node.entity)
          break
        case ComponentName.PERSIST:
          data = serializePersist(node.entity)
          break
        case ComponentName.INCLUDE_IN_CUBEMAP_BAKE:
          data = serializeIncludeInCubeMapBake(node.entity)
          break
        case ComponentName.SHADOW:
          data = serializeShadow(node.entity)
          break
        case ComponentName.MT_DATA:
          data = serializeMetaData(node.entity)
          break
        case ComponentName.FOG:
          data = serializeFog(node.entity)
          break
        case ComponentName.ENVMAP:
          data = serializeEnvMap(node.entity)
          break
        case ComponentName.SIMPLE_MATERIALS:
          data = serializeSimpleMaterial(node.entity)
          break
        case ComponentName.RENDERER_SETTINGS:
          data = serializeRenderSettings(node.entity)
          break
        case ComponentName.AUDIO_SETTINGS:
          data = serializeAudioSetting(node.entity)
          break
        case ComponentName.SCENE_PREVIEW_CAMERA:
          data = serializeScenePreviewCamera(node.entity)
          break
        case ComponentName.SKYBOX:
          data = serializeSkybox(node.entity)
          break
        case ComponentName.GROUND_PLANE:
          data = serializeGroundPlane(node.entity)
          break
        case ComponentName.WALKABLE:
          data = serializeWalkable(node.entity)
          break
        case ComponentName.SPAWN_POINT:
          data = serializeSpawnPoint(node.entity)
          break
        case ComponentName.POSTPROCESSING:
          data = serializePostprocessing(node.entity)
          break
        case ComponentName.HEMISPHERE_LIGHT:
          data = serializeHemisphereLight(node.entity)
          break
        case ComponentName.DIRECTIONAL_LIGHT:
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
