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
import { MediaPrefabs } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { Component } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { PhysicsPrefabs } from '@etherealengine/engine/src/physics/systems/PhysicsSystem'
import { AmbientLightComponent } from '@etherealengine/engine/src/scene/components/AmbientLightComponent'
import { CameraSettingsComponent } from '@etherealengine/engine/src/scene/components/CameraSettingsComponent'
import { CloudComponent } from '@etherealengine/engine/src/scene/components/CloudComponent'
import { ColliderComponent } from '@etherealengine/engine/src/scene/components/ColliderComponent'
import { DirectionalLightComponent } from '@etherealengine/engine/src/scene/components/DirectionalLightComponent'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { FogSettingsComponent } from '@etherealengine/engine/src/scene/components/FogSettingsComponent'
import { GroundPlaneComponent } from '@etherealengine/engine/src/scene/components/GroundPlaneComponent'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { HemisphereLightComponent } from '@etherealengine/engine/src/scene/components/HemisphereLightComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
// import { InstancingComponent } from '@etherealengine/engine/src/scene/components/InstancingComponent'
import { InteriorComponent } from '@etherealengine/engine/src/scene/components/InteriorComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { MediaSettingsComponent } from '@etherealengine/engine/src/scene/components/MediaSettingsComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { MountPointComponent } from '@etherealengine/engine/src/scene/components/MountPointComponent'
import { OceanComponent } from '@etherealengine/engine/src/scene/components/OceanComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { PointLightComponent } from '@etherealengine/engine/src/scene/components/PointLightComponent'
import { PortalComponent } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { PostProcessingComponent } from '@etherealengine/engine/src/scene/components/PostProcessingComponent'
import { PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'
import { RenderSettingsComponent } from '@etherealengine/engine/src/scene/components/RenderSettingsComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { SceneTagComponent } from '@etherealengine/engine/src/scene/components/SceneTagComponent'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@etherealengine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SpotLightComponent } from '@etherealengine/engine/src/scene/components/SpotLightComponent'
import { SystemComponent } from '@etherealengine/engine/src/scene/components/SystemComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import { WaterComponent } from '@etherealengine/engine/src/scene/components/WaterComponent'
import { LightPrefabs } from '@etherealengine/engine/src/scene/systems/LightSystem'
import { ScenePrefabs } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { PersistentAnchorComponent } from '@etherealengine/engine/src/xr/XRAnchorComponents'

// import ChairIcon from '@mui/icons-material/Chair'

import AmbientLightNodeEditor from '../components/properties/AmbientLightNodeEditor'
import { CameraPropertiesNodeEditor } from '../components/properties/CameraPropertiesNodeEditor'
import CloudsNodeEditor from '../components/properties/CloudsNodeEditor'
import ColliderNodeEditor from '../components/properties/ColliderNodeEditor'
import DirectionalLightNodeEditor from '../components/properties/DirectionalLightNodeEditor'
import EnvMapBakeNodeEditor from '../components/properties/EnvMapBakeNodeEditor'
import EnvMapEditor from '../components/properties/EnvMapEditor'
import { FogSettingsEditor } from '../components/properties/FogSettingsEditor'
import GroundPlaneNodeEditor from '../components/properties/GroundPlaneNodeEditor'
import GroupNodeEditor from '../components/properties/GroupNodeEditor'
import HemisphereLightNodeEditor from '../components/properties/HemisphereLightNodeEditor'
import ImageNodeEditor from '../components/properties/ImageNodeEditor'
// import InstancingNodeEditor from '../components/properties/InstancingNodeEditor'
import InteriorNodeEditor from '../components/properties/InteriorNodeEditor'
import LoopAnimationNodeEditor from '../components/properties/LoopAnimationNodeEditor'
import MediaNodeEditor from '../components/properties/MediaNodeEditor'
import { MediaSettingsEditor } from '../components/properties/MediaSettingsEditor'
import ModelNodeEditor from '../components/properties/ModelNodeEditor'
import MountPointNodeEditor from '../components/properties/MountPointNodeEditor'
import OceanNodeEditor from '../components/properties/OceanNodeEditor'
import ParticleSystemNodeEditor from '../components/properties/ParticleSystemNodeEditor'
import PersistentAnchorNodeEditor from '../components/properties/PersistentAnchorNodeEditor'
import PointLightNodeEditor from '../components/properties/PointLightNodeEditor'
import PortalNodeEditor from '../components/properties/PortalNodeEditor'
import PositionalAudioNodeEditor from '../components/properties/PositionalAudioNodeEditor'
import { PostProcessingSettingsEditor } from '../components/properties/PostProcessingSettingsEditor'
import { PrefabNodeEditor } from '../components/properties/PrefabNodeEditor'
import { RenderSettingsEditor } from '../components/properties/RenderSettingsEditor'
import SceneNodeEditor from '../components/properties/SceneNodeEditor'
import ScenePreviewCameraNodeEditor from '../components/properties/ScenePreviewCameraNodeEditor'
import SkyboxNodeEditor from '../components/properties/SkyboxNodeEditor'
import SpawnPointNodeEditor from '../components/properties/SpawnPointNodeEditor'
import SplineNodeEditor from '../components/properties/SplineNodeEditor'
import SpotLightNodeEditor from '../components/properties/SpotLightNodeEditor'
import SystemNodeEditor from '../components/properties/SystemNodeEditor'
import TransformPropertyGroup from '../components/properties/TransformPropertyGroup'
import { EditorComponentType } from '../components/properties/Util'
import { VariantNodeEditor } from '../components/properties/VariantNodeEditor'
import VideoNodeEditor from '../components/properties/VideoNodeEditor'
import VolumetricNodeEditor from '../components/properties/VolumetricNodeEditor'
import WaterNodeEditor from '../components/properties/WaterNodeEditor'

export const EntityNodeEditor = new Map<Component, EditorComponentType>()
EntityNodeEditor.set(TransformComponent, TransformPropertyGroup)
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
EntityNodeEditor.set(GroundPlaneComponent, GroundPlaneNodeEditor)
EntityNodeEditor.set(ModelComponent, ModelNodeEditor)
EntityNodeEditor.set(LoopAnimationComponent, LoopAnimationNodeEditor)
EntityNodeEditor.set(ParticleSystemComponent, ParticleSystemNodeEditor)
EntityNodeEditor.set(PortalComponent, PortalNodeEditor)
EntityNodeEditor.set(MountPointComponent, MountPointNodeEditor)
EntityNodeEditor.set(ColliderComponent, ColliderNodeEditor)
EntityNodeEditor.set(GroupComponent, GroupNodeEditor)
EntityNodeEditor.set(PrefabComponent, PrefabNodeEditor)
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
// EntityNodeEditor.set(SplineComponent, SplineNodeEditor)
EntityNodeEditor.set(EnvmapComponent, EnvMapEditor)
EntityNodeEditor.set(EnvMapBakeComponent, EnvMapBakeNodeEditor)
// EntityNodeEditor.set(InstancingComponent, InstancingNodeEditor)
EntityNodeEditor.set(PersistentAnchorComponent, PersistentAnchorNodeEditor)
EntityNodeEditor.set(VariantComponent, VariantNodeEditor)

export const prefabIcons = {
  [LightPrefabs.ambientLight]: AmbientLightNodeEditor.iconComponent,
  [LightPrefabs.pointLight]: PointLightNodeEditor.iconComponent,
  [LightPrefabs.spotLight]: SpotLightNodeEditor.iconComponent,
  [LightPrefabs.directionalLight]: DirectionalLightNodeEditor.iconComponent,
  [LightPrefabs.hemisphereLight]: HemisphereLightNodeEditor.iconComponent,
  [ScenePrefabs.groundPlane]: GroundPlaneNodeEditor.iconComponent,
  [ScenePrefabs.model]: ModelNodeEditor.iconComponent,
  [ScenePrefabs.previewCamera]: ScenePreviewCameraNodeEditor.iconComponent,
  [ScenePrefabs.particleEmitter]: ParticleSystemNodeEditor.iconComponent,
  [ScenePrefabs.portal]: PortalNodeEditor.iconComponent,
  [PhysicsPrefabs.collider]: ColliderNodeEditor.iconComponent,
  // [ScenePrefabs.chair]: ChairIcon,
  [ScenePrefabs.group]: GroupNodeEditor.iconComponent,
  [ScenePrefabs.prefab]: PrefabNodeEditor.iconComponent,
  [ScenePrefabs.skybox]: SkyboxNodeEditor.iconComponent,
  [ScenePrefabs.spawnPoint]: SpawnPointNodeEditor.iconComponent,
  [ScenePrefabs.image]: ImageNodeEditor.iconComponent,
  [MediaPrefabs.audio]: PositionalAudioNodeEditor.iconComponent,
  [MediaPrefabs.video]: VideoNodeEditor.iconComponent,
  [MediaPrefabs.volumetric]: VolumetricNodeEditor.iconComponent,
  // [ScenePrefabs.cloud]: CloudsNodeEditor.iconComponent,
  // [ScenePrefabs.ocean]: OceanNodeEditor.iconComponent,
  // [ScenePrefabs.water]: WaterNodeEditor.iconComponent,
  // [ScenePrefabs.interior]: InteriorNodeEditor.iconComponent,
  [ScenePrefabs.system]: SystemNodeEditor.iconComponent,
  // [ScenePrefabs.spline]: SplineNodeEditor.iconComponent,
  // [ScenePrefabs.instancing]: InstancingNodeEditor.iconComponent,
  [ScenePrefabs.envMapbake]: EnvMapBakeNodeEditor.iconComponent
  // [ScenePrefabs.behaveGraph]: ChairIcon,
  // [ScenePrefabs.loadVolume]: ChairIcon
}
