/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { VisualScriptComponent } from '@ir-engine/engine'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { LoopAnimationComponent } from '@ir-engine/engine/src/avatar/components/LoopAnimationComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GrabbableComponent } from '@ir-engine/engine/src/grabbable/GrabbableComponent'
import { InteractableComponent } from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { AudioAnalysisComponent } from '@ir-engine/engine/src/scene/components/AudioAnalysisComponent'
import { CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvmapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { GroundPlaneComponent } from '@ir-engine/engine/src/scene/components/GroundPlaneComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { InstancingComponent } from '@ir-engine/engine/src/scene/components/InstancingComponent'
import { LegacyVolumetricComponent } from '@ir-engine/engine/src/scene/components/LegacyVolumetricComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { MountPointComponent } from '@ir-engine/engine/src/scene/components/MountPointComponent'
import { ParticleSystemComponent } from '@ir-engine/engine/src/scene/components/ParticleSystemComponent'
import { PlaylistComponent } from '@ir-engine/engine/src/scene/components/PlaylistComponent'
import { PortalComponent } from '@ir-engine/engine/src/scene/components/PortalComponent'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { ReflectionProbeComponent } from '@ir-engine/engine/src/scene/components/ReflectionProbeComponent'
import { RenderSettingsComponent } from '@ir-engine/engine/src/scene/components/RenderSettingsComponent'
import { SDFComponent } from '@ir-engine/engine/src/scene/components/SDFComponent'
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { ScreenshareTargetComponent } from '@ir-engine/engine/src/scene/components/ScreenshareTargetComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@ir-engine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@ir-engine/engine/src/scene/components/SplineTrackComponent'
import { TextComponent } from '@ir-engine/engine/src/scene/components/TextComponent'
import { VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'
import { defineState } from '@ir-engine/hyperflux'
import {
  AmbientLightComponent,
  DirectionalLightComponent,
  HemisphereLightComponent,
  PointLightComponent,
  SpotLightComponent
} from '@ir-engine/spatial'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { FogSettingsComponent } from '@ir-engine/spatial/src/renderer/components/FogSettingsComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { LookAtComponent } from '@ir-engine/spatial/src/transform/components/LookAtComponent'
import { PersistentAnchorComponent } from '@ir-engine/spatial/src/xr/XRAnchorComponents'

// everything above still needs to be built
import PersistentAnchorNodeEditor from '@ir-engine/ui/src/components/editor/properties/anchor'
import LoopAnimationNodeEditor from '@ir-engine/ui/src/components/editor/properties/animation'
import AudioAnalysisEditor from '@ir-engine/ui/src/components/editor/properties/audio/analysis'
import PositionalAudioNodeEditor from '@ir-engine/ui/src/components/editor/properties/audio/positional'
import CameraNodeEditor from '@ir-engine/ui/src/components/editor/properties/camera'
import CameraPropertiesNodeEditor from '@ir-engine/ui/src/components/editor/properties/cameraProperties'
import ColliderComponentEditor from '@ir-engine/ui/src/components/editor/properties/collider'
import EnvMapBakeNodeEditor from '@ir-engine/ui/src/components/editor/properties/envMapBake'
import EnvMapEditor from '@ir-engine/ui/src/components/editor/properties/envmap'
import FogSettingsEditor from '@ir-engine/ui/src/components/editor/properties/fog'
import PrimitiveGeometryNodeEditor from '@ir-engine/ui/src/components/editor/properties/geometry/primitive'
import GLTFNodeEditor from '@ir-engine/ui/src/components/editor/properties/gltf/loader'
import GrabbableComponentNodeEditor from '@ir-engine/ui/src/components/editor/properties/grab'
import GroundPlaneNodeEditor from '@ir-engine/ui/src/components/editor/properties/groundPlane'
import ImageNodeEditor from '@ir-engine/ui/src/components/editor/properties/image'
import InputComponentNodeEditor from '@ir-engine/ui/src/components/editor/properties/input'
import InstancingNodeEditor from '@ir-engine/ui/src/components/editor/properties/instance'
import InteractableComponentNodeEditor from '@ir-engine/ui/src/components/editor/properties/interact'
import AmbientLightNodeEditor from '@ir-engine/ui/src/components/editor/properties/light/ambient'
import DirectionalLightNodeEditor from '@ir-engine/ui/src/components/editor/properties/light/directional'
import HemisphereLightNodeEditor from '@ir-engine/ui/src/components/editor/properties/light/hemisphere'
import PointLightNodeEditor from '@ir-engine/ui/src/components/editor/properties/light/point'
import SpotLightNodeEditor from '@ir-engine/ui/src/components/editor/properties/light/spot'
import LinkNodeEditor from '@ir-engine/ui/src/components/editor/properties/link'
import LookAtNodeEditor from '@ir-engine/ui/src/components/editor/properties/lookAt'
import MediaNodeEditor from '@ir-engine/ui/src/components/editor/properties/media'
import MeshNodeEditor from '@ir-engine/ui/src/components/editor/properties/mesh'
import MountPointNodeEditor from '@ir-engine/ui/src/components/editor/properties/mountPoint'
import ParticleSystemNodeEditor from '@ir-engine/ui/src/components/editor/properties/particle'
import PortalNodeEditor from '@ir-engine/ui/src/components/editor/properties/portal'
import PostProcessingSettingsEditor from '@ir-engine/ui/src/components/editor/properties/postProcessing'
import ReflectionProbeNodeEditor from '@ir-engine/ui/src/components/editor/properties/reflectionProbe'
import RenderSettingsEditor from '@ir-engine/ui/src/components/editor/properties/render'
import RigidBodyComponentEditor from '@ir-engine/ui/src/components/editor/properties/rigidBody'
import ScenePreviewCameraNodeEditor from '@ir-engine/ui/src/components/editor/properties/scene/previewCamera'
import SceneSettingsEditor from '@ir-engine/ui/src/components/editor/properties/scene/settings'
import ScreenshareTargetNodeEditor from '@ir-engine/ui/src/components/editor/properties/screenShareTarget'
import SDFEditor from '@ir-engine/ui/src/components/editor/properties/sdf'
import ShadowNodeEditor from '@ir-engine/ui/src/components/editor/properties/shadow'
import SkyboxNodeEditor from '@ir-engine/ui/src/components/editor/properties/skybox'
import SpawnPointNodeEditor from '@ir-engine/ui/src/components/editor/properties/spawnPoint'
import SplineNodeEditor from '@ir-engine/ui/src/components/editor/properties/spline'

import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import PlaylistNodeEditor from '@ir-engine/ui/src/components/editor/properties/playlist'
import SplineTrackNodeEditor from '@ir-engine/ui/src/components/editor/properties/spline/track'
import TextNodeEditor from '@ir-engine/ui/src/components/editor/properties/text'
import TriggerComponentEditor from '@ir-engine/ui/src/components/editor/properties/trigger'
import VariantNodeEditor from '@ir-engine/ui/src/components/editor/properties/variant'
import VideoNodeEditor from '@ir-engine/ui/src/components/editor/properties/video'
import VisualScriptNodeEditor from '@ir-engine/ui/src/components/editor/properties/visualScript'
import VolumetricNodeEditor from '@ir-engine/ui/src/components/editor/properties/volumetric'
import LegacyVolumetricNodeEditor from '@ir-engine/ui/src/components/editor/properties/volumetric/legacy'
import { EditorComponentType } from '../components/properties/Util'

export const ComponentEditorsState = defineState({
  name: 'ee.editor.ComponentEditorsState',
  initial: () => {
    return {
      [SceneSettingsComponent.name]: SceneSettingsEditor,
      [PostProcessingComponent.name]: PostProcessingSettingsEditor,
      // [MediaSettingsComponent.name]: MediaSettingsEditor,
      [RenderSettingsComponent.name]: RenderSettingsEditor,
      [FogSettingsComponent.name]: FogSettingsEditor,
      [CameraSettingsComponent.name]: CameraPropertiesNodeEditor,
      [CameraComponent.name]: CameraNodeEditor,
      [DirectionalLightComponent.name]: DirectionalLightNodeEditor,
      [HemisphereLightComponent.name]: HemisphereLightNodeEditor,
      [AmbientLightComponent.name]: AmbientLightNodeEditor,
      [PointLightComponent.name]: PointLightNodeEditor,
      [SpotLightComponent.name]: SpotLightNodeEditor,
      [SDFComponent.name]: SDFEditor,
      [GroundPlaneComponent.name]: GroundPlaneNodeEditor,
      [MeshComponent.name]: MeshNodeEditor,
      [GLTFComponent.name]: GLTFNodeEditor,
      [ShadowComponent.name]: ShadowNodeEditor,
      [LoopAnimationComponent.name]: LoopAnimationNodeEditor,
      [ParticleSystemComponent.name]: ParticleSystemNodeEditor,
      [PrimitiveGeometryComponent.name]: PrimitiveGeometryNodeEditor,
      [PortalComponent.name]: PortalNodeEditor,
      [MountPointComponent.name]: MountPointNodeEditor,
      [RigidBodyComponent.name]: RigidBodyComponentEditor,
      [ColliderComponent.name]: ColliderComponentEditor,
      [TriggerComponent.name]: TriggerComponentEditor,
      [ScenePreviewCameraComponent.name]: ScenePreviewCameraNodeEditor,
      [SkyboxComponent.name]: SkyboxNodeEditor,
      [SpawnPointComponent.name]: SpawnPointNodeEditor,
      [MediaComponent.name]: MediaNodeEditor,
      [ImageComponent.name]: ImageNodeEditor,
      [PositionalAudioComponent.name]: PositionalAudioNodeEditor,
      [AudioAnalysisComponent.name]: AudioAnalysisEditor,
      [VideoComponent.name]: VideoNodeEditor,
      [LegacyVolumetricComponent.name]: LegacyVolumetricNodeEditor,
      [VolumetricComponent.name]: VolumetricNodeEditor,
      [PlaylistComponent.name]: PlaylistNodeEditor,
      [EnvmapComponent.name]: EnvMapEditor,
      [EnvMapBakeComponent.name]: EnvMapBakeNodeEditor,
      [InstancingComponent.name]: InstancingNodeEditor,
      [PersistentAnchorComponent.name]: PersistentAnchorNodeEditor,
      [VariantComponent.name]: VariantNodeEditor,
      [SplineComponent.name]: SplineNodeEditor,
      [SplineTrackComponent.name]: SplineTrackNodeEditor,
      [VisualScriptComponent.name]: VisualScriptNodeEditor,
      [LinkComponent.name]: LinkNodeEditor,
      [InteractableComponent.name]: InteractableComponentNodeEditor,
      [InputComponent.name]: InputComponentNodeEditor,
      [GrabbableComponent.name]: GrabbableComponentNodeEditor,
      [ScreenshareTargetComponent.name]: ScreenshareTargetNodeEditor,
      [TextComponent.name]: TextNodeEditor,
      [LookAtComponent.name]: LookAtNodeEditor,
      [ReflectionProbeComponent.name]: ReflectionProbeNodeEditor
    } as Record<string, EditorComponentType>
  }
})
