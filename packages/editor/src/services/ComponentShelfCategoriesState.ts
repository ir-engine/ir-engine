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

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { Component } from '@ir-engine/ecs'
import { VisualScriptComponent } from '@ir-engine/engine'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { LoopAnimationComponent } from '@ir-engine/engine/src/avatar/components/LoopAnimationComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GrabbableComponent } from '@ir-engine/engine/src/interaction/components/GrabbableComponent'
import { InteractableComponent } from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { AudioAnalysisComponent } from '@ir-engine/engine/src/scene/components/AudioAnalysisComponent'
import { CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvmapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { GroundPlaneComponent } from '@ir-engine/engine/src/scene/components/GroundPlaneComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { LegacyVolumetricComponent } from '@ir-engine/engine/src/scene/components/LegacyVolumetricComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { MountPointComponent } from '@ir-engine/engine/src/scene/components/MountPointComponent'
import { ParticleSystemComponent } from '@ir-engine/engine/src/scene/components/ParticleSystemComponent'
import { PortalComponent } from '@ir-engine/engine/src/scene/components/PortalComponent'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { RenderSettingsComponent } from '@ir-engine/engine/src/scene/components/RenderSettingsComponent'
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { ScreenshareTargetComponent } from '@ir-engine/engine/src/scene/components/ScreenshareTargetComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@ir-engine/engine/src/scene/components/SpawnPointComponent'
import { TextComponent } from '@ir-engine/engine/src/scene/components/TextComponent'
import { VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'
import { defineState, getMutableState } from '@ir-engine/hyperflux'
import {
  AmbientLightComponent,
  DirectionalLightComponent,
  HemisphereLightComponent,
  PointLightComponent,
  SpotLightComponent
} from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { FogSettingsComponent } from '@ir-engine/spatial/src/renderer/components/FogSettingsComponent'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { LookAtComponent } from '@ir-engine/spatial/src/transform/components/LookAtComponent'
import { useEffect } from 'react'

export const ComponentShelfCategoriesState = defineState({
  name: 'ee.editor.ComponentShelfCategories',
  initial: () => {
    return {
      Files: [GLTFComponent, PositionalAudioComponent, AudioAnalysisComponent, VideoComponent, ImageComponent],
      'Scene Composition': [CameraComponent, PrimitiveGeometryComponent, GroundPlaneComponent, VariantComponent],
      Physics: [ColliderComponent, RigidBodyComponent, TriggerComponent],
      Interaction: [
        SpawnPointComponent,
        LinkComponent,
        MountPointComponent,
        InteractableComponent,
        InputComponent,
        ScreenshareTargetComponent
      ],
      Lighting: [
        AmbientLightComponent,
        PointLightComponent,
        SpotLightComponent,
        DirectionalLightComponent,
        HemisphereLightComponent
      ],
      FX: [LoopAnimationComponent, ShadowComponent, ParticleSystemComponent, EnvmapComponent, PostProcessingComponent],
      Scripting: [],
      Settings: [
        SceneSettingsComponent,
        RenderSettingsComponent,
        // MediaSettingsComponent
        CameraSettingsComponent
      ],
      Visual: [
        EnvMapBakeComponent,
        ScenePreviewCameraComponent,
        SkyboxComponent,
        TextComponent,
        LookAtComponent,
        FogSettingsComponent
      ]
    } as Record<string, Component[]>
  },
  reactor: () => {
    const [visualScriptPanelEnabled] = useFeatureFlags([FeatureFlags.Studio.Panel.VisualScript])
    const [portalEnabled] = useFeatureFlags([FeatureFlags.Studio.Panel.Portal])
    const [grabbleEnabled] = useFeatureFlags([FeatureFlags.Studio.Panel.Grabble])

    const [legacyVolumetricEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.LegacyVolumetric])
    const [volumetricEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.Volumetric])
    const [audioAnalysisEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.AudioAnalysis])
    const [screenshareTargetEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.ScreenshareTarget])

    const cShelfState = getMutableState(ComponentShelfCategoriesState)
    useEffect(() => {
      if (visualScriptPanelEnabled) {
        cShelfState.Scripting.merge([VisualScriptComponent])
        return () => {
          cShelfState.Scripting.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == VisualScriptComponent.name))
          })
        }
      }
    }, [visualScriptPanelEnabled])

    useEffect(() => {
      if (portalEnabled) {
        cShelfState.Interaction.merge([PortalComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == PortalComponent.name))
          })
        }
      }
    }, [portalEnabled])

    useEffect(() => {
      if (grabbleEnabled) {
        cShelfState.Interaction.merge([GrabbableComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == GrabbableComponent.name))
          })
        }
      }
    }, [grabbleEnabled])

    useEffect(() => {
      if (legacyVolumetricEnabled) {
        cShelfState.Interaction.merge([LegacyVolumetricComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == LegacyVolumetricComponent.name))
          })
        }
      }
    }, [legacyVolumetricEnabled])

    useEffect(() => {
      if (volumetricEnabled) {
        cShelfState.Interaction.merge([VolumetricComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == VolumetricComponent.name))
          })
        }
      }
    }, [volumetricEnabled])

    useEffect(() => {
      if (audioAnalysisEnabled) {
        cShelfState.Interaction.merge([AudioAnalysisComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == AudioAnalysisComponent.name))
          })
        }
      }
    }, [audioAnalysisEnabled])

    useEffect(() => {
      if (screenshareTargetEnabled) {
        cShelfState.Interaction.merge([ScreenshareTargetComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == ScreenshareTargetComponent.name))
          })
        }
      }
    }, [screenshareTargetEnabled])
  }
})
