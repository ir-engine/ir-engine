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

import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { MountPointComponent } from '@ir-engine/engine/src/scene/components/MountPointComponent'
import { PortalComponent } from '@ir-engine/engine/src/scene/components/PortalComponent'
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { SpawnPointComponent } from '@ir-engine/engine/src/scene/components/SpawnPointComponent'
import { TriggerCallbackComponent } from '@ir-engine/engine/src/scene/components/TriggerCallbackComponent'
import { defineState } from '@ir-engine/hyperflux'
import {
  DirectionalLightComponent,
  HemisphereLightComponent,
  PointLightComponent,
  SpotLightComponent
} from '@ir-engine/spatial'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import BoxColliderIcon from '@ir-engine/ui/src/components/editor/assets/boxCollider.png'
import CameraIcon from '@ir-engine/ui/src/components/editor/assets/camera.png'
import DirectionalLightIcon from '@ir-engine/ui/src/components/editor/assets/directional.png'
import EnvMapBakeIcon from '@ir-engine/ui/src/components/editor/assets/envMap.png'
import HemisphereLightIcon from '@ir-engine/ui/src/components/editor/assets/hemisphere.png'
import MediaIcon from '@ir-engine/ui/src/components/editor/assets/media.png'
import MountPointIcon from '@ir-engine/ui/src/components/editor/assets/mountPoint.png'
import PointLightIcon from '@ir-engine/ui/src/components/editor/assets/point.png'
import PortalIcon from '@ir-engine/ui/src/components/editor/assets/portal.png'
import PositionalAudioIcon from '@ir-engine/ui/src/components/editor/assets/positionalAudio.png'
import RigidBodyIcon from '@ir-engine/ui/src/components/editor/assets/rigidBody.png'
import SpawnPointIcon from '@ir-engine/ui/src/components/editor/assets/spawnPoint.png'
import SpotLightIcon from '@ir-engine/ui/src/components/editor/assets/spot.png'
import TriggerIcon from '@ir-engine/ui/src/components/editor/assets/trigger.png'
import { ColliderHelperReactor } from './ColliderHelper'
import { DirectionalLightHelperReactor } from './DirectionalLightHelper'
import { EnvmapBakeHelperReactor } from './EnvmapBakeHelper'
import { HemiSphereLightHelperReactor } from './HemiSphereLightHelper'
import { MediaHelperReactor } from './MediaHelper'
import { MountPointHelperReactor } from './MountPointHelper'
import { PointLightHelperReactor } from './PointLightHelper'
import { PortalHelperReactor } from './PortalHelper'
import { PositionalAudioHelperReactor } from './PositionalAudioHelper'
import { ScenePreviewCameraHelperReactor } from './ScenePreviewCameraHelper'
import { SpawnPointHelperReactor } from './SpawnPointHelper'
import { SpotLightHelperReactor } from './SpotLightHelper'

export interface ComponentHelperEntry {
  reactor?: React.FC
  icon?: any
  directional?: boolean
  volume?: boolean
  priority: number
}

export const ComponentHelperState = defineState({
  name: 'ee.editor.ComponentHelperState',
  initial: () => {
    return {
      [DirectionalLightComponent.jsonID]: {
        icon: DirectionalLightIcon,
        reactor: DirectionalLightHelperReactor,
        directional: true,
        priority: 3
      },
      [EnvMapBakeComponent.jsonID]: {
        icon: EnvMapBakeIcon,
        reactor: EnvmapBakeHelperReactor,
        priority: 2
      },
      [MediaComponent.jsonID]: {
        icon: MediaIcon,
        reactor: MediaHelperReactor,
        priority: 1
      },
      [HemisphereLightComponent.jsonID]: {
        icon: HemisphereLightIcon,
        reactor: HemiSphereLightHelperReactor,
        priority: 3
      },
      [MountPointComponent.jsonID]: {
        icon: MountPointIcon,
        reactor: MountPointHelperReactor,
        volume: true,
        priority: 1
      },
      [PointLightComponent.jsonID]: {
        icon: PointLightIcon,
        reactor: PointLightHelperReactor,
        priority: 3
      },
      [PositionalAudioComponent.jsonID]: {
        icon: PositionalAudioIcon,
        reactor: PositionalAudioHelperReactor,
        directional: true,
        priority: 2
      },
      [PortalComponent.jsonID]: {
        icon: PortalIcon,
        reactor: PortalHelperReactor,
        priority: 2
      },
      [ScenePreviewCameraComponent.jsonID]: {
        icon: CameraIcon,
        reactor: ScenePreviewCameraHelperReactor,
        directional: true,
        priority: 2
      },
      [SpotLightComponent.jsonID]: {
        icon: SpotLightIcon,
        reactor: SpotLightHelperReactor,
        directional: true,
        priority: 3
      },
      [SpawnPointComponent.jsonID]: {
        icon: SpawnPointIcon,
        reactor: SpawnPointHelperReactor,
        directional: true,
        volume: true,
        priority: 2
      },
      [RigidBodyComponent.jsonID]: {
        icon: RigidBodyIcon,
        volume: true,
        priority: 0
      },
      [TriggerCallbackComponent.jsonID]: {
        icon: TriggerIcon,
        volume: true,
        priority: 0
      },
      [ColliderComponent.jsonID]: {
        icon: BoxColliderIcon,
        reactor: ColliderHelperReactor,
        volume: true,
        priority: -1
      },
      [GLTFComponent.jsonID]: {
        volume: true,
        priority: -1
      }
    } as Record<string, ComponentHelperEntry>
  }
})
