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

import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { AvatarControllerComponent } from '../../../avatar/components/AvatarControllerComponent'
import { teleportAvatar } from '../../../avatar/functions/moveAvatar'
import { switchCameraMode } from '../../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../../camera/types/CameraMode'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNetworkState } from '../../../networking/state/EntityNetworkState'
import { PortalComponent, PortalState } from '../../components/PortalComponent'
import { UUIDComponent } from '../../components/UUIDComponent'

export const setAvatarToLocationTeleportingState = () => {
  switchCameraMode(Engine.instance.cameraEntity, { cameraMode: CameraMode.ShoulderCam })
  getComponent(Engine.instance.localClientEntity, AvatarControllerComponent).movementEnabled = false
  /*dispatchAction(
    AvatarNetworkAction.setAnimationState({
      animationState: AvatarStates.FALL_IDLE,
      entityUUID: getComponent(Engine.instance.localClientEntity, UUIDComponent)
    })
  )
  */
}

export const revertAvatarToMovingStateFromTeleport = () => {
  const localClientEntity = Engine.instance.localClientEntity
  const activePortal = getComponent(getState(PortalState).activePortalEntity, PortalComponent)
  getState(EntityNetworkState)[getComponent(localClientEntity, UUIDComponent)].spawnPosition.copy(
    activePortal!.remoteSpawnPosition
  )
  getComponent(localClientEntity, AvatarControllerComponent).movementEnabled = true

  // teleport player to where the portal spawn position is
  teleportAvatar(localClientEntity, activePortal!.remoteSpawnPosition)

  getMutableState(PortalState).activePortalEntity.set(UndefinedEntity)
  dispatchAction(EngineActions.setTeleporting({ isTeleporting: false, $time: Date.now() + 500 }))
}

export const portalTriggerEnter = (triggerEntity: Entity) => {
  if (!getState(EngineState).isTeleporting && getComponent(triggerEntity, PortalComponent)) {
    const portalComponent = getComponent(triggerEntity, PortalComponent)
    getMutableState(PortalState).activePortalEntity.set(triggerEntity)
    dispatchAction(EngineActions.setTeleporting({ isTeleporting: true }))
    return
  }
}
