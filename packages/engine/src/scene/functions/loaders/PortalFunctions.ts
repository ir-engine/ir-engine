import { dispatchAction, getState } from '@xrengine/hyperflux'

import { AvatarStates } from '../../../avatar/animation/Util'
import { AvatarControllerComponent } from '../../../avatar/components/AvatarControllerComponent'
import { switchCameraMode } from '../../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../../camera/types/CameraMode'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { World } from '../../../ecs/classes/World'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../../../networking/functions/WorldNetworkAction'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { PortalComponent } from '../../components/PortalComponent'

export const setAvatarToLocationTeleportingState = (world: World) => {
  switchCameraMode(Engine.instance.currentWorld.cameraEntity, { cameraMode: CameraMode.ShoulderCam })
  getComponent(world.localClientEntity, AvatarControllerComponent).movementEnabled = false
  dispatchAction(WorldNetworkAction.avatarAnimation({ newStateName: AvatarStates.FALL_IDLE, params: {} }))
}

export const revertAvatarToMovingStateFromTeleport = (world: World) => {
  const controller = getComponent(world.localClientEntity, AvatarControllerComponent)
  controller.movementEnabled = true

  // teleport player to where the portal spawn position is
  const transform = getComponent(world.localClientEntity, TransformComponent)
  transform.position.copy(world.activePortal!.remoteSpawnPosition)
  transform.rotation.copy(world.activePortal!.remoteSpawnRotation)

  world.activePortal = null
  dispatchAction(EngineActions.setTeleporting({ isTeleporting: false, $time: Date.now() + 500 }))
}

export const portalTriggerEnter = (triggerEntity: Entity) => {
  if (!getState(EngineState).isTeleporting.value && getComponent(triggerEntity, PortalComponent)) {
    const portalComponent = getComponent(triggerEntity, PortalComponent)
    Engine.instance.currentWorld.activePortal = portalComponent
    dispatchAction(EngineActions.setTeleporting({ isTeleporting: true }))
    return
  }
}
