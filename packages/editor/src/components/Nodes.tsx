import AmbientLightNode from '../nodes/AmbientLightNode'
import AudioNode from '../nodes/AudioNode'
import BoxColliderNode from '../nodes/BoxColliderNode'
import PortalNode from '../nodes/PortalNode'
import DirectionalLightNode from '../nodes/DirectionalLightNode'
import SystemNode from '../nodes/SystemNode'
import GroundPlaneNode from '../nodes/GroundPlaneNode'
import GroupNode from '../nodes/GroupNode'
import HemisphereLightNode from '../nodes/HemisphereLightNode'
import ImageNode from '../nodes/ImageNode'
import LinkNode from '../nodes/LinkNode'
import ModelNode from '../nodes/ModelNode'
import ParticleEmitterNode from '../nodes/ParticleEmitterNode'
import PointLightNode from '../nodes/PointLightNode'
import PostProcessingNode from '../nodes/PostProcessingNode'
import CameraPropertiesNode from '../nodes/CameraPropertiesNode'
import SceneNode from '../nodes/SceneNode'
import ScenePreviewCameraNode from '../nodes/ScenePreviewCameraNode'
import SkyboxNode from '../nodes/SkyboxNode'
import SpawnPointNode from '../nodes/SpawnPointNode'
import SpotLightNode from '../nodes/SpotLightNode'
import TriggerVolumeNode from '../nodes/TriggerVolumeNode'
import VideoNode from '../nodes/VideoNode'
import VolumetricNode from '../nodes/VolumetricNode'
import CubemapBakeNode from '../nodes/CubemapBakeNode'
import SplineNode from '../nodes/SplineNode'
import MapNode from '../nodes/MapNode'
import MetadataNode from '../nodes/MetadataNode'
import CloudsNode from '../nodes/CloudsNode'
import OceanNode from '../nodes/OceanNode'
import ElementsSource from './assets/sources/ElementsSource'
import { MyAssetsSource } from './assets/sources/MyAssetsSource'
import Editor from './Editor'
import AmbientLightNodeEditor from './properties/AmbientLightNodeEditor'
import AudioNodeEditor from './properties/AudioNodeEditor'
import BoxColliderNodeEditor from './properties/BoxColliderNodeEditor'
import PortalNodeEditor from './properties/PortalNodeEditor'
import DirectionalLightNodeEditor from './properties/DirectionalLightNodeEditor'
import SystemNodeEditor from './properties/SystemNodeEditor'
import GroundPlaneNodeEditor from './properties/GroundPlaneNodeEditor'
import GroupNodeEditor from './properties/GroupNodeEditor'
import HemisphereLightNodeEditor from './properties/HemisphereLightNodeEditor'
import ImageNodeEditor from './properties/ImageNodeEditor'
import LinkNodeEditor from './properties/LinkNodeEditor'
import ModelNodeEditor from './properties/ModelNodeEditor'
import ParticleEmitterNodeEditor from './properties/ParticleEmitterNodeEditor'
import PointLightNodeEditor from './properties/PointLightNodeEditor'
import PostProcessingNodeEditor from './properties/PostProcessingNodeEditor'
import CameraPropertiesNodeEditor from './properties/CameraPropertiesNodeEditor'
import CubemapBakeNodeEditor from './properties/CubemapBakeNodeEditor'
import SceneNodeEditor from './properties/SceneNodeEditor'
import ScenePreviewCameraNodeEditor from './properties/ScenePreviewCameraNodeEditor'
import SkyboxNodeEditor from './properties/SkyboxNodeEditor'
import SpawnPointNodeEditor from './properties/SpawnPointNodeEditor'
import SplineNodeEditor from './properties/SplineNodeEditor'
import SpotLightNodeEditor from './properties/SpotLightNodeEditor'
import TriggerVolumeNodeEditor from './properties/TriggerVolumeNodeEditor'
import VideoNodeEditor from './properties/VideoNodeEditor'
import VolumetricNodeEditor from './properties/VolumetricNodeEditor'
import CloudsNodeEditor from './properties/CloudsNodeEditor'
import OceanNodeEditor from './properties/OceanNodeEditor'
import MapNodeEditor from './properties/MapNodeEditor'
import MetadataNodeEditor from './properties/MetadataNodeEditor'
import WaterNode from '../nodes/WaterNode'
import WaterNodeEditor from './properties/WaterNodeEditor'
import InteriorNode from '../nodes/InteriorNode'
import InteriorNodeEditor from './properties/InteriorNodeEditor'

/**
 * createEditor used to create editor object and register nodes available to create scene.
 *
 * @author Robert Long
 * @param  {any} api      [provides the api object]
 * @param  {any} settings [provides settings to be Applied]
 * @return {Editor}          [editor]
 */
export function createEditor(settings, Engine) {
  const editor = new Editor(settings, Engine)
  editor.registerNode(SceneNode, SceneNodeEditor)
  editor.registerNode(GroupNode, GroupNodeEditor)
  editor.registerNode(ModelNode, ModelNodeEditor)
  editor.registerNode(GroundPlaneNode, GroundPlaneNodeEditor)
  editor.registerNode(BoxColliderNode, BoxColliderNodeEditor)
  editor.registerNode(PortalNode, PortalNodeEditor)
  editor.registerNode(AmbientLightNode, AmbientLightNodeEditor)
  editor.registerNode(DirectionalLightNode, DirectionalLightNodeEditor)
  editor.registerNode(HemisphereLightNode, HemisphereLightNodeEditor)
  editor.registerNode(SpotLightNode, SpotLightNodeEditor)
  editor.registerNode(PointLightNode, PointLightNodeEditor)
  editor.registerNode(SpawnPointNode, SpawnPointNodeEditor)
  editor.registerNode(SkyboxNode, SkyboxNodeEditor)
  editor.registerNode(ImageNode, ImageNodeEditor)
  editor.registerNode(MetadataNode, MetadataNodeEditor)
  editor.registerNode(VideoNode, VideoNodeEditor)
  editor.registerNode(VolumetricNode, VolumetricNodeEditor)
  editor.registerNode(AudioNode, AudioNodeEditor)
  editor.registerNode(PostProcessingNode, PostProcessingNodeEditor)
  editor.registerNode(CameraPropertiesNode, CameraPropertiesNodeEditor)
  editor.registerNode(TriggerVolumeNode, TriggerVolumeNodeEditor)
  editor.registerNode(LinkNode, LinkNodeEditor)
  editor.registerNode(ScenePreviewCameraNode, ScenePreviewCameraNodeEditor)
  editor.registerNode(ParticleEmitterNode, ParticleEmitterNodeEditor)
  editor.registerNode(SplineNode, SplineNodeEditor)
  editor.registerSource(new ElementsSource(editor))
  editor.registerSource(new MyAssetsSource(editor))
  editor.registerNode(SystemNode, SystemNodeEditor)
  editor.registerNode(MapNode, MapNodeEditor)
  editor.registerNode(CubemapBakeNode, CubemapBakeNodeEditor)
  editor.registerNode(CloudsNode, CloudsNodeEditor)
  editor.registerNode(OceanNode, OceanNodeEditor)
  editor.registerNode(WaterNode, WaterNodeEditor)
  editor.registerNode(InteriorNode, InteriorNodeEditor)
  return editor
}
