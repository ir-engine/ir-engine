import { useEffect } from 'react'
import { Vector3 } from 'three'

import { isDev } from '@xrengine/common/src/config'
import { dispatchAction, getState, startReactor, useHookstate } from '@xrengine/hyperflux'

import { EngineActions } from '../ecs/classes/EngineState'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { ButtonInputState } from '../input/InputState'
import { InteractState } from '../interaction/systems/InteractiveSystem'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { boxDynamicConfig } from '../physics/functions/physicsObjectDebugFunctions'
import { accessEngineRendererState, EngineRendererAction } from '../renderer/EngineRendererState'
import { getControlMode } from '../xr/XRState'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { moveAvatarWithTeleport, rotateAvatar } from './functions/moveAvatar'
import { AvatarInputSettingsState } from './state/AvatarInputSettingsState'

export default async function AvatarInputSystem(world: World) {
  const keyState = getState(ButtonInputState)
  const interactState = getState(InteractState)
  const avatarInputSettingsState = getState(AvatarInputSettingsState)

  const reactor = startReactor(() => {
    const keys = useHookstate(keyState)

    useEffect(() => {
      if (keys.value.ShiftLeft && world.localClientEntity) {
        const controller = getComponent(world.localClientEntity, AvatarControllerComponent)
        controller.isWalking = !controller.isWalking
      }
    }, [keys.ShiftLeft])

    useEffect(() => {
      if (keys.value.KeyE && world.localClientEntity) {
        dispatchAction(
          EngineActions.interactedWithObject({
            targetEntity: interactState.available[0].value,
            handedness: 'none'
          })
        )
      }
    }, [keys.KeyE])

    useEffect(() => {
      if (keys.value.LeftTrigger && world.localClientEntity) {
        dispatchAction(
          EngineActions.interactedWithObject({
            targetEntity: interactState.available[0].value,
            handedness: 'left'
          })
        )
      }
    }, [keys.LeftTrigger])

    useEffect(() => {
      if (keys.value.RightTrigger && world.localClientEntity) {
        dispatchAction(
          EngineActions.interactedWithObject({
            targetEntity: interactState.available[0].value,
            handedness: 'right'
          })
        )
      }
    }, [keys.RightTrigger])

    if (isDev) {
      useEffect(() => {
        if (keys.value.KeyO && world.localClientEntity) {
          dispatchAction(
            WorldNetworkAction.spawnDebugPhysicsObject({
              config: boxDynamicConfig
            })
          )
        }
      }, [keys.KeyO])

      useEffect(() => {
        if (keys.value.KeyP && world.localClientEntity) {
          dispatchAction(
            EngineRendererAction.setDebug({
              debugEnable: !accessEngineRendererState().debugEnable.value
            })
          )
        }
      }, [keys.KeyP])
    }

    return null
  })

  const movementDelta = new Vector3()
  const lastMovementDelta = new Vector3()
  let isVRRotatingLeft = false
  let isVRRotatingRight = false

  const execute = () => {
    const { inputSources, localClientEntity } = world
    if (!localClientEntity) return

    const keys = keyState.value

    /** keyboard input */
    const keyDeltaX = (keys.KeyA ? -1 : 0) + (keys.KeyD ? 1 : 0) + (keys.ArrowUp ? -1 : 0) + (keys.ArrowDown ? 1 : 0)
    const keyDeltaY = keys.Space ? 1 : 0
    const keyDeltaZ = (keys.KeyW ? -1 : 0) + (keys.KeyS ? 1 : 0)

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
        if (axes.length === 2) {
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
          if (preferredHand === inputSource.handedness) rotateAvatar(localClientEntity, -xDelta * world.deltaSeconds)
          else movementDelta.z += yDelta
        }
      }
    }

    if (!teleporting) {
      const controller = getComponent(localClientEntity, AvatarControllerComponent)
      controller.localMovementDirection.copy(movementDelta).normalize()
    }

    lastMovementDelta.copy(movementDelta)
  }

  const cleanup = () => {
    reactor.stop()
  }

  return { execute, cleanup }
}
