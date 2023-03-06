import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { MediaPrefabs } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { Component } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { PhysicsPrefabs } from '@etherealengine/engine/src/physics/systems/PhysicsSystem'
import { AmbientLightComponent } from '@etherealengine/engine/src/scene/components/AmbientLightComponent'
import { CloudComponent } from '@etherealengine/engine/src/scene/components/CloudComponent'
import { ColliderComponent } from '@etherealengine/engine/src/scene/components/ColliderComponent'
import { DirectionalLightComponent } from '@etherealengine/engine/src/scene/components/DirectionalLightComponent'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { GroundPlaneComponent } from '@etherealengine/engine/src/scene/components/GroundPlaneComponent'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { HemisphereLightComponent } from '@etherealengine/engine/src/scene/components/HemisphereLightComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { InstancingComponent } from '@etherealengine/engine/src/scene/components/InstancingComponent'
import { InteriorComponent } from '@etherealengine/engine/src/scene/components/InteriorComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { MountPointComponent } from '@etherealengine/engine/src/scene/components/MountPointComponent'
import { OceanComponent } from '@etherealengine/engine/src/scene/components/OceanComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { PointLightComponent } from '@etherealengine/engine/src/scene/components/PointLightComponent'
import { PortalComponent } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { SceneTagComponent } from '@etherealengine/engine/src/scene/components/SceneTagComponent'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@etherealengine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SpotLightComponent } from '@etherealengine/engine/src/scene/components/SpotLightComponent'
import { SystemComponent } from '@etherealengine/engine/src/scene/components/SystemComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import { WaterComponent } from '@etherealengine/engine/src/scene/components/WaterComponent'
import { LightPrefabs } from '@etherealengine/engine/src/scene/systems/LightSystem'
import { ScenePrefabs } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { PersistentAnchorComponent } from '@etherealengine/engine/src/xr/XRAnchorComponents'

import ChairIcon from '@mui/icons-material/Chair'

import AmbientLightNodeEditor from '../components/properties/AmbientLightNodeEditor'
import CloudsNodeEditor from '../components/properties/CloudsNodeEditor'
import ColliderNodeEditor from '../components/properties/ColliderNodeEditor'
import DirectionalLightNodeEditor from '../components/properties/DirectionalLightNodeEditor'
import EnvMapBakeNodeEditor from '../components/properties/EnvMapBakeNodeEditor'
import EnvMapEditor from '../components/properties/EnvMapEditor'
import GroundPlaneNodeEditor from '../components/properties/GroundPlaneNodeEditor'
import GroupNodeEditor from '../components/properties/GroupNodeEditor'
import HemisphereLightNodeEditor from '../components/properties/HemisphereLightNodeEditor'
import ImageNodeEditor from '../components/properties/ImageNodeEditor'
import InstancingNodeEditor from '../components/properties/InstancingNodeEditor'
import InteriorNodeEditor from '../components/properties/InteriorNodeEditor'
import MediaNodeEditor from '../components/properties/MediaNodeEditor'
import ModelNodeEditor from '../components/properties/ModelNodeEditor'
import MountPointNodeEditor from '../components/properties/MountPointNodeEditor'
import OceanNodeEditor from '../components/properties/OceanNodeEditor'
import ParticleSystemNodeEditor from '../components/properties/ParticleSystemNodeEditor'
import PersistentAnchorNodeEditor from '../components/properties/PersistentAnchorNodeEditor'
import PointLightNodeEditor from '../components/properties/PointLightNodeEditor'
import PortalNodeEditor from '../components/properties/PortalNodeEditor'
import PositionalAudioNodeEditor from '../components/properties/PositionalAudioNodeEditor'
import { PrefabNodeEditor } from '../components/properties/PrefabNodeEditor'
import SceneNodeEditor from '../components/properties/SceneNodeEditor'
import ScenePreviewCameraNodeEditor from '../components/properties/ScenePreviewCameraNodeEditor'
import SkyboxNodeEditor from '../components/properties/SkyboxNodeEditor'
import SpawnPointNodeEditor from '../components/properties/SpawnPointNodeEditor'
import SplineNodeEditor from '../components/properties/SplineNodeEditor'
import SpotLightNodeEditor from '../components/properties/SpotLightNodeEditor'
import SystemNodeEditor from '../components/properties/SystemNodeEditor'
import TransformPropertyGroup from '../components/properties/TransformPropertyGroup'
import { EditorComponentType } from '../components/properties/Util'
import VideoNodeEditor from '../components/properties/VideoNodeEditor'
import VolumetricNodeEditor from '../components/properties/VolumetricNodeEditor'
import WaterNodeEditor from '../components/properties/WaterNodeEditor'

export const EntityNodeEditor = new Map<Component, EditorComponentType>()
EntityNodeEditor.set(TransformComponent, TransformPropertyGroup)
EntityNodeEditor.set(DirectionalLightComponent, DirectionalLightNodeEditor)
EntityNodeEditor.set(HemisphereLightComponent, HemisphereLightNodeEditor)
EntityNodeEditor.set(AmbientLightComponent, AmbientLightNodeEditor)
EntityNodeEditor.set(PointLightComponent, PointLightNodeEditor)
EntityNodeEditor.set(SpotLightComponent, SpotLightNodeEditor)
EntityNodeEditor.set(GroundPlaneComponent, GroundPlaneNodeEditor)
EntityNodeEditor.set(ModelComponent, ModelNodeEditor)
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
EntityNodeEditor.set(CloudComponent, CloudsNodeEditor)
EntityNodeEditor.set(OceanComponent, OceanNodeEditor)
EntityNodeEditor.set(WaterComponent, WaterNodeEditor)
EntityNodeEditor.set(InteriorComponent, InteriorNodeEditor)
EntityNodeEditor.set(SystemComponent, SystemNodeEditor)
EntityNodeEditor.set(SplineComponent, SplineNodeEditor)
EntityNodeEditor.set(EnvmapComponent, EnvMapEditor)
EntityNodeEditor.set(EnvMapBakeComponent, EnvMapBakeNodeEditor)
EntityNodeEditor.set(InstancingComponent, InstancingNodeEditor)
EntityNodeEditor.set(PersistentAnchorComponent, PersistentAnchorNodeEditor)

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
  [ScenePrefabs.chair]: ChairIcon,
  [ScenePrefabs.group]: GroupNodeEditor.iconComponent,
  [ScenePrefabs.prefab]: InteriorNodeEditor.iconComponent,
  [ScenePrefabs.skybox]: SkyboxNodeEditor.iconComponent,
  [ScenePrefabs.spawnPoint]: SpawnPointNodeEditor.iconComponent,
  [ScenePrefabs.image]: ImageNodeEditor.iconComponent,
  [MediaPrefabs.audio]: PositionalAudioNodeEditor.iconComponent,
  [MediaPrefabs.video]: VideoNodeEditor.iconComponent,
  [MediaPrefabs.volumetric]: VolumetricNodeEditor.iconComponent,
  [ScenePrefabs.cloud]: CloudsNodeEditor.iconComponent,
  [ScenePrefabs.ocean]: OceanNodeEditor.iconComponent,
  [ScenePrefabs.water]: WaterNodeEditor.iconComponent,
  [ScenePrefabs.interior]: InteriorNodeEditor.iconComponent,
  [ScenePrefabs.system]: SystemNodeEditor.iconComponent,
  [ScenePrefabs.spline]: SplineNodeEditor.iconComponent,
  [ScenePrefabs.instancing]: InstancingNodeEditor.iconComponent,
  [ScenePrefabs.envMapbake]: EnvMapBakeNodeEditor.iconComponent,
  [ScenePrefabs.behaveGraph]: ChairIcon
}
