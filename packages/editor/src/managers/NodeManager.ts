import AmbientLightNodeEditor from '../components/properties/AmbientLightNodeEditor'
import AudioNodeEditor from '../components/properties/AudioNodeEditor'
import BoxColliderNodeEditor from '../components/properties/BoxColliderNodeEditor'
import CameraPropertiesNodeEditor from '../components/properties/CameraPropertiesNodeEditor'
import CloudsNodeEditor from '../components/properties/CloudsNodeEditor'
import CubemapBakeNodeEditor from '../components/properties/CubemapBakeNodeEditor'
import { ProjectNodeEditor } from '../components/properties/ProjectNodeEditor'
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
import ProjectNode from '../nodes/ProjectNode'
import DirectionalLightNode from '../nodes/DirectionalLightNode'
import GroupNode from '../nodes/GroupNode'
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
import SceneNode from '../nodes/SceneNode'
import SplineNode from '../nodes/SplineNode'
import SpotLightNode from '../nodes/SpotLightNode'
import SystemNode from '../nodes/SystemNode'
import TriggerVolumeNode from '../nodes/TriggerVolumeNode'
import VideoNode from '../nodes/VideoNode'
import VolumetricNode from '../nodes/VolumetricNode'
import WaterNode from '../nodes/WaterNode'
import { ComponentNames } from '@xrengine/engine/src/common/constants/ComponentNames'
import { Certificate } from '@styled-icons/fa-solid/Certificate'
import { StyledIcon } from '@styled-icons/styled-icon'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getAllComponents } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Camera, Cloud, Globe, Rainbow, SquareFull, StreetView } from '@styled-icons/fa-solid'
import { Cubes } from '@styled-icons/fa-solid/Cubes'
import SceneMetaDataEditor from '../components/properties/SceneMetaDataEditor'
import EnvMapEditor from '../components/properties/EnvMapEditor'
import FogEditor from '../components/properties/FogEditor'
import AudioSettingsEditor from '../components/properties/AudioSettingsEditor'
import RenderSettingsEditor from '../components/properties/RenderSettingsEditor'

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
  NodeManager.instance.registerNode(ProjectNode, ProjectNodeEditor)
  NodeManager.instance.registerNode(ComponentNames.MT_DATA, SceneMetaDataEditor)
  NodeManager.instance.registerNode(ComponentNames.ENVMAP, EnvMapEditor)
  NodeManager.instance.registerNode(ComponentNames.FOG, FogEditor)
  NodeManager.instance.registerNode(ComponentNames.AUDIO_SETTINGS, AudioSettingsEditor)
  NodeManager.instance.registerNode(ComponentNames.RENDERER_SETTINGS, RenderSettingsEditor)
  NodeManager.instance.registerNode(ComponentNames.GROUP, GroupNodeEditor)
  NodeManager.instance.registerNode(ModelNode, ModelNodeEditor)
  NodeManager.instance.registerNode(ComponentNames.GROUND_PLANE, GroundPlaneNodeEditor)
  NodeManager.instance.registerNode(ShopifyNode, ShopifyNodeEditor)
  NodeManager.instance.registerNode(BoxColliderNode, BoxColliderNodeEditor)
  NodeManager.instance.registerNode(PortalNode, PortalNodeEditor)
  NodeManager.instance.registerNode(AmbientLightNode, AmbientLightNodeEditor)
  NodeManager.instance.registerNode(DirectionalLightNode, DirectionalLightNodeEditor)
  NodeManager.instance.registerNode(ComponentNames.HEMISPHERE_LIGHT, HemisphereLightNodeEditor)
  NodeManager.instance.registerNode(SpotLightNode, SpotLightNodeEditor)
  NodeManager.instance.registerNode(PointLightNode, PointLightNodeEditor)
  NodeManager.instance.registerNode(ComponentNames.SPAWN_POINT, SpawnPointNodeEditor)
  NodeManager.instance.registerNode(ComponentNames.SKYBOX, SkyboxNodeEditor)
  NodeManager.instance.registerNode(ImageNode, ImageNodeEditor)
  NodeManager.instance.registerNode(MetadataNode, MetadataNodeEditor)
  NodeManager.instance.registerNode(VideoNode, VideoNodeEditor)
  NodeManager.instance.registerNode(VolumetricNode, VolumetricNodeEditor)
  NodeManager.instance.registerNode(AudioNode, AudioNodeEditor)
  NodeManager.instance.registerNode(ComponentNames.POSTPROCESSING, PostProcessingNodeEditor)
  NodeManager.instance.registerNode(CameraPropertiesNode, CameraPropertiesNodeEditor)
  NodeManager.instance.registerNode(TriggerVolumeNode, TriggerVolumeNodeEditor)
  NodeManager.instance.registerNode(LinkNode, LinkNodeEditor)
  NodeManager.instance.registerNode(ComponentNames.SCENE_PREVIEW_CAMERA, ScenePreviewCameraNodeEditor)
  NodeManager.instance.registerNode(ParticleEmitterNode, ParticleEmitterNodeEditor)
  NodeManager.instance.registerNode(SplineNode, SplineNodeEditor)
  NodeManager.instance.registerNode(SystemNode, SystemNodeEditor)
  NodeManager.instance.registerNode(MapNode, MapNodeEditor)
  NodeManager.instance.registerNode(ComponentNames.CUBEMAP_BAKE, CubemapBakeNodeEditor)
  NodeManager.instance.registerNode(CloudsNode, CloudsNodeEditor)
  NodeManager.instance.registerNode(OceanNode, OceanNodeEditor)
  NodeManager.instance.registerNode(WaterNode, WaterNodeEditor)
  NodeManager.instance.registerNode(InteriorNode, InteriorNodeEditor)
}

export const ComponentIcon: {
  [key in ComponentNames]?: StyledIcon
} = {
  [ComponentNames.SCENE_PREVIEW_CAMERA]: Camera,
  [ComponentNames.SKYBOX]: Cloud,
  [ComponentNames.GROUND_PLANE]: SquareFull,
  [ComponentNames.SPAWN_POINT]: StreetView,
  [ComponentNames.POSTPROCESSING]: Rainbow,
  [ComponentNames.HEMISPHERE_LIGHT]: Certificate,
  [ComponentNames.RENDERER_SETTINGS]: Globe,
  [ComponentNames.ENVMAP]: Globe,
  [ComponentNames.FOG]: Globe,
  [ComponentNames.AUDIO_SETTINGS]: Globe
}

export const getComponentIcon = (entity: Entity): StyledIcon => {
  const components = getAllComponents(entity)

  for (let i = 0; i < components.length; i++) {
    const iconComponent = ComponentIcon[components[i]._name]
    if (iconComponent) {
      return iconComponent
    }
  }

  return Cubes
}
