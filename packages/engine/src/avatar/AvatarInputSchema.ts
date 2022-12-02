import { useEffect } from 'react'
import { SkinnedMesh } from 'three'

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

const vrAxisLookSensitivity = 0.025

const moveLeftController: InputBehaviorType = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  const avatarController = getComponent(entity, AvatarControllerComponent)
  const cameraEntity = avatarController.cameraEntity
  const followCamera = getOptionalComponent(cameraEntity, FollowCameraComponent)

  const cameraSettings = getState(CameraSettings)

  if (followCamera) {
    const target = getOptionalComponent(cameraEntity, TargetCameraRotationComponent) || followCamera
    if (target)
      setTargetCameraRotation(
        cameraEntity,
        target.phi - inputValue.value[1] * cameraSettings.cameraRotationSpeed.value,
        target.theta - inputValue.value[0] * cameraSettings.cameraRotationSpeed.value,
        0.1
      )
    return
  }

  // if vr, rotate the avatar
  if (getControlMode() === 'attached') {
    if (getState(AvatarInputSettingsState).controlScheme.value === 'AvatarMovementScheme_Teleport') {
      moveAvatarWithTeleport(entity, inputValue.value[1], inputKey === BaseInput.PRIMARY_MOVE_LEFT ? 'left' : 'right')

      if (
        inputValue.lifecycleState === LifecycleValue.Started &&
        Math.abs(inputValue.value[0]) > 0.01 &&
        Math.abs(inputValue.value[1]) < 0.1
      )
        rotateAvatar(entity, (Math.PI / 6) * (inputValue.value[0] > 0 ? -1 : 1)) // 30 degrees
    } else if (inputValue.value[0] !== 0) {
      rotateAvatar(entity, -inputValue.value[0] * vrAxisLookSensitivity)
    }
  }
}

const moveRightController: InputBehaviorType = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  if (inputValue.type === InputType.TWODIM) {
    controller.localMovementDirection.x = inputValue.value[0]
    controller.localMovementDirection.z = inputValue.value[1]
  } else if (inputValue.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    controller.localMovementDirection.z = inputValue.value[2]
    controller.localMovementDirection.x = inputValue.value[0]
  }

  // if vr, rotate the avatar
  if (getControlMode() === 'attached') {
    if (getState(AvatarInputSettingsState).controlScheme.value === 'AvatarMovementScheme_Teleport') {
      moveAvatarWithTeleport(entity, inputValue.value[1], inputKey === BaseInput.PRIMARY_MOVE_LEFT ? 'left' : 'right')

      if (
        inputValue.lifecycleState === LifecycleValue.Started &&
        Math.abs(inputValue.value[0]) > 0.01 &&
        Math.abs(inputValue.value[1]) < 0.1
      )
        rotateAvatar(entity, (Math.PI / 6) * (inputValue.value[0] > 0 ? -1 : 1)) // 30 degrees
    }
  }
}

export const handlePrimaryButton: InputBehaviorType = (entity, inputKey, inputValue): void => {
  if (inputValue.lifecycleState === LifecycleValue.Started)
    dispatchAction(EngineActions.buttonClicked({ clicked: true, button: BaseInput.PRIMARY }))
  if (inputValue.lifecycleState === LifecycleValue.Ended)
    dispatchAction(EngineActions.buttonClicked({ clicked: false, button: BaseInput.PRIMARY }))
}

export const handleSecondaryButton: InputBehaviorType = (entity, inputKey, inputValue) => {
  if (inputValue.lifecycleState === LifecycleValue.Started)
    dispatchAction(EngineActions.buttonClicked({ clicked: true, button: BaseInput.SECONDARY }))
  if (inputValue.lifecycleState === LifecycleValue.Ended)
    dispatchAction(EngineActions.buttonClicked({ clicked: false, button: BaseInput.SECONDARY }))
}

export const handlePhysicsDebugEvent = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  if (inputValue.lifecycleState !== LifecycleValue.Ended) return
  if (inputKey === PhysicsDebugInput.GENERATE_DYNAMIC_DEBUG_CUBE) {
    dispatchAction(
      WorldNetworkAction.spawnDebugPhysicsObject({
        config: boxDynamicConfig // Any custom config can be provided here
      })
    )
  } else if (inputKey === PhysicsDebugInput.TOGGLE_PHYSICS_DEBUG) {
    dispatchAction(
      EngineRendererAction.setDebug({
        debugEnable: !accessEngineRendererState().debugEnable.value
      })
    )
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

  map.set(CameraInput.Neutral, CameraInput.Neutral)
  map.set(CameraInput.Angry, CameraInput.Angry)
  map.set(CameraInput.Disgusted, CameraInput.Disgusted)
  map.set(CameraInput.Fearful, CameraInput.Fearful)
  map.set(CameraInput.Happy, CameraInput.Happy)
  map.set(CameraInput.Surprised, CameraInput.Surprised)
  map.set(CameraInput.Sad, CameraInput.Sad)
  map.set(CameraInput.Pucker, CameraInput.Pucker)
  map.set(CameraInput.Widen, CameraInput.Widen)
  map.set(CameraInput.Open, CameraInput.Open)

  return map
}

export const createBehaviorMap = () => {
  const map = new Map<InputAlias, InputBehaviorType>()

  map.set(CameraInput.Happy, setAvatarExpression)
  map.set(CameraInput.Sad, setAvatarExpression)

  map.set(BaseInput.PRIMARY_MOVE_LEFT, moveLeftController)
  map.set(BaseInput.PRIMARY_MOVE_RIGHT, moveRightController)

  map.set(BaseInput.PRIMARY, handlePrimaryButton)
  map.set(BaseInput.SECONDARY, handleSecondaryButton)

  map.set(PhysicsDebugInput.GENERATE_DYNAMIC_DEBUG_CUBE, handlePhysicsDebugEvent)
  map.set(PhysicsDebugInput.TOGGLE_PHYSICS_DEBUG, handlePhysicsDebugEvent)

  return map
}

export const AvatarInputSchema: InputSchema = {
  inputMap: createAvatarInput(),
  behaviorMap: createBehaviorMap()
}

export default async function AvatarInputSystem(world: World) {
  const keyState = getState(ButtonInputState)

  const inputQuery = defineQuery([LocalInputTagComponent, AvatarControllerComponent])

  const interactState = getState(InteractState)

  const reactor = startReactor(() => {
    const keys = useHookstate(keyState)

    useEffect(() => {
      if (keys.ShiftLeft?.value)
        for (const entity of inputQuery()) {
          const controller = getComponent(entity, AvatarControllerComponent)
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

    return null
  })

  const execute = () => {
    const keys = keyState.value

    for (const entity of inputQuery()) {
      const controller = getComponent(entity, AvatarControllerComponent)
      controller.localMovementDirection.x = (keys.KeyA ? -1 : 0) + (keys.KeyD ? 1 : 0)
      controller.localMovementDirection.y = keys.Space ? 1 : 0
      controller.localMovementDirection.z = (keys.KeyW ? -1 : 0) + (keys.KeyS ? 1 : 0)
      controller.localMovementDirection.normalize()
    }
  }

  const cleanup = () => {
    reactor.stop()
    removeQuery(world, inputQuery)
  }

  return { execute, cleanup }
}
