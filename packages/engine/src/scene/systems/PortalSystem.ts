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

import { useEffect } from 'react'

import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent, getMutableComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { SpawnPoseState } from '@ir-engine/spatial'
import { FollowCameraMode } from '@ir-engine/spatial/src/camera/types/FollowCameraMode'

import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { PortalComponent, PortalState } from '../components/PortalComponent'

const reactor = () => {
  const activePortalEntityState = useHookstate(getMutableState(PortalState).activePortalEntity)

  useEffect(() => {
    const activePortalEntity = activePortalEntityState.value
    if (!activePortalEntity) return
    const activePortal = getComponent(activePortalEntity, PortalComponent)
    getMutableComponent(Engine.instance.cameraEntity, FollowCameraComponent).mode.set(FollowCameraMode.ShoulderCam)
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    AvatarControllerComponent.captureMovement(selfAvatarEntity, activePortalEntity)

    return () => {
      const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
      getState(SpawnPoseState)[getComponent(selfAvatarEntity, UUIDComponent)].spawnPosition.copy(
        activePortal.remoteSpawnPosition
      )
      AvatarControllerComponent.releaseMovement(selfAvatarEntity, activePortalEntity)
      getMutableState(PortalState).lastPortalTimeout.set(Date.now())
    }
  }, [activePortalEntityState])

  return null
}

export const PortalSystem = defineSystem({
  uuid: 'ee.engine.PortalSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
