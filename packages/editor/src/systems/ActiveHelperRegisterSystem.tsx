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

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { DirectionalLightaddtoHelperRegistry } from '@ir-engine/spatial/src/helper/DirectionalLightHelper'
import { HemisphereLightaddtoHelperRegistry } from '@ir-engine/spatial/src/helper/HemiSphereLightHelper'
import { PointLightaddtoHelperRegistry } from '@ir-engine/spatial/src/helper/PointLightHelper'
import { SpawnPointaddtoHelperRegistry } from '@ir-engine/spatial/src/helper/SpawnPointHelper'
import { SpotLightaddtoHelperRegistry } from '@ir-engine/spatial/src/helper/SpotLightHelper'
import DirectionalLightIcon from '@ir-engine/ui/src/components/editor/assets/directional.png'
import HemisphereLightIcon from '@ir-engine/ui/src/components/editor/assets/hemisphere.png'
import PointLightIcon from '@ir-engine/ui/src/components/editor/assets/point.png'
import SpawnPointIcon from '@ir-engine/ui/src/components/editor/assets/spawnPoint.png'
import SpotLightIcon from '@ir-engine/ui/src/components/editor/assets/spot.png'
import { useEffect } from 'react'

export const populateHelperRegistry = () => {
  DirectionalLightaddtoHelperRegistry(DirectionalLightIcon)
  HemisphereLightaddtoHelperRegistry(HemisphereLightIcon)
  // EnvMapBakeaddtoHelperRegistry(DirectionalLightIcon),
  //  MediaaddtoHelperRegistry(MediaIcon),
  //  MountPointaddtoHelperRegistry(MountPointIcon),
  PointLightaddtoHelperRegistry(PointLightIcon)
  // PositionalAudioaddtoHelperRegistry(PositionalAudioIcon),
  // PortaladdtoHelperRegistry(PortalIcon),
  //  CameraIcon,
  SpotLightaddtoHelperRegistry(SpotLightIcon)
  SpawnPointaddtoHelperRegistry(SpawnPointIcon)
  //RigidBodyaddtoHelperRegistry(RigidBodyIcon),
  //TriggeraddtoHelperRegistry(TriggerIcon),
  //CollideraddtoHelperRegistry(SpawnPointIcon),
}

export const ActiveHelperRegisterSystem = defineSystem({
  uuid: 'ee.engine.ActiveHelperPopulatorSystem',
  insert: { before: PresentationSystemGroup },
  reactor: () => {
    useEffect(() => populateHelperRegistry(), [])
    return null
  }
})
