import { AudioComponent } from '@xrengine/engine/src/audio/components/AudioComponent'
import { MediaPrefabs } from '@xrengine/engine/src/audio/systems/AudioSystem'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getAllComponents } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PhysicsPrefabs } from '@xrengine/engine/src/physics/systems/PhysicsSystem'
import { AmbientLightComponent } from '@xrengine/engine/src/scene/components/AmbientLightComponent'
import { AssetComponent } from '@xrengine/engine/src/scene/components/AssetComponent'
import { CameraPropertiesComponent } from '@xrengine/engine/src/scene/components/CameraPropertiesComponent'
import { CloudComponent } from '@xrengine/engine/src/scene/components/CloudComponent'
import { ColliderComponent } from '@xrengine/engine/src/scene/components/ColliderComponent'
import { DirectionalLightComponent } from '@xrengine/engine/src/scene/components/DirectionalLightComponent'
import { EnvMapBakeComponent } from '@xrengine/engine/src/scene/components/EnvMapBakeComponent'
import { FogComponent } from '@xrengine/engine/src/scene/components/FogComponent'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'
import { GroupComponent } from '@xrengine/engine/src/scene/components/GroupComponent'
import { HemisphereLightComponent } from '@xrengine/engine/src/scene/components/HemisphereLightComponent'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'
import { InstancingComponent } from '@xrengine/engine/src/scene/components/InstancingComponent'
import { InteriorComponent } from '@xrengine/engine/src/scene/components/InteriorComponent'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { MountPointComponent } from '@xrengine/engine/src/scene/components/MountPointComponent'
import { NavMeshComponent } from '@xrengine/engine/src/scene/components/NavMeshComponent'
import { OceanComponent } from '@xrengine/engine/src/scene/components/OceanComponent'
import { ParticleEmitterComponent } from '@xrengine/engine/src/scene/components/ParticleEmitterComponent'
import { PointLightComponent } from '@xrengine/engine/src/scene/components/PointLightComponent'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { PostprocessingComponent } from '@xrengine/engine/src/scene/components/PostprocessingComponent'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { SceneTagComponent } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { SkyboxComponent } from '@xrengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@xrengine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@xrengine/engine/src/scene/components/SplineComponent'
import { SpotLightComponent } from '@xrengine/engine/src/scene/components/SpotLightComponent'
import { SystemComponent } from '@xrengine/engine/src/scene/components/SystemComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@xrengine/engine/src/scene/components/VolumetricComponent'
import { WaterComponent } from '@xrengine/engine/src/scene/components/WaterComponent'
import { LightPrefabs } from '@xrengine/engine/src/scene/systems/LightSystem'
import { ScenePrefabs } from '@xrengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import ChairIcon from '@mui/icons-material/Chair'

import AmbientLightNodeEditor from '../components/properties/AmbientLightNodeEditor'
import { AssetNodeEditor } from '../components/properties/AssetNodeEditor'
import AudioNodeEditor from '../components/properties/AudioNodeEditor'
import CameraPropertiesNodeEditor from '../components/properties/CameraPropertiesNodeEditor'
import CloudsNodeEditor from '../components/properties/CloudsNodeEditor'
import ColliderNodeEditor from '../components/properties/ColliderNodeEditor'
import { DefaultNodeEditor } from '../components/properties/DefaultNodeEditor'
import DirectionalLightNodeEditor from '../components/properties/DirectionalLightNodeEditor'
import EnvMapBakeNodeEditor from '../components/properties/EnvMapBakeNodeEditor'
import FogNodeEditor from '../components/properties/FogNodeEditor'
import GroundPlaneNodeEditor from '../components/properties/GroundPlaneNodeEditor'
import GroupNodeEditor from '../components/properties/GroupNodeEditor'
import HemisphereLightNodeEditor from '../components/properties/HemisphereLightNodeEditor'
import ImageNodeEditor from '../components/properties/ImageNodeEditor'
import InstancingNodeEditor from '../components/properties/InstancingNodeEditor'
import InteriorNodeEditor from '../components/properties/InteriorNodeEditor'
import MediaNodeEditor from '../components/properties/MediaNodeEditor'
import ModelNodeEditor from '../components/properties/ModelNodeEditor'
import MountPointNodeEditor from '../components/properties/MountPointNodeEditor'
import NavMeshNodeEditor from '../components/properties/NavMeshNodeEditor'
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
import TransformPropertyGroup from '../components/properties/TransformPropertyGroup'
import { EditorComponentType } from '../components/properties/Util'
import VideoNodeEditor from '../components/properties/VideoNodeEditor'
import VolumetricNodeEditor from '../components/properties/VolumetricNodeEditor'
import WaterNodeEditor from '../components/properties/WaterNodeEditor'

export const getNodeEditorsForEntity = (entity: Entity): EditorComponentType[] => {
  const components = getAllComponents(entity)
  if (!components.length) return [DefaultNodeEditor]

  const editors = [] as EditorComponentType[]

  for (let i = 0; i < components.length; i++) {
    if (EntityNodeEditor[components[i]._name]) {
      editors.push(EntityNodeEditor[components[i]._name])
    } else {
      /** @todo */
      // editors.push((props) => {
      //   return <NodeEditor {...props} name={entityNode[i]}/>
      // })
    }
  }

  return editors.length ? editors : [DefaultNodeEditor]
}

export const EntityNodeEditor = {
  [TransformComponent._name]: TransformPropertyGroup,
  [DirectionalLightComponent._name]: DirectionalLightNodeEditor,
  [HemisphereLightComponent._name]: HemisphereLightNodeEditor,
  [AmbientLightComponent._name]: AmbientLightNodeEditor,
  [PointLightComponent._name]: PointLightNodeEditor,
  [SpotLightComponent._name]: SpotLightNodeEditor,
  [GroundPlaneComponent._name]: GroundPlaneNodeEditor,
  [CameraPropertiesComponent._name]: CameraPropertiesNodeEditor,
  [ModelComponent._name]: ModelNodeEditor,
  [ParticleEmitterComponent._name]: ParticleEmitterNodeEditor,
  [PortalComponent._name]: PortalNodeEditor,
  [MountPointComponent._name]: MountPointNodeEditor,
  [ColliderComponent._name]: ColliderNodeEditor,
  [GroupComponent._name]: GroupNodeEditor,
  [AssetComponent._name]: AssetNodeEditor,
  [PostprocessingComponent._name]: PostProcessingNodeEditor,
  [SceneTagComponent._name]: SceneNodeEditor,
  [ScenePreviewCameraTagComponent._name]: ScenePreviewCameraNodeEditor,
  [SkyboxComponent._name]: SkyboxNodeEditor,
  [SpawnPointComponent._name]: SpawnPointNodeEditor,
  [MediaComponent._name]: MediaNodeEditor,
  [ImageComponent._name]: ImageNodeEditor,
  [AudioComponent._name]: AudioNodeEditor,
  [VideoComponent._name]: VideoNodeEditor,
  [VolumetricComponent._name]: VolumetricNodeEditor,
  [CloudComponent._name]: CloudsNodeEditor,
  [OceanComponent._name]: OceanNodeEditor,
  [WaterComponent._name]: WaterNodeEditor,
  [InteriorComponent._name]: InteriorNodeEditor,
  [SystemComponent._name]: SystemNodeEditor,
  [SplineComponent._name]: SplineNodeEditor,
  [EnvMapBakeComponent._name]: EnvMapBakeNodeEditor,
  [InstancingComponent._name]: InstancingNodeEditor,
  [FogComponent._name]: FogNodeEditor,
  [NavMeshComponent._name]: NavMeshNodeEditor
}

export const prefabIcons = {
  [LightPrefabs.ambientLight]: AmbientLightNodeEditor.iconComponent,
  [LightPrefabs.pointLight]: PointLightNodeEditor.iconComponent,
  [LightPrefabs.spotLight]: SpotLightNodeEditor.iconComponent,
  [LightPrefabs.directionalLight]: DirectionalLightNodeEditor.iconComponent,
  [LightPrefabs.hemisphereLight]: HemisphereLightNodeEditor.iconComponent,
  [ScenePrefabs.groundPlane]: GroundPlaneNodeEditor.iconComponent,
  [ScenePrefabs.model]: ModelNodeEditor.iconComponent,
  [ScenePrefabs.cameraProperties]: CameraPropertiesNodeEditor.iconComponent,
  [ScenePrefabs.previewCamera]: ScenePreviewCameraNodeEditor.iconComponent,
  [ScenePrefabs.particleEmitter]: ParticleEmitterNodeEditor.iconComponent,
  [ScenePrefabs.portal]: PortalNodeEditor.iconComponent,
  [PhysicsPrefabs.collider]: ColliderNodeEditor.iconComponent,
  [ScenePrefabs.chair]: ChairIcon,
  [ScenePrefabs.group]: GroupNodeEditor.iconComponent,
  [ScenePrefabs.asset]: InteriorNodeEditor.iconComponent,
  [ScenePrefabs.postProcessing]: PostProcessingNodeEditor.iconComponent,
  [ScenePrefabs.previewCamera]: ScenePreviewCameraNodeEditor.iconComponent,
  [ScenePrefabs.skybox]: SkyboxNodeEditor.iconComponent,
  [ScenePrefabs.spawnPoint]: SpawnPointNodeEditor.iconComponent,
  [ScenePrefabs.image]: ImageNodeEditor.iconComponent,
  [MediaPrefabs.audio]: AudioNodeEditor.iconComponent,
  [MediaPrefabs.video]: VideoNodeEditor.iconComponent,
  [MediaPrefabs.volumetric]: VolumetricNodeEditor.iconComponent,
  [ScenePrefabs.cloud]: CloudsNodeEditor.iconComponent,
  [ScenePrefabs.ocean]: OceanNodeEditor.iconComponent,
  [ScenePrefabs.water]: WaterNodeEditor.iconComponent,
  [ScenePrefabs.interior]: InteriorNodeEditor.iconComponent,
  [ScenePrefabs.system]: SystemNodeEditor.iconComponent,
  [ScenePrefabs.spline]: SplineNodeEditor.iconComponent,
  [ScenePrefabs.fog]: FogNodeEditor.iconComponent,
  [ScenePrefabs.instancing]: InstancingNodeEditor.iconComponent,
  [ScenePrefabs.envMapbake]: EnvMapBakeNodeEditor.iconComponent,
  [ScenePrefabs.navMesh]: NavMeshNodeEditor.iconComponent
}
