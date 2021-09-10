import { Mesh, Quaternion, Vector2, Vector3 } from 'three'
import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { CameraMode } from '../camera/types/CameraMode'
import { LifecycleValue } from '../common/enums/LifecycleValue'
import { ParityValue } from '../common/enums/ParityValue'
import { isClient } from '../common/functions/isClient'
import { Entity } from '../ecs/classes/Entity'
import { addComponent, getComponent } from '../ecs/functions/ComponentFunctions'
import { InputComponent } from '../input/components/InputComponent'
import { BaseInput } from '../input/enums/BaseInput'
import {
  CameraInput,
  GamepadAxis,
  GamepadButtons,
  MouseInput,
  TouchInputs,
  XR6DOF,
  XRAxes
} from '../input/enums/InputEnums'
import { InputType } from '../input/enums/InputType'
import { InputBehaviorType, InputSchema } from '../input/interfaces/InputSchema'
import { InputValue } from '../input/interfaces/InputValue'
import { InputAlias } from '../input/types/InputAlias'
import { InteractedComponent } from '../interaction/components/InteractedComponent'
import { InteractorComponent } from '../interaction/components/InteractorComponent'
import { AutoPilotClickRequestComponent } from '../navigation/component/AutoPilotClickRequestComponent'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRUserSettings, XR_ROTATION_MODE } from '../xr/types/XRUserSettings'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
import { switchCameraMode } from './functions/switchCameraMode'

const getParityFromInputValue = (key: InputAlias): ParityValue => {
  switch (key) {
    case BaseInput.GRAB_LEFT:
      return ParityValue.LEFT
    case BaseInput.GRAB_RIGHT:
      return ParityValue.RIGHT
    default:
      return ParityValue.NONE
  }
}

/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */

const interact = (entity: Entity, inputKey: InputAlias, inputValue: InputValue, delta: number): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
  const parityValue = getParityFromInputValue(inputKey)

  const interactor = getComponent(entity, InteractorComponent)
  if (!interactor?.focusedInteractive) return

  addComponent(interactor.focusedInteractive, InteractedComponent, { interactor: entity, parity: parityValue })
}

/**
 * Switch Camera mode from first person to third person and wise versa.
 * @param entity Entity holding {@link camera/components/FollowCameraComponent.FollowCameraComponent | Follow camera} component.
 */
const cycleCameraMode = (entity: Entity, inputKey: InputAlias, inputValue: InputValue, delta: number): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
  const cameraFollow = getComponent(entity, FollowCameraComponent)

  switch (cameraFollow?.mode) {
    case CameraMode.FirstPerson:
      switchCameraMode(entity, { cameraMode: CameraMode.ShoulderCam })
      break
    case CameraMode.ShoulderCam:
      switchCameraMode(entity, { cameraMode: CameraMode.ThirdPerson })
      cameraFollow.distance = cameraFollow.minDistance + 1
      break
    case CameraMode.ThirdPerson:
      switchCameraMode(entity, { cameraMode: CameraMode.TopDown })
      break
    case CameraMode.TopDown:
      switchCameraMode(entity, { cameraMode: CameraMode.FirstPerson })
      break
    default:
      break
  }
}
/**
 * Fix camera behind the avatar to follow the avatar.
 * @param entity Entity on which camera will be fixed.
 */
const fixedCameraBehindAvatar: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
  const follower = getComponent(entity, FollowCameraComponent)
  if (follower && follower.mode !== CameraMode.FirstPerson) {
    follower.locked = !follower.locked
  }
}

const switchShoulderSide: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
  const cameraFollow = getComponent(entity, FollowCameraComponent)
  if (cameraFollow) {
    cameraFollow.shoulderSide = !cameraFollow.shoulderSide
  }
}

let lastScrollDelta = 0
let lastScrollValue = 0
/**
 * Change camera distance.
 * @param entity Entity holding camera and input component.
 */
const changeCameraDistanceByDelta: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  const cameraFollow = getComponent(entity, FollowCameraComponent)
  if (cameraFollow === undefined || cameraFollow.mode === CameraMode.Strategic) return //console.warn("cameraFollow is undefined")

  const value = inputValue.value[0]

  const scrollDelta = Math.min(1, Math.max(-1, value - lastScrollValue))
  lastScrollValue = value
  if (cameraFollow.mode !== CameraMode.ThirdPerson && scrollDelta === lastScrollDelta) {
    return
  }
  lastScrollDelta = scrollDelta

  switch (cameraFollow.mode) {
    case CameraMode.FirstPerson:
      if (scrollDelta > 0) {
        switchCameraMode(entity, { cameraMode: CameraMode.ShoulderCam })
      }
      break
    case CameraMode.ShoulderCam:
      if (scrollDelta > 0) {
        switchCameraMode(entity, { cameraMode: CameraMode.ThirdPerson })
        cameraFollow.distance = cameraFollow.minDistance + 1
      }
      if (scrollDelta < 0) {
        switchCameraMode(entity, { cameraMode: CameraMode.FirstPerson })
      }
      break
    default:
    case CameraMode.ThirdPerson:
      const newDistance = cameraFollow.distance + scrollDelta
      cameraFollow.distance = Math.max(cameraFollow.minDistance, Math.min(cameraFollow.maxDistance, newDistance))

      if (cameraFollow.distance >= cameraFollow.maxDistance) {
        if (scrollDelta > 0) {
          switchCameraMode(entity, { cameraMode: CameraMode.TopDown })
        }
      } else if (cameraFollow.distance <= cameraFollow.minDistance) {
        if (scrollDelta < 0) {
          switchCameraMode(entity, { cameraMode: CameraMode.ShoulderCam })
        }
      }

      break
    case CameraMode.TopDown:
      if (scrollDelta < 0) {
        switchCameraMode(entity, { cameraMode: CameraMode.ThirdPerson })
      }
      break
  }
}

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

const setAvatarExpression: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  const object = getComponent(entity, Object3DComponent)
  const body = object.value?.getObjectByName('Body') as Mesh

  if (!body?.isMesh || !body?.morphTargetDictionary) {
    return
  }

  const morphValue = inputValue.value
  const morphName = morphNameByInput[inputKey]
  const morphIndex = body.morphTargetDictionary[morphName]
  if (typeof morphIndex !== 'number') {
    return
  }

  // console.warn(args.input + ": " + morphName + ":" + morphIndex + " = " + morphValue)
  if (morphName && morphValue !== null) {
    if (typeof morphValue === 'number') {
      body.morphTargetInfluences[morphIndex] = morphValue // 0.0 - 1.0
    }
  }
}

/** 90 degree */
const PI_BY_2 = Math.PI / 2

/** For Thumbstick angle less than 270 degree substract 90 from it.from
 * Otherwise substract 450 degree. This is to make angle range from -180 to 180 degree.
 */
const changedDirection = (radian: number) => {
  return radian < 3 * PI_BY_2 ? (radian = radian - PI_BY_2) : radian - 5 * PI_BY_2
}

const moveByInputAxis: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)

  if (inputValue.type === InputType.TWODIM) {
    controller.localMovementDirection.z = inputValue.value[0]
    controller.localMovementDirection.x = inputValue.value[1]
  } else if (inputValue.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    controller.localMovementDirection.z = inputValue.value[2]
    controller.localMovementDirection.x = inputValue.value[0]
  }
}
const setWalking: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  controller.isWalking = inputValue.lifecycleState !== LifecycleValue.ENDED
}

const setLocalMovementDirection: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  const hasEnded = inputValue.lifecycleState === LifecycleValue.ENDED
  switch (inputKey) {
    case BaseInput.JUMP:
      controller.localMovementDirection.y = hasEnded ? 0 : 1
      break
    case BaseInput.FORWARD:
      controller.localMovementDirection.z = hasEnded ? 0 : 1
      break
    case BaseInput.BACKWARD:
      controller.localMovementDirection.z = hasEnded ? 0 : -1
      break
    case BaseInput.LEFT:
      controller.localMovementDirection.x = hasEnded ? 0 : 1
      break
    case BaseInput.RIGHT:
      controller.localMovementDirection.x = hasEnded ? 0 : -1
      break
  }
  controller.localMovementDirection.normalize()
}

const moveFromXRInputs: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  const values = inputValue.value
  controller.localMovementDirection.x = values[0] ?? controller.localMovementDirection.x
  controller.localMovementDirection.z = values[1] ?? controller.localMovementDirection.z
  controller.localMovementDirection.normalize()
}

let switchChangedToZero = true
const deg2rad = Math.PI / 180
const quat = new Quaternion()
const upVec = new Vector3(0, 1, 0)

const lookFromXRInputs: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  const values = inputValue.value
  const rotationAngle = XRUserSettings.rotationAngle
  let newAngleDiff = 0
  switch (XRUserSettings.rotation) {
    case XR_ROTATION_MODE.ANGLED:
      if (switchChangedToZero && values[0] != 0) {
        const plus = XRUserSettings.rotationInvertAxes ? -1 : 1
        const minus = XRUserSettings.rotationInvertAxes ? 1 : -1
        const directedAngle = values[0] > 0 ? rotationAngle * plus : rotationAngle * minus
        newAngleDiff = directedAngle
        switchChangedToZero = false
      } else if (!switchChangedToZero && values[0] == 0) {
        switchChangedToZero = true
      } else if (!switchChangedToZero) {
        newAngleDiff = 0
      } else if (switchChangedToZero && values[0] == 0) {
        newAngleDiff = 0
      }
      break
    case XR_ROTATION_MODE.SMOOTH:
      newAngleDiff = values[0] * XRUserSettings.rotationSmoothSpeed * (XRUserSettings.rotationInvertAxes ? -1 : 1)
      break
  }
  const transform = getComponent(entity, TransformComponent)
  quat.setFromAxisAngle(upVec, newAngleDiff * deg2rad)
  transform.rotation.multiply(quat)
}

const lookByInputAxis: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue,
  delta: number
): void => {
  const followCamera = getComponent(entity, FollowCameraComponent)
  if (followCamera && followCamera.mode !== CameraMode.Strategic) {
    followCamera.theta -= inputValue.value[0] * 100
    followCamera.phi -= inputValue.value[1] * 100
  }
}

const gamepadLook: InputBehaviorType = (entity: Entity): void => {
  const input = getComponent(entity, InputComponent)
  const data = input.data.get(BaseInput.GAMEPAD_STICK_RIGHT)
  // TODO: fix this
  console.log('gamepadLook', data)
  if (data.type === InputType.TWODIM) {
    input.data.set(BaseInput.LOOKTURN_PLAYERONE, {
      type: data.type,
      value: [data.value[0], data.value[1]],
      lifecycleState: LifecycleValue.CHANGED
    })
  } else if (data.type === InputType.THREEDIM) {
    input.data.set(BaseInput.LOOKTURN_PLAYERONE, {
      type: data.type,
      value: [data.value[0], data.value[2]],
      lifecycleState: LifecycleValue.CHANGED
    })
  }
}

export const clickNavMesh: InputBehaviorType = (entity, inputKey, inputValue): void => {
  if (inputValue.lifecycleState !== LifecycleValue.ENDED) {
    return
  }
  const input = getComponent(entity, InputComponent)
  const coords = input.data.get(BaseInput.SCREENXY)?.value
  if (coords) {
    // addComponent(entity, AutoPilotClickRequestComponent, { coords: new Vector2(coords[0], coords[1]) })
  }
}

export const createAvatarInput = () => {
  const map: Map<InputAlias, InputAlias> = new Map()

  map.set(MouseInput.LeftButton, BaseInput.PRIMARY)
  map.set(MouseInput.RightButton, BaseInput.SECONDARY)
  map.set(MouseInput.MiddleButton, BaseInput.INTERACT)

  map.set(MouseInput.MouseMovement, BaseInput.MOUSE_MOVEMENT)
  map.set(MouseInput.MousePosition, BaseInput.SCREENXY)
  map.set(MouseInput.MouseClickDownPosition, BaseInput.SCREENXY_START)
  map.set(MouseInput.MouseClickDownTransformRotation, BaseInput.ROTATION_START)
  map.set(MouseInput.MouseClickDownMovement, BaseInput.LOOKTURN_PLAYERONE)
  map.set(MouseInput.MouseScroll, BaseInput.CAMERA_SCROLL)

  map.set(TouchInputs.Touch, BaseInput.INTERACT)
  // map.set(TouchInputs.DoubleTouch, BaseInput.JUMP)
  map.set(TouchInputs.Touch1Position, BaseInput.SCREENXY)
  map.set(TouchInputs.Touch1Movement, BaseInput.LOOKTURN_PLAYERONE)
  map.set(TouchInputs.Scale, BaseInput.CAMERA_SCROLL)

  map.set(GamepadButtons.A, BaseInput.INTERACT)
  map.set(GamepadButtons.B, BaseInput.JUMP)
  map.set(GamepadButtons.LTrigger, BaseInput.GRAB_LEFT)
  map.set(GamepadButtons.RTrigger, BaseInput.GRAB_RIGHT)
  map.set(GamepadButtons.DPad1, BaseInput.FORWARD)
  map.set(GamepadButtons.DPad2, BaseInput.BACKWARD)
  map.set(GamepadButtons.DPad3, BaseInput.LEFT)
  map.set(GamepadButtons.DPad4, BaseInput.RIGHT)

  map.set(GamepadAxis.Left, BaseInput.MOVEMENT_PLAYERONE)
  map.set(GamepadAxis.Right, BaseInput.GAMEPAD_STICK_RIGHT)

  if (XRUserSettings.invertRotationAndMoveSticks) {
    map.set(XRAxes.Left, BaseInput.XR_AXIS_LOOK)
    map.set(XRAxes.Right, BaseInput.XR_AXIS_MOVE)
  } else {
    map.set(XRAxes.Left, BaseInput.XR_AXIS_MOVE)
    map.set(XRAxes.Right, BaseInput.XR_AXIS_LOOK)
  }

  map.set(XR6DOF.HMD, BaseInput.XR_HEAD)
  map.set(XR6DOF.LeftHand, BaseInput.XR_CONTROLLER_LEFT_HAND)
  map.set(XR6DOF.RightHand, BaseInput.XR_CONTROLLER_RIGHT_HAND)

  map.set('KeyW', BaseInput.FORWARD)
  map.set('KeyA', BaseInput.LEFT)
  map.set('KeyS', BaseInput.BACKWARD)
  map.set('KeyD', BaseInput.RIGHT)
  map.set('KeyE', BaseInput.INTERACT)
  map.set('Space', BaseInput.JUMP)
  map.set('ShiftLeft', BaseInput.WALK)
  map.set('KeyP', BaseInput.POINTER_LOCK)
  map.set('KepV', BaseInput.SWITCH_CAMERA)
  map.set('KeyC', BaseInput.SWITCH_SHOULDER_SIDE)
  map.set('KeyF', BaseInput.LOCKING_CAMERA)

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

  map.set(BaseInput.INTERACT, interact)
  map.set(BaseInput.GRAB_LEFT, interact)
  map.set(BaseInput.GRAB_RIGHT, interact)

  map.set(BaseInput.JUMP, setLocalMovementDirection)
  map.set(BaseInput.WALK, setWalking)
  map.set(BaseInput.FORWARD, setLocalMovementDirection)
  map.set(BaseInput.BACKWARD, setLocalMovementDirection)
  map.set(BaseInput.LEFT, setLocalMovementDirection)
  map.set(BaseInput.RIGHT, setLocalMovementDirection)

  map.set(CameraInput.Happy, setAvatarExpression)
  map.set(CameraInput.Sad, setAvatarExpression)

  map.set(BaseInput.LOOKTURN_PLAYERONE, lookByInputAxis)
  map.set(BaseInput.MOVEMENT_PLAYERONE, moveByInputAxis)
  map.set(BaseInput.GAMEPAD_STICK_LEFT, gamepadLook)
  map.set(BaseInput.GAMEPAD_STICK_RIGHT, gamepadLook)
  map.set(BaseInput.XR_AXIS_LOOK, lookFromXRInputs)
  map.set(BaseInput.XR_AXIS_MOVE, moveFromXRInputs)

  map.set(BaseInput.SWITCH_CAMERA, cycleCameraMode)
  map.set(BaseInput.LOCKING_CAMERA, fixedCameraBehindAvatar)
  map.set(BaseInput.SWITCH_SHOULDER_SIDE, switchShoulderSide)
  map.set(BaseInput.CAMERA_SCROLL, changeCameraDistanceByDelta)

  map.set(BaseInput.PRIMARY, clickNavMesh)

  return map
}

export const AvatarInputSchema: InputSchema = {
  inputMap: createAvatarInput(),
  behaviorMap: createBehaviorMap()
}
