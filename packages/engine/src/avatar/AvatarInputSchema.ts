import { useEffect } from 'react'
import { SkinnedMesh, Vector2, Vector3 } from 'three'

import { isDev } from '@xrengine/common/src/config'
import { dispatchAction, getState, startReactor, useHookstate } from '@xrengine/hyperflux'

import { CameraSettings } from '../camera/CameraState'
import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../camera/components/TargetCameraRotationComponent'
import { setTargetCameraRotation } from '../camera/systems/CameraInputSystem'
import { LifecycleValue } from '../common/enums/LifecycleValue'
import { ParityValue } from '../common/enums/ParityValue'
import { EngineActions } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, getOptionalComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { PhysicsDebugInput } from '../input/enums/DebugEnum'
import { CameraInput, GamepadAxis, GamepadButtons, MouseInput, TouchInputs } from '../input/enums/InputEnums'
import { InputType } from '../input/enums/InputType'
import { ButtonInputState } from '../input/InputState'
import { InputBehaviorType, InputSchema } from '../input/interfaces/InputSchema'
import { InputValue } from '../input/interfaces/InputValue'
import { InputAlias } from '../input/types/InputAlias'
import { InteractState } from '../interaction/systems/InteractiveSystem'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { boxDynamicConfig } from '../physics/functions/physicsObjectDebugFunctions'
import { accessEngineRendererState, EngineRendererAction } from '../renderer/EngineRendererState'
import { GroupComponent } from '../scene/components/GroupComponent'
import { getControlMode } from '../xr/XRState'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { moveAvatarWithTeleport, rotateAvatar } from './functions/moveAvatar'
import { AvatarInputSettingsState } from './state/AvatarInputSettingsState'

const morphNameByInput = {
  [CameraInput.Neutral]: 'None',
  [CameraInput.Angry]: 'Frown',
  [CameraInput.Disgusted]: 'Frown',
  [CameraInput.Fearful]: 'Frown',
  [CameraInput.Happy]: 'Smile',
  [CameraInput.Surprised]: 'Frown',
  [CameraInput.Sad]: 'Frown',
  [CameraInput.Pucker]: 'None',
  [CameraInput.Widen]: 'Frown',
  [CameraInput.Open]: 'Happy'
}

const setAvatarExpression: InputBehaviorType = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  const group = getComponent(entity, GroupComponent)
  let body
  for (const obj of group)
    obj.traverse((obj: SkinnedMesh) => {
      if (!body && obj.morphTargetDictionary) body = obj
    })

  if (!body?.isMesh || !body?.morphTargetDictionary) {
    console.warn('[Avatar Emotions]: This avatar does not support expressive visemes.')
    return
  }

  const morphValue = inputValue.value
  const morphName = morphNameByInput[inputKey]
  const morphIndex = body.morphTargetDictionary[morphName]
  if (typeof morphIndex !== 'number') {
    console.warn('[Avatar Emotions]: This avatar does not support the', morphName, ' expression.')
    return
  }

  // console.warn(inputKey + ": " + morphName + ":" + morphIndex + " = " + morphValue)
  if (morphName && morphValue !== null) {
    if (typeof morphValue === 'number') {
      body.morphTargetInfluences![morphIndex] = morphValue // 0.0 - 1.0
    }
  }
}

export const createAvatarInput = () => {
  const map: Map<InputAlias | Array<InputAlias>, InputAlias> = new Map()
  map.set(MouseInput.LeftButton, BaseInput.PRIMARY)
  map.set(MouseInput.RightButton, BaseInput.SECONDARY)
  map.set(MouseInput.MiddleButton, BaseInput.INTERACT)

  map.set(MouseInput.MousePosition, BaseInput.SCREENXY)
  map.set(MouseInput.MouseClickDownMovement, BaseInput.PRIMARY_MOVE_LEFT)
  map.set(MouseInput.MouseScroll, BaseInput.CAMERA_SCROLL)

  map.set(TouchInputs.Touch, BaseInput.PRIMARY)
  // map.set(TouchInputs.DoubleTouch, BaseInput.JUMP)
  map.set(TouchInputs.Touch1Position, BaseInput.SCREENXY)
  map.set(TouchInputs.Touch1Movement, BaseInput.PRIMARY_MOVE_LEFT)
  map.set(TouchInputs.Scale, BaseInput.CAMERA_SCROLL)

  map.set(GamepadButtons.A, BaseInput.INTERACT)
  map.set(GamepadButtons.B, BaseInput.JUMP)
  map.set(GamepadButtons.X, BaseInput.TOGGLE_MENU_BUTTONS)
  // map.set(GamepadButtons.Y, BaseInput.INTERACT)
  map.set(GamepadButtons.LTrigger, BaseInput.GRAB_LEFT)
  map.set(GamepadButtons.RTrigger, BaseInput.GRAB_RIGHT)
  map.set(GamepadButtons.LBumper, BaseInput.GRIP_LEFT)
  map.set(GamepadButtons.RBumper, BaseInput.GRIP_RIGHT)
  map.set(GamepadButtons.DPad1, BaseInput.FORWARD)
  map.set(GamepadButtons.DPad2, BaseInput.BACKWARD)
  map.set(GamepadButtons.DPad3, BaseInput.LEFT)
  map.set(GamepadButtons.DPad4, BaseInput.RIGHT)

  map.set(GamepadAxis.LThumbstick, BaseInput.PRIMARY_MOVE_LEFT)
  map.set(GamepadAxis.RThumbstick, BaseInput.PRIMARY_MOVE_RIGHT)

  // map.set(GamepadAxis.LTouchpad, BaseInput.PRIMARY_LOOK)
  // map.set(GamepadAxis.RTouchpad, BaseInput.PRIMARY_MOVE)

  map.set('KeyW', BaseInput.FORWARD)
  map.set('ArrowUp', BaseInput.FORWARD)
  map.set('KeyA', BaseInput.LEFT)
  map.set('KeyS', BaseInput.BACKWARD)
  map.set('ArrowDown', BaseInput.BACKWARD)
  map.set('KeyD', BaseInput.RIGHT)
  map.set('KeyE', BaseInput.INTERACT)
  map.set('Space', BaseInput.JUMP)
  map.set('ShiftLeft', BaseInput.RUN)
  map.set('KepV', BaseInput.SWITCH_CAMERA)
  map.set('KeyC', BaseInput.SWITCH_SHOULDER_SIDE)
  map.set('KeyF', BaseInput.LOCKING_CAMERA)

  if (isDev) {
    map.set('KeyQ', PhysicsDebugInput.GENERATE_DYNAMIC_DEBUG_CUBE)
    map.set('KeyP', PhysicsDebugInput.TOGGLE_PHYSICS_DEBUG)
  }

  map.set('ArrowLeft', BaseInput.CAMERA_ROTATE_LEFT)
  map.set('ArrowRight', BaseInput.CAMERA_ROTATE_RIGHT)

  return map
}

export const createBehaviorMap = () => {
  const map = new Map<InputAlias, InputBehaviorType>()

  map.set(CameraInput.Happy, setAvatarExpression)
  map.set(CameraInput.Sad, setAvatarExpression)

  return map
}

export const AvatarInputSchema: InputSchema = {
  inputMap: createAvatarInput(),
  behaviorMap: createBehaviorMap()
}

export default async function AvatarInputSystem(world: World) {
  const keyState = getState(ButtonInputState)
  const interactState = getState(InteractState)
  const avatarInputSettingsState = getState(AvatarInputSettingsState)

  const reactor = startReactor(() => {
    const keys = useHookstate(keyState)

    useEffect(() => {
      if (keys.ShiftLeft?.value) {
        const controller = getComponent(world.localClientEntity, AvatarControllerComponent)
        controller.isWalking = !controller.isWalking
      }
    }, [keys.ShiftLeft])

    useEffect(() => {
      if (keys.KeyE?.value) {
        dispatchAction(
          EngineActions.interactedWithObject({
            targetEntity: interactState.available[0].value,
            parityValue: ParityValue.NONE
          })
        )
      }
    }, [keys.KeyE])

    useEffect(() => {
      if (keys.LeftTrigger?.value) {
        dispatchAction(
          EngineActions.interactedWithObject({
            targetEntity: interactState.available[0].value,
            parityValue: ParityValue.LEFT
          })
        )
      }
    }, [keys.LeftTrigger])

    useEffect(() => {
      if (keys.RightTrigger?.value) {
        dispatchAction(
          EngineActions.interactedWithObject({
            targetEntity: interactState.available[0].value,
            parityValue: ParityValue.RIGHT
          })
        )
      }
    }, [keys.RightTrigger])

    if (isDev) {
      useEffect(() => {
        if (keys.KeyO?.value) {
          dispatchAction(
            WorldNetworkAction.spawnDebugPhysicsObject({
              config: boxDynamicConfig
            })
          )
        }
      }, [keys.KeyO])

      useEffect(() => {
        if (keys.KeyP?.value) {
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
