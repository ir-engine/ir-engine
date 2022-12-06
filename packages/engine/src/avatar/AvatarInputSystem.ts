import { Vector3 } from 'three'

import { isDev } from '@xrengine/common/src/config'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { EngineActions } from '../ecs/classes/EngineState'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { InteractState } from '../interaction/systems/InteractiveSystem'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { boxDynamicConfig } from '../physics/functions/physicsObjectDebugFunctions'
import { accessEngineRendererState, EngineRendererAction } from '../renderer/EngineRendererState'
import { getControlMode } from '../xr/XRState'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { moveAvatarWithTeleport, rotateAvatar } from './functions/moveAvatar'
import { AvatarInputSettingsState } from './state/AvatarInputSettingsState'

export default async function AvatarInputSystem(world: World) {
  const interactState = getState(InteractState)
  const avatarInputSettingsState = getState(AvatarInputSettingsState)

  const onShiftLeft = () => {
    if (world.localClientEntity) {
      const controller = getComponent(world.localClientEntity, AvatarControllerComponent)
      controller.isWalking = !controller.isWalking
    }
  }

  const onKeyE = () => {
    dispatchAction(
      EngineActions.interactedWithObject({
        targetEntity: interactState.available[0].value,
        handedness: 'none'
      })
    )
  }

  const onLeftTrigger = () => {
    if (world.localClientEntity) {
      dispatchAction(
        EngineActions.interactedWithObject({
          targetEntity: interactState.available[0].value,
          handedness: 'left'
        })
      )
    }
  }

  const onRightTrigger = () => {
    if (world.localClientEntity) {
      dispatchAction(
        EngineActions.interactedWithObject({
          targetEntity: interactState.available[0].value,
          handedness: 'right'
        })
      )
    }
  }

  const onKeyO = () => {
    if (world.localClientEntity) {
      dispatchAction(
        WorldNetworkAction.spawnDebugPhysicsObject({
          config: boxDynamicConfig
        })
      )
    }
  }

  const onKeyP = () => {
    if (world.localClientEntity) {
      dispatchAction(
        EngineRendererAction.setDebug({
          debugEnable: !accessEngineRendererState().debugEnable.value
        })
      )
    }
  }

  const movementDelta = new Vector3()
  const lastMovementDelta = new Vector3()
  let isVRRotatingLeft = false
  let isVRRotatingRight = false

  const execute = () => {
    const { inputSources, localClientEntity } = world
    if (!localClientEntity) return

    const keys = world.buttons

    if (keys.ShiftLeft?.clicked) onShiftLeft()
    if (keys.KeyE?.clicked) onKeyE()
    if (keys.LeftTrigger?.clicked) onLeftTrigger()
    if (keys.RightTrigger?.clicked) onRightTrigger()

    if (isDev) {
      if (keys.KeyO?.clicked) onKeyO()
      if (keys.KeyP?.clicked) onKeyP()
    }

    /** keyboard input */
    const keyDeltaX =
      (keys.KeyA?.pressed ? -1 : 0) +
      (keys.KeyD?.pressed ? 1 : 0) +
      (keys.ArrowUp?.pressed ? -1 : 0) +
      (keys.ArrowDown?.pressed ? 1 : 0)
    const keyDeltaY = keys.Space?.pressed ? 1 : 0
    const keyDeltaZ = (keys.KeyW?.pressed ? -1 : 0) + (keys.KeyS?.pressed ? 1 : 0)

    movementDelta.set(keyDeltaX, keyDeltaY, keyDeltaZ)

    const cameraAttached = getControlMode() === 'attached'
    const teleporting =
      cameraAttached && avatarInputSettingsState.controlScheme.value === 'AvatarMovementScheme_Teleport'
    const preferredHand = avatarInputSettingsState.preferredHand.value

    /** override keyboard input with XR axes input */
    for (const inputSource of inputSources) {
      if (inputSource.gamepad?.mapping === 'xr-standard') {
        const axes = inputSource.gamepad!.axes

        let xDelta = 0
        let yDelta = 0
        /** @todo do we want to sum these inputs up? */
        if (axes.length <= 2) {
          xDelta += Math.abs(axes[0]) > 0.05 ? axes[0] : 0
          yDelta += Math.abs(axes[1]) > 0.05 ? axes[1] : 0
        }
        if (axes.length >= 4) {
          xDelta += Math.abs(axes[2]) > 0.05 ? axes[2] : 0
          yDelta += Math.abs(axes[3]) > 0.05 ? axes[3] : 0
        }

        if (teleporting) {
          moveAvatarWithTeleport(localClientEntity, yDelta, inputSource.handedness)

          const canRotate = Math.abs(xDelta) > 0.1 && Math.abs(yDelta) < 0.1

          if (canRotate) {
            if (
              (inputSource.handedness === 'left' && !isVRRotatingLeft) ||
              (inputSource.handedness === 'right' && !isVRRotatingRight)
            )
              rotateAvatar(localClientEntity, (Math.PI / 6) * (xDelta > 0 ? -1 : 1)) // 30 degrees
          }
          if (inputSource.handedness === 'left') isVRRotatingLeft = canRotate
          else isVRRotatingRight = canRotate

          movementDelta.x = xDelta
          movementDelta.z = yDelta
        } else {
          /** preferred hand rotates */
          if (preferredHand === inputSource.handedness || inputSource.handedness === 'none') {
            rotateAvatar(localClientEntity, -xDelta * world.deltaSeconds)

            /** mobile/detatched avatar right thumbstick movement */
            if (!cameraAttached) {
              movementDelta.x += xDelta
              movementDelta.z += yDelta
            }
          } else {
            /** if other hand */
            movementDelta.z += yDelta
          }
        }
      }
    }

    if (!teleporting) {
      const controller = getComponent(localClientEntity, AvatarControllerComponent)
      controller.localMovementDirection.copy(movementDelta).normalize()
    }

    lastMovementDelta.copy(movementDelta)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
