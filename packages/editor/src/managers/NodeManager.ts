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
import PointLightNode from '../nodes/PointLightNode'
import PortalNode from '../nodes/PortalNode'
import SceneNode from '../nodes/SceneNode'
import SplineNode from '../nodes/SplineNode'
import SpotLightNode from '../nodes/SpotLightNode'
import SystemNode from '../nodes/SystemNode'
import TriggerVolumeNode from '../nodes/TriggerVolumeNode'
import VideoNode from '../nodes/VideoNode'
import VolumetricNode from '../nodes/VolumetricNode'
import WaterNode from '../nodes/WaterNode'
import { DirectionalLightComponent } from '@xrengine/engine/src/scene/components/DirectionalLightComponent'
import { HemisphereLightComponent } from '@xrengine/engine/src/scene/components/HemisphereLightComponent'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'
import { PostprocessingComponent } from '@xrengine/engine/src/scene/components/PostprocessingComponent'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { SkyboxComponent } from '@xrengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@xrengine/engine/src/scene/components/SpawnPointComponent'
import { SceneTagComponent, SCENE_COMPONENT_SCENE_TAG } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { ComponentMap, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import EditorNodeMixin from '../nodes/EditorNodeMixin'
import { AmbientLightComponent } from '@xrengine/engine/src/scene/components/AmbientLightComponent'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { SCENE_COMPONENT_DIRECTIONAL_LIGHT } from '@xrengine/engine/src/scene/functions/loaders/DirectionalLightFunctions'
import { SCENE_COMPONENT_HEMISPHERE_LIGHT } from '@xrengine/engine/src/scene/functions/loaders/HemisphereLightFunctions'
import { SCENE_COMPONENT_AMBIENT_LIGHT } from '@xrengine/engine/src/scene/functions/loaders/AmbientLightFunctions'
import { SCENE_COMPONENT_GROUND_PLANE } from '@xrengine/engine/src/scene/functions/loaders/GroundPlaneFunctions'
import { SCENE_COMPONENT_POSTPROCESSING } from '@xrengine/engine/src/scene/functions/loaders/PostprocessingFunctions'
import { SCENE_COMPONENT_SCENE_PREVIEW_CAMERA } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'
import { SCENE_COMPONENT_SKYBOX } from '@xrengine/engine/src/scene/functions/loaders/SkyboxFunctions'
import { SCENE_COMPONENT_GROUP } from '@xrengine/engine/src/scene/functions/loaders/GroupFunctions'
import { SCENE_COMPONENT_SPAWN_POINT } from '@xrengine/engine/src/scene/functions/loaders/SpawnPointFunctions'
import { EditorComponentType } from '../components/properties/Util'
import { SCENE_COMPONENT_MODEL } from '@xrengine/engine/src/scene/functions/loaders/ModelFunctions'
import { ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'

export class NodeManager {
  static instance: NodeManager = new NodeManager()

  nodes: any[]

  nodeTypes: Set<ReturnType<typeof EditorNodeMixin>>

  nodeEditors: Map<any, any>
  entityEditors: Map<any, any>

  constructor() {
    this.nodeTypes = new Set()
    this.nodeEditors = new Map()
    this.entityEditors = new Map()

    this.nodes = []
  }

  /**
   * Function registerNode used to add new object to the scene.
   *
   * @author Robert Long
   * @param  {any} nodeConstructor contains constructor properties
   * @param  {any} nodeEditor      contains editor properties
   */
  registerNode(nodeConstructor: ReturnType<typeof EditorNodeMixin>, nodeEditor, entityConstructor?) {
    this.nodeTypes.add(nodeConstructor)
    this.nodeEditors.set(nodeConstructor, nodeEditor)
  }

  /**
   * Function getEditorFromNode used to get properties of currently provided node.
   *
   * @author Robert Long
   * @param  {any} node contains properties of node
   */
  getEditorFromNode(node) {
    return this.nodeEditors.get(node.constructor) ?? this.entityEditors.get(node.constructor)
  }

  /**
   * Function getEditorFromClass used to get properties of currently provided node class.
   *
   * @author Robert Long
   * @param  {any} nodeClass contains properties of node
   */
  getEditorFromClass(nodeClass) {
    return this.nodeEditors.get(nodeClass) ?? this.entityEditors.get(nodeClass)
  }

  getCopy(): any[] {
    return this.nodes.slice(0)
  }

  add(node: any): void {
    this.nodes.push(node)
  }

  remove(node: any): boolean {
    const index = this.nodes.indexOf(node)

    if (index === -1) return false

    this.nodes.splice(index, 1)

    return true
  }

  empty(): void {
    this.nodes = []
  }

  fill(nodes: any[]): void {
    this.empty()

    for (let i = 0; i < nodes.length; i++) {
      this.nodes.push(nodes[i])
    }
  }
}

export const registerPredefinedNodes = () => {
  NodeManager.instance.registerNode(AudioNode, AudioNodeEditor)
  NodeManager.instance.registerNode(BoxColliderNode, BoxColliderNodeEditor)
  NodeManager.instance.registerNode(CameraPropertiesNode, CameraPropertiesNodeEditor)
  NodeManager.instance.registerNode(CloudsNode, CloudsNodeEditor)
  NodeManager.instance.registerNode(CubemapBakeNode, CubemapBakeNodeEditor)
  NodeManager.instance.registerNode(ImageNode, ImageNodeEditor)
  NodeManager.instance.registerNode(InteriorNode, InteriorNodeEditor)
  NodeManager.instance.registerNode(LinkNode, LinkNodeEditor)
  NodeManager.instance.registerNode(MapNode, MapNodeEditor)
  NodeManager.instance.registerNode(MetadataNode, MetadataNodeEditor)
  // NodeManager.instance.registerNode(ModelNode, ModelNodeEditor)
  NodeManager.instance.registerNode(OceanNode, OceanNodeEditor)
  NodeManager.instance.registerNode(ParticleEmitterNode, ParticleEmitterNodeEditor)
  NodeManager.instance.registerNode(PointLightNode, PointLightNodeEditor)
  NodeManager.instance.registerNode(PortalNode, PortalNodeEditor)
  // NodeManager.instance.registerNode(SceneNode, SceneNodeEditor)
  NodeManager.instance.registerNode(ShopifyNode, ShopifyNodeEditor)
  // NodeManager.instance.registerNode(SplineNode, SplineNodeEditor) // TODO
  NodeManager.instance.registerNode(SpotLightNode, SpotLightNodeEditor)
  NodeManager.instance.registerNode(SystemNode, SystemNodeEditor)
  NodeManager.instance.registerNode(TriggerVolumeNode, TriggerVolumeNodeEditor)
  NodeManager.instance.registerNode(VideoNode, VideoNodeEditor)
  NodeManager.instance.registerNode(VolumetricNode, VolumetricNodeEditor)
  NodeManager.instance.registerNode(WaterNode, WaterNodeEditor)
  NodeManager.instance.registerNode(WooCommerceNode, WooCommerceNodeEditor)
}

export const getNodeEditorsForEntity = (entity: Entity): EditorComponentType | null => {
  const entityNode = getComponent(entity, EntityNodeComponent)
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
  [SCENE_COMPONENT_GROUND_PLANE]: GroundPlaneNodeEditor,
  [SCENE_COMPONENT_MODEL]: ModelNodeEditor,
  [SCENE_COMPONENT_GROUP]: GroupNodeEditor,
  [SCENE_COMPONENT_POSTPROCESSING]: PostProcessingNodeEditor,
  [SCENE_COMPONENT_SCENE_TAG]: SceneNodeEditor,
  [SCENE_COMPONENT_SCENE_PREVIEW_CAMERA]: ScenePreviewCameraNodeEditor,
  [SCENE_COMPONENT_SKYBOX]: SkyboxNodeEditor,
  [SCENE_COMPONENT_SPAWN_POINT]: SpawnPointNodeEditor
}

export const prefabIcons = {
  [ScenePrefabs.ambientLight]: AmbientLightNodeEditor.iconComponent,
  [ScenePrefabs.directionalLight]: DirectionalLightNodeEditor.iconComponent,
  [ScenePrefabs.hemisphereLight]: HemisphereLightNodeEditor.iconComponent,
  [ScenePrefabs.groundPlane]: GroundPlaneNodeEditor.iconComponent,
  [ScenePrefabs.model]: ModelNodeEditor.iconComponent,
  [ScenePrefabs.group]: GroupNodeEditor.iconComponent,
  [ScenePrefabs.postProcessing]: PostProcessingNodeEditor.iconComponent,
  [ScenePrefabs.previewCamera]: ScenePreviewCameraNodeEditor.iconComponent,
  [ScenePrefabs.skybox]: SkyboxNodeEditor.iconComponent,
  [ScenePrefabs.spawnPoint]: SpawnPointNodeEditor.iconComponent
}
