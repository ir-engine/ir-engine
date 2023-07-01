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

import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { AvatarStates } from '../../../avatar/animation/Util'
import { AvatarControllerComponent } from '../../../avatar/components/AvatarControllerComponent'
import { SpawnPoseComponent } from '../../../avatar/components/SpawnPoseComponent'
import { teleportAvatar } from '../../../avatar/functions/moveAvatar'
import { switchCameraMode } from '../../../avatar/functions/switchCameraMode'
import { AvatarNetworkAction } from '../../../avatar/state/AvatarNetworkState'
import { CameraMode } from '../../../camera/types/CameraMode'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { PortalComponent } from '../../components/PortalComponent'
import { UUIDComponent } from '../../components/UUIDComponent'

export const setAvatarToLocationTeleportingState = () => {
  switchCameraMode(Engine.instance.cameraEntity, { cameraMode: CameraMode.ShoulderCam })
  getComponent(Engine.instance.localClientEntity, AvatarControllerComponent).movementEnabled = false
  dispatchAction(
    AvatarNetworkAction.setAnimationState({
      animationState: AvatarStates.FALL_IDLE,
      entityUUID: getComponent(Engine.instance.localClientEntity, UUIDComponent)
    })
  )
}

export const revertAvatarToMovingStateFromTeleport = () => {
  const localClientEntity = Engine.instance.localClientEntity
  getComponent(localClientEntity, SpawnPoseComponent).position.copy(Engine.instance.activePortal!.remoteSpawnPosition)
  getComponent(localClientEntity, AvatarControllerComponent).movementEnabled = true

  // teleport player to where the portal spawn position is
  teleportAvatar(localClientEntity, Engine.instance.activePortal!.remoteSpawnPosition)

  Engine.instance.activePortal = null
  dispatchAction(EngineActions.setTeleporting({ isTeleporting: false, $time: Date.now() + 500 }))
}

export const portalTriggerEnter = (triggerEntity: Entity) => {
  if (!getState(EngineState).isTeleporting && getComponent(triggerEntity, PortalComponent)) {
    const portalComponent = getComponent(triggerEntity, PortalComponent)
    Engine.instance.activePortal = portalComponent
    dispatchAction(EngineActions.setTeleporting({ isTeleporting: true }))
    return
  }
}
