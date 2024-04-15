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
import { Component } from '@etherealengine/ecs/src/ComponentFunctions'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { PostProcessingComponent } from '@etherealengine/engine/src/scene/components/PostProcessingComponent'
import { ShadowComponent } from '@etherealengine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { defineState } from '@etherealengine/hyperflux'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { AmbientLightComponent } from '@etherealengine/spatial/src/renderer/components/AmbientLightComponent'
import { DirectionalLightComponent } from '@etherealengine/spatial/src/renderer/components/DirectionalLightComponent'
import { FogSettingsComponent } from '@etherealengine/spatial/src/renderer/components/FogSettingsComponent'
import { HemisphereLightComponent } from '@etherealengine/spatial/src/renderer/components/HemisphereLightComponent'
import { PointLightComponent } from '@etherealengine/spatial/src/renderer/components/PointLightComponent'
import { SpotLightComponent } from '@etherealengine/spatial/src/renderer/components/SpotLightComponent'

export const PrefabShelfCategories = defineState({
  name: 'ee.editor.PrefabShelfCategories',
  initial: () => {
    return {
      'Light Prefab': [
        AmbientLightComponent,
        DirectionalLightComponent,
        HemisphereLightComponent,
        PointLightComponent,
        SpotLightComponent
      ],
      'Physics Prefab': [ColliderComponent, RigidBodyComponent, TriggerComponent],
      'Model Prefab': [ModelComponent, LoopAnimationComponent, VariantComponent, EnvmapComponent, ShadowComponent],
      'Setting Prefab': [SkyboxComponent, FogSettingsComponent, PostProcessingComponent, FogSettingsComponent]
      //will continue to add more prefabs
    } as Record<string, Component[]>
  }
})
