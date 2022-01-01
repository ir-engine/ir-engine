import AmbientLightNodeEditor from '../components/properties/AmbientLightNodeEditor'
import AudioNodeEditor from '../components/properties/AudioNodeEditor'
import BoxColliderNodeEditor from '../components/properties/BoxColliderNodeEditor'
import CameraPropertiesNodeEditor from '../components/properties/CameraPropertiesNodeEditor'
import CloudsNodeEditor from '../components/properties/CloudsNodeEditor'
import CubemapBakeNodeEditor from '../components/properties/CubemapBakeNodeEditor'
import DirectionalLightNodeEditor from '../components/properties/DirectionalLightNodeEditor'
import GroundPlaneNodeEditor from '../components/properties/GroundPlaneNodeEditor'
import GroupNodeEditor from '../components/properties/GroupNodeEditor'
import HemisphereLightNodeEditor from '../components/properties/HemisphereLightNodeEditor'
import ImageNodeEditor from '../components/properties/ImageNodeEditor'
import InteriorNodeEditor from '../components/properties/InteriorNodeEditor'
import LinkNodeEditor from '../components/properties/LinkNodeEditor'
import MapNodeEditor from '../components/properties/MapNodeEditor'
import MetadataNodeEditor from '../components/properties/MetadataNodeEditor'
import ModelNodeEditor from '../components/properties/ModelNodeEditor'
import WooCommerceNodeEditor from '../components/properties/WooCommerceNodeEditor'
import ShopifyNodeEditor from '../components/properties/ShopifyNodeEditor'
import OceanNodeEditor from '../components/properties/OceanNodeEditor'
import ParticleEmitterNodeEditor from '../components/properties/ParticleEmitterNodeEditor'
import PointLightNodeEditor from '../components/properties/PointLightNodeEditor'
import PortalNodeEditor from '../components/properties/PortalNodeEditor'
import PostProcessingNodeEditor from '../components/properties/PostProcessingNodeEditor'
import SceneNodeEditor from '../components/properties/SceneNodeEditor'
import ScenePreviewCameraNodeEditor from '../components/properties/ScenePreviewCameraNodeEditor'
import SkyboxNodeEditor from '../components/properties/SkyboxNodeEditor'
import SpawnPointNodeEditor from '../components/properties/SpawnPointNodeEditor'
import SplineNodeEditor from '../components/properties/SplineNodeEditor'
import SpotLightNodeEditor from '../components/properties/SpotLightNodeEditor'
import SystemNodeEditor from '../components/properties/SystemNodeEditor'
import TriggerVolumeNodeEditor from '../components/properties/TriggerVolumeNodeEditor'
import VideoNodeEditor from '../components/properties/VideoNodeEditor'
import VolumetricNodeEditor from '../components/properties/VolumetricNodeEditor'
import WaterNodeEditor from '../components/properties/WaterNodeEditor'
import AudioNode from '../nodes/AudioNode'
import BoxColliderNode from '../nodes/BoxColliderNode'
import CameraPropertiesNode from '../nodes/CameraPropertiesNode'
import CloudsNode from '../nodes/CloudsNode'
import CubemapBakeNode from '../nodes/CubemapBakeNode'
import ImageNode from '../nodes/ImageNode'
import InteriorNode from '../nodes/InteriorNode'
import LinkNode from '../nodes/LinkNode'
import MapNode from '../nodes/MapNode'
import MetadataNode from '../nodes/MetadataNode'
import ModelNode from '../nodes/ModelNode'
import WooCommerceNode from '../nodes/WooCommerceNode'
import ShopifyNode from '../nodes/ShopifyNode'
import OceanNode from '../nodes/OceanNode'
import ParticleEmitterNode from '../nodes/ParticleEmitterNode'
import PortalNode from '../nodes/PortalNode'
import SceneNode from '../nodes/SceneNode'
import SplineNode from '../nodes/SplineNode'
import SystemNode from '../nodes/SystemNode'
import TriggerVolumeNode from '../nodes/TriggerVolumeNode'
import VideoNode from '../nodes/VideoNode'
import VolumetricNode from '../nodes/VolumetricNode'
import WaterNode from '../nodes/WaterNode'
import { SCENE_COMPONENT_SCENE_TAG } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import EditorNodeMixin from '../nodes/EditorNodeMixin'
import { ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { EditorComponentType } from '../components/properties/Util'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { SCENE_COMPONENT_DIRECTIONAL_LIGHT } from '@xrengine/engine/src/scene/functions/loaders/DirectionalLightFunctions'
import { SCENE_COMPONENT_HEMISPHERE_LIGHT } from '@xrengine/engine/src/scene/functions/loaders/HemisphereLightFunctions'
import { SCENE_COMPONENT_AMBIENT_LIGHT } from '@xrengine/engine/src/scene/functions/loaders/AmbientLightFunctions'
import { SCENE_COMPONENT_POINT_LIGHT } from '@xrengine/engine/src/scene/functions/loaders/PointLightFunctions'
import { SCENE_COMPONENT_GROUND_PLANE } from '@xrengine/engine/src/scene/functions/loaders/GroundPlaneFunctions'
import { SCENE_COMPONENT_POSTPROCESSING } from '@xrengine/engine/src/scene/functions/loaders/PostprocessingFunctions'
import { SCENE_COMPONENT_SCENE_PREVIEW_CAMERA } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'
import { SCENE_COMPONENT_SKYBOX } from '@xrengine/engine/src/scene/functions/loaders/SkyboxFunctions'
import { SCENE_COMPONENT_GROUP } from '@xrengine/engine/src/scene/functions/loaders/GroupFunctions'
import { SCENE_COMPONENT_SPAWN_POINT } from '@xrengine/engine/src/scene/functions/loaders/SpawnPointFunctions'
import { SCENE_COMPONENT_MODEL } from '@xrengine/engine/src/scene/functions/loaders/ModelFunctions'
import { SCENE_COMPONENT_SPOT_LIGHT } from '@xrengine/engine/src/scene/functions/loaders/StopLightFunctions'
import { SCENE_COMPONENT_LINK } from '@xrengine/engine/src/scene/functions/loaders/LinkFunctions'
import { SCENE_COMPONENT_PARTICLE_EMITTER } from '@xrengine/engine/src/scene/functions/loaders/ParticleEmitterFunctions'
import { SCENE_COMPONENT_CAMERA_PROPERTIES } from '@xrengine/engine/src/scene/functions/loaders/CameraPropertiesFunctions'

export class NodeManager {
  static instance: NodeManager = new NodeManager()

  nodes: any[]

  nodeTypes: Set<ReturnType<typeof EditorNodeMixin>>

  nodeEditors: Map<any, any>

  constructor() {
    this.nodeTypes = new Set()
    this.nodeEditors = new Map()
    this.nodes = []
  }

  /**
   * Function registerNode used to add new object to the scene.
   *
   * @author Robert Long
   * @param  {any} nodeConstructor contains constructor properties
   * @param  {any} nodeEditor      contains editor properties
   */
  registerNode(nodeConstructor: ReturnType<typeof EditorNodeMixin>, nodeEditor) {
    this.nodeTypes.add(nodeConstructor)
    this.nodeEditors.set(nodeConstructor, nodeEditor)
  }

  /**
   * Function getEditorFromClass used to get properties of currently provided node class.
   *
   * @author Robert Long
   * @param  {any} nodeClass contains properties of node
   */
  getEditorFromClass(nodeClass) {
    return this.nodeEditors.get(nodeClass)
  }

  add(node: any): void {
    this.nodes.push(node)
  }
}

export const registerPredefinedNodes = () => {
  NodeManager.instance.registerNode(AudioNode, AudioNodeEditor)
  NodeManager.instance.registerNode(BoxColliderNode, BoxColliderNodeEditor)
  // NodeManager.instance.registerNode(CameraPropertiesNode, CameraPropertiesNodeEditor)
  NodeManager.instance.registerNode(CloudsNode, CloudsNodeEditor)
  NodeManager.instance.registerNode(CubemapBakeNode, CubemapBakeNodeEditor)
  NodeManager.instance.registerNode(ImageNode, ImageNodeEditor)
  NodeManager.instance.registerNode(InteriorNode, InteriorNodeEditor)
  // NodeManager.instance.registerNode(LinkNode, LinkNodeEditor)
  NodeManager.instance.registerNode(MapNode, MapNodeEditor)
  NodeManager.instance.registerNode(MetadataNode, MetadataNodeEditor)
  // NodeManager.instance.registerNode(ModelNode, ModelNodeEditor)
  NodeManager.instance.registerNode(OceanNode, OceanNodeEditor)
  // NodeManager.instance.registerNode(ParticleEmitterNode, ParticleEmitterNodeEditor)
  NodeManager.instance.registerNode(PortalNode, PortalNodeEditor)
  // NodeManager.instance.registerNode(SceneNode, SceneNodeEditor)
  NodeManager.instance.registerNode(ShopifyNode, ShopifyNodeEditor)
  // NodeManager.instance.registerNode(SplineNode, SplineNodeEditor) // TODO
  NodeManager.instance.registerNode(SystemNode, SystemNodeEditor)
  NodeManager.instance.registerNode(TriggerVolumeNode, TriggerVolumeNodeEditor)
  NodeManager.instance.registerNode(VideoNode, VideoNodeEditor)
  NodeManager.instance.registerNode(VolumetricNode, VolumetricNodeEditor)
  NodeManager.instance.registerNode(WaterNode, WaterNodeEditor)
  NodeManager.instance.registerNode(WooCommerceNode, WooCommerceNodeEditor)
}

export const getNodeEditorsForEntity = (entity: Entity): EditorComponentType | null => {
  const entityNode = getComponent(entity, EntityNodeComponent)
  if (!entityNode) return null

  let editor = null

  for (let i = 0; i < entityNode.components.length; i++) {
    editor = EntityNodeEditor[entityNode.components[i]]
    if (editor) break
  }

  return editor
}

export const EntityNodeEditor = {
  [SCENE_COMPONENT_DIRECTIONAL_LIGHT]: DirectionalLightNodeEditor,
  [SCENE_COMPONENT_HEMISPHERE_LIGHT]: HemisphereLightNodeEditor,
  [SCENE_COMPONENT_AMBIENT_LIGHT]: AmbientLightNodeEditor,
  [SCENE_COMPONENT_POINT_LIGHT]: PointLightNodeEditor,
  [SCENE_COMPONENT_SPOT_LIGHT]: SpotLightNodeEditor,
  [SCENE_COMPONENT_GROUND_PLANE]: GroundPlaneNodeEditor,
  [SCENE_COMPONENT_CAMERA_PROPERTIES]: CameraPropertiesNodeEditor,
  [SCENE_COMPONENT_MODEL]: ModelNodeEditor,
  [SCENE_COMPONENT_LINK]: LinkNodeEditor,
  [SCENE_COMPONENT_PARTICLE_EMITTER]: ParticleEmitterNodeEditor,
  [SCENE_COMPONENT_GROUP]: GroupNodeEditor,
  [SCENE_COMPONENT_POSTPROCESSING]: PostProcessingNodeEditor,
  [SCENE_COMPONENT_SCENE_TAG]: SceneNodeEditor,
  [SCENE_COMPONENT_SCENE_PREVIEW_CAMERA]: ScenePreviewCameraNodeEditor,
  [SCENE_COMPONENT_SKYBOX]: SkyboxNodeEditor,
  [SCENE_COMPONENT_SPAWN_POINT]: SpawnPointNodeEditor
}

export const prefabIcons = {
  [ScenePrefabs.ambientLight]: AmbientLightNodeEditor.iconComponent,
  [ScenePrefabs.pointLight]: PointLightNodeEditor.iconComponent,
  [ScenePrefabs.spotLight]: SpotLightNodeEditor.iconComponent,
  [ScenePrefabs.directionalLight]: DirectionalLightNodeEditor.iconComponent,
  [ScenePrefabs.hemisphereLight]: HemisphereLightNodeEditor.iconComponent,
  [ScenePrefabs.groundPlane]: GroundPlaneNodeEditor.iconComponent,
  [ScenePrefabs.model]: ModelNodeEditor.iconComponent,
  [ScenePrefabs.link]: LinkNodeEditor.iconComponent,
  [ScenePrefabs.cameraProperties]: CameraPropertiesNodeEditor.iconComponent,
  [ScenePrefabs.particleEmitter]: ParticleEmitterNodeEditor.iconComponent,
  [ScenePrefabs.group]: GroupNodeEditor.iconComponent,
  [ScenePrefabs.postProcessing]: PostProcessingNodeEditor.iconComponent,
  [ScenePrefabs.previewCamera]: ScenePreviewCameraNodeEditor.iconComponent,
  [ScenePrefabs.skybox]: SkyboxNodeEditor.iconComponent,
  [ScenePrefabs.spawnPoint]: SpawnPointNodeEditor.iconComponent
}
