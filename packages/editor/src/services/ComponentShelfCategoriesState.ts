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

import { Component } from '@etherealengine/ecs'
import { VisualScriptComponent } from '@etherealengine/engine'
import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { GrabbableComponent } from '@etherealengine/engine/src/interaction/components/GrabbableComponent'
import { InteractableComponent } from '@etherealengine/engine/src/interaction/components/InteractableComponent'
import { AudioAnalysisComponent } from '@etherealengine/engine/src/scene/components/AudioAnalysisComponent'
import { CameraSettingsComponent } from '@etherealengine/engine/src/scene/components/CameraSettingsComponent'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { GroundPlaneComponent } from '@etherealengine/engine/src/scene/components/GroundPlaneComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { LinkComponent } from '@etherealengine/engine/src/scene/components/LinkComponent'
import { MediaSettingsComponent } from '@etherealengine/engine/src/scene/components/MediaSettingsComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { MountPointComponent } from '@etherealengine/engine/src/scene/components/MountPointComponent'
import { NewVolumetricComponent } from '@etherealengine/engine/src/scene/components/NewVolumetricComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { PortalComponent } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { PrimitiveGeometryComponent } from '@etherealengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { ReflectionProbeComponent } from '@etherealengine/engine/src/scene/components/ReflectionProbeComponent'
import { RenderSettingsComponent } from '@etherealengine/engine/src/scene/components/RenderSettingsComponent'
import { SDFComponent } from '@etherealengine/engine/src/scene/components/SDFComponent'
import { SceneDynamicLoadTagComponent } from '@etherealengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { SceneSettingsComponent } from '@etherealengine/engine/src/scene/components/SceneSettingsComponent'
import { ScreenshareTargetComponent } from '@etherealengine/engine/src/scene/components/ScreenshareTargetComponent'
import { ShadowComponent } from '@etherealengine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@etherealengine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'
import { TextComponent } from '@etherealengine/engine/src/scene/components/TextComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import { defineState } from '@etherealengine/hyperflux'
import {
  AmbientLightComponent,
  DirectionalLightComponent,
  HemisphereLightComponent,
  PointLightComponent,
  SpotLightComponent
} from '@etherealengine/spatial'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { PostProcessingComponent } from '@etherealengine/spatial/src/renderer/components/PostProcessingComponent'
import { LookAtComponent } from '@etherealengine/spatial/src/transform/components/LookAtComponent'

export const ComponentShelfCategoriesState = defineState({
  name: 'ee.editor.ComponentShelfCategories',
  initial: () => {
    return {
      Files: [
        ModelComponent,
        VolumetricComponent,
        NewVolumetricComponent,
        PositionalAudioComponent,
        AudioAnalysisComponent,
        VideoComponent,
        ImageComponent
      ],
      'Scene Composition': [
        PrimitiveGeometryComponent,
        GroundPlaneComponent,
        GroupComponent,
        VariantComponent,
        SceneDynamicLoadTagComponent
      ],
      Physics: [ColliderComponent, RigidBodyComponent, TriggerComponent],
      Interaction: [
        SpawnPointComponent,
        PortalComponent,
        LinkComponent,
        MountPointComponent,
        InteractableComponent,
        InputComponent,
        GrabbableComponent
      ],
      Lighting: [
        AmbientLightComponent,
        PointLightComponent,
        SpotLightComponent,
        DirectionalLightComponent,
        HemisphereLightComponent
      ],
      FX: [
        LoopAnimationComponent,
        ShadowComponent,
        ParticleSystemComponent,
        EnvmapComponent,
        SDFComponent,
        PostProcessingComponent,
        ReflectionProbeComponent
      ],
      Scripting: [VisualScriptComponent],
      Settings: [SceneSettingsComponent, RenderSettingsComponent, MediaSettingsComponent, CameraSettingsComponent],
      Visual: [
        EnvMapBakeComponent,
        ScenePreviewCameraComponent,
        SkyboxComponent,
        SplineTrackComponent,
        SplineComponent,
        TextComponent,
        ScreenshareTargetComponent,
        LookAtComponent
      ]
    } as Record<string, Component[]>
  }
})
