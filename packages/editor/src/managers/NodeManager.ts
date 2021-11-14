import AmbientLightNodeEditor from '../components/properties/AmbientLightNodeEditor'
import AudioNodeEditor from '../components/properties/AudioNodeEditor'
import BoxColliderNodeEditor from '../components/properties/BoxColliderNodeEditor'
import CameraPropertiesNodeEditor from '../components/properties/CameraPropertiesNodeEditor'
import CloudsNodeEditor from '../components/properties/CloudsNodeEditor'
import CubemapBakeNodeEditor from '../components/properties/CubemapBakeNodeEditor'
import { ScriptNodeEditor } from '../components/properties/ScriptNodeEditor'
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
import AmbientLightNode from '../nodes/AmbientLightNode'
import AudioNode from '../nodes/AudioNode'
import BoxColliderNode from '../nodes/BoxColliderNode'
import CameraPropertiesNode from '../nodes/CameraPropertiesNode'
import CloudsNode from '../nodes/CloudsNode'
import CubemapBakeNode from '../nodes/CubemapBakeNode'
import ScriptNode from '../nodes/ScriptNode'
import DirectionalLightNode from '../nodes/DirectionalLightNode'
import GroundPlaneNode from '../nodes/GroundPlaneNode'
import GroupNode from '../nodes/GroupNode'
import HemisphereLightNode from '../nodes/HemisphereLightNode'
import ImageNode from '../nodes/ImageNode'
import InteriorNode from '../nodes/InteriorNode'
import LinkNode from '../nodes/LinkNode'
import MapNode from '../nodes/MapNode'
import MetadataNode from '../nodes/MetadataNode'
import ModelNode from '../nodes/ModelNode'
import ShopifyNode from '../nodes/ShopifyNode'
import OceanNode from '../nodes/OceanNode'
import ParticleEmitterNode from '../nodes/ParticleEmitterNode'
import PointLightNode from '../nodes/PointLightNode'
import PortalNode from '../nodes/PortalNode'
import PostProcessingNode from '../nodes/PostProcessingNode'
import SceneNode from '../nodes/SceneNode'
import ScenePreviewCameraNode from '../nodes/ScenePreviewCameraNode'
import SkyboxNode from '../nodes/SkyboxNode'
import SpawnPointNode from '../nodes/SpawnPointNode'
import SplineNode from '../nodes/SplineNode'
import SpotLightNode from '../nodes/SpotLightNode'
import SystemNode from '../nodes/SystemNode'
import TriggerVolumeNode from '../nodes/TriggerVolumeNode'
import VideoNode from '../nodes/VideoNode'
import VolumetricNode from '../nodes/VolumetricNode'
import WaterNode from '../nodes/WaterNode'

export class NodeManager {
  static instance: NodeManager = new NodeManager()

  nodes: any[]

  nodeTypes: Set<any>

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
  registerNode(nodeConstructor, nodeEditor) {
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
    return this.nodeEditors.get(node.constructor)
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
  NodeManager.instance.registerNode(ScriptNode, ScriptNodeEditor)
  NodeManager.instance.registerNode(SceneNode, SceneNodeEditor)
  NodeManager.instance.registerNode(GroupNode, GroupNodeEditor)
  NodeManager.instance.registerNode(ModelNode, ModelNodeEditor)
  NodeManager.instance.registerNode(ShopifyNode, ShopifyNodeEditor)
  NodeManager.instance.registerNode(GroundPlaneNode, GroundPlaneNodeEditor)
  NodeManager.instance.registerNode(BoxColliderNode, BoxColliderNodeEditor)
  NodeManager.instance.registerNode(PortalNode, PortalNodeEditor)
  NodeManager.instance.registerNode(AmbientLightNode, AmbientLightNodeEditor)
  NodeManager.instance.registerNode(DirectionalLightNode, DirectionalLightNodeEditor)
  NodeManager.instance.registerNode(HemisphereLightNode, HemisphereLightNodeEditor)
  NodeManager.instance.registerNode(SpotLightNode, SpotLightNodeEditor)
  NodeManager.instance.registerNode(PointLightNode, PointLightNodeEditor)
  NodeManager.instance.registerNode(SpawnPointNode, SpawnPointNodeEditor)
  NodeManager.instance.registerNode(SkyboxNode, SkyboxNodeEditor)
  NodeManager.instance.registerNode(ImageNode, ImageNodeEditor)
  NodeManager.instance.registerNode(MetadataNode, MetadataNodeEditor)
  NodeManager.instance.registerNode(VideoNode, VideoNodeEditor)
  NodeManager.instance.registerNode(VolumetricNode, VolumetricNodeEditor)
  NodeManager.instance.registerNode(AudioNode, AudioNodeEditor)
  NodeManager.instance.registerNode(PostProcessingNode, PostProcessingNodeEditor)
  NodeManager.instance.registerNode(CameraPropertiesNode, CameraPropertiesNodeEditor)
  NodeManager.instance.registerNode(TriggerVolumeNode, TriggerVolumeNodeEditor)
  NodeManager.instance.registerNode(LinkNode, LinkNodeEditor)
  NodeManager.instance.registerNode(ScenePreviewCameraNode, ScenePreviewCameraNodeEditor)
  NodeManager.instance.registerNode(ParticleEmitterNode, ParticleEmitterNodeEditor)
  NodeManager.instance.registerNode(SplineNode, SplineNodeEditor)
  NodeManager.instance.registerNode(SystemNode, SystemNodeEditor)
  NodeManager.instance.registerNode(MapNode, MapNodeEditor)
  NodeManager.instance.registerNode(CubemapBakeNode, CubemapBakeNodeEditor)
  NodeManager.instance.registerNode(CloudsNode, CloudsNodeEditor)
  NodeManager.instance.registerNode(OceanNode, OceanNodeEditor)
  NodeManager.instance.registerNode(WaterNode, WaterNodeEditor)
  NodeManager.instance.registerNode(InteriorNode, InteriorNodeEditor)
}
