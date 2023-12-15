/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { Component } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { AmbientLightComponent } from '@etherealengine/engine/src/scene/components/AmbientLightComponent'
import { CameraSettingsComponent } from '@etherealengine/engine/src/scene/components/CameraSettingsComponent'
import { ColliderComponent } from '@etherealengine/engine/src/scene/components/ColliderComponent'
import { DirectionalLightComponent } from '@etherealengine/engine/src/scene/components/DirectionalLightComponent'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { FogSettingsComponent } from '@etherealengine/engine/src/scene/components/FogSettingsComponent'
import { GroundPlaneComponent } from '@etherealengine/engine/src/scene/components/GroundPlaneComponent'
import { HemisphereLightComponent } from '@etherealengine/engine/src/scene/components/HemisphereLightComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
// import { InstancingComponent } from '@etherealengine/engine/src/scene/components/InstancingComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { MediaSettingsComponent } from '@etherealengine/engine/src/scene/components/MediaSettingsComponent'
import { MeshComponent } from '@etherealengine/engine/src/scene/components/MeshComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { MountPointComponent } from '@etherealengine/engine/src/scene/components/MountPointComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { PointLightComponent } from '@etherealengine/engine/src/scene/components/PointLightComponent'
import { PortalComponent } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { PostProcessingComponent } from '@etherealengine/engine/src/scene/components/PostProcessingComponent'
import { RenderSettingsComponent } from '@etherealengine/engine/src/scene/components/RenderSettingsComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { SceneTagComponent } from '@etherealengine/engine/src/scene/components/SceneTagComponent'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@etherealengine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'
import { SpotLightComponent } from '@etherealengine/engine/src/scene/components/SpotLightComponent'
import { SystemComponent } from '@etherealengine/engine/src/scene/components/SystemComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import { PersistentAnchorComponent } from '@etherealengine/engine/src/xr/XRAnchorComponents'

// import ChairIcon from '@mui/icons-material/Chair'

import AmbientLightNodeEditor from '../components/properties/AmbientLightNodeEditor'
import { CameraPropertiesNodeEditor } from '../components/properties/CameraPropertiesNodeEditor'
import ColliderNodeEditor from '../components/properties/ColliderNodeEditor'
import DirectionalLightNodeEditor from '../components/properties/DirectionalLightNodeEditor'
import EnvMapBakeNodeEditor from '../components/properties/EnvMapBakeNodeEditor'
import EnvMapEditor from '../components/properties/EnvMapEditor'
import { FogSettingsEditor } from '../components/properties/FogSettingsEditor'
import GroundPlaneNodeEditor from '../components/properties/GroundPlaneNodeEditor'
import HemisphereLightNodeEditor from '../components/properties/HemisphereLightNodeEditor'
import ImageNodeEditor from '../components/properties/ImageNodeEditor'
// import InstancingNodeEditor from '../components/properties/InstancingNodeEditor'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import BehaveGraphNodeEditor from '../components/properties/BehaveGraphNodeEditor'

import { LinkComponent } from '@etherealengine/engine/src/scene/components/LinkComponent'
import { ShadowComponent } from '@etherealengine/engine/src/scene/components/ShadowComponent'

import { PrimitiveGeometryComponent } from '@etherealengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { SDFComponent } from '@etherealengine/engine/src/scene/components/SDFComponent'
import { TextComponent } from '@etherealengine/engine/src/scene/components/TextComponent'
import LinkNodeEditor from '../components/properties/LinkNodeEditor'
import LoopAnimationNodeEditor from '../components/properties/LoopAnimationNodeEditor'
import MediaNodeEditor from '../components/properties/MediaNodeEditor'
import { MediaSettingsEditor } from '../components/properties/MediaSettingsEditor'
import { MeshNodeEditor } from '../components/properties/MeshNodeEditor'
import ModelNodeEditor from '../components/properties/ModelNodeEditor'
import MountPointNodeEditor from '../components/properties/MountPointNodeEditor'
import ParticleSystemNodeEditor from '../components/properties/ParticleSystemNodeEditor'
import PersistentAnchorNodeEditor from '../components/properties/PersistentAnchorNodeEditor'
import PointLightNodeEditor from '../components/properties/PointLightNodeEditor'
import PortalNodeEditor from '../components/properties/PortalNodeEditor'
import PositionalAudioNodeEditor from '../components/properties/PositionalAudioNodeEditor'
import { PostProcessingSettingsEditor } from '../components/properties/PostProcessingSettingsEditor'
import PrimitiveGeometryNodeEditor from '../components/properties/PrimitiveGeometryNodeEditor'
import { RenderSettingsEditor } from '../components/properties/RenderSettingsEditor'
import SDFEditor from '../components/properties/SDFEditor'
import SceneNodeEditor from '../components/properties/SceneNodeEditor'
import ScenePreviewCameraNodeEditor from '../components/properties/ScenePreviewCameraNodeEditor'
import ShadowProperties from '../components/properties/ShadowProperties'
import SkyboxNodeEditor from '../components/properties/SkyboxNodeEditor'
import SpawnPointNodeEditor from '../components/properties/SpawnPointNodeEditor'
import { SplineNodeEditor } from '../components/properties/SplineNodeEditor'
import { SplineTrackNodeEditor } from '../components/properties/SplineTrackNodeEditor'
import SpotLightNodeEditor from '../components/properties/SpotLightNodeEditor'
import SystemNodeEditor from '../components/properties/SystemNodeEditor'
import TextNodeEditor from '../components/properties/TextNodeEditor'
import { EditorComponentType } from '../components/properties/Util'
import { VariantNodeEditor } from '../components/properties/VariantNodeEditor'
import VideoNodeEditor from '../components/properties/VideoNodeEditor'
import VolumetricNodeEditor from '../components/properties/VolumetricNodeEditor'

export const EntityNodeEditor = new Map<Component, EditorComponentType>()
EntityNodeEditor.set(PostProcessingComponent, PostProcessingSettingsEditor)
EntityNodeEditor.set(MediaSettingsComponent, MediaSettingsEditor)
EntityNodeEditor.set(RenderSettingsComponent, RenderSettingsEditor)
EntityNodeEditor.set(FogSettingsComponent, FogSettingsEditor)
EntityNodeEditor.set(CameraSettingsComponent, CameraPropertiesNodeEditor)
EntityNodeEditor.set(DirectionalLightComponent, DirectionalLightNodeEditor)
EntityNodeEditor.set(HemisphereLightComponent, HemisphereLightNodeEditor)
EntityNodeEditor.set(AmbientLightComponent, AmbientLightNodeEditor)
EntityNodeEditor.set(PointLightComponent, PointLightNodeEditor)
EntityNodeEditor.set(SpotLightComponent, SpotLightNodeEditor)
EntityNodeEditor.set(SDFComponent, SDFEditor)
EntityNodeEditor.set(GroundPlaneComponent, GroundPlaneNodeEditor)
EntityNodeEditor.set(MeshComponent, MeshNodeEditor)
EntityNodeEditor.set(ModelComponent, ModelNodeEditor)
EntityNodeEditor.set(ShadowComponent, ShadowProperties)
EntityNodeEditor.set(LoopAnimationComponent, LoopAnimationNodeEditor)
EntityNodeEditor.set(ParticleSystemComponent, ParticleSystemNodeEditor)
EntityNodeEditor.set(PrimitiveGeometryComponent, PrimitiveGeometryNodeEditor)
EntityNodeEditor.set(PortalComponent, PortalNodeEditor)
EntityNodeEditor.set(MountPointComponent, MountPointNodeEditor)
EntityNodeEditor.set(ColliderComponent, ColliderNodeEditor)
EntityNodeEditor.set(SceneTagComponent, SceneNodeEditor)
EntityNodeEditor.set(ScenePreviewCameraComponent, ScenePreviewCameraNodeEditor)
EntityNodeEditor.set(SkyboxComponent, SkyboxNodeEditor)
EntityNodeEditor.set(SpawnPointComponent, SpawnPointNodeEditor)
EntityNodeEditor.set(MediaComponent, MediaNodeEditor)
EntityNodeEditor.set(ImageComponent, ImageNodeEditor)
EntityNodeEditor.set(PositionalAudioComponent, PositionalAudioNodeEditor)
EntityNodeEditor.set(VideoComponent, VideoNodeEditor)
EntityNodeEditor.set(VolumetricComponent, VolumetricNodeEditor)
// EntityNodeEditor.set(CloudComponent, CloudsNodeEditor)
// EntityNodeEditor.set(OceanComponent, OceanNodeEditor)
// EntityNodeEditor.set(WaterComponent, WaterNodeEditor)
// EntityNodeEditor.set(InteriorComponent, InteriorNodeEditor)
EntityNodeEditor.set(SystemComponent, SystemNodeEditor)
EntityNodeEditor.set(EnvmapComponent, EnvMapEditor)
EntityNodeEditor.set(EnvMapBakeComponent, EnvMapBakeNodeEditor)
// EntityNodeEditor.set(InstancingComponent, InstancingNodeEditor)
EntityNodeEditor.set(PersistentAnchorComponent, PersistentAnchorNodeEditor)
EntityNodeEditor.set(VariantComponent, VariantNodeEditor)
EntityNodeEditor.set(SplineComponent, SplineNodeEditor)
EntityNodeEditor.set(SplineTrackComponent, SplineTrackNodeEditor)
EntityNodeEditor.set(BehaveGraphComponent, BehaveGraphNodeEditor)
EntityNodeEditor.set(LinkComponent, LinkNodeEditor)
EntityNodeEditor.set(TextComponent, TextNodeEditor)
