import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { Entity } from '../ecs/classes/Entity'
import { addComponent, getComponent } from '../ecs/functions/EntityFunctions'
import { InputComponent } from '../input/components/InputComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { Camera, Material, Mesh, Quaternion, Vector3, Vector2, PerspectiveCamera } from 'three'
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh'
import { CameraModes } from '../camera/types/CameraModes'
import { LifecycleValue } from '../common/enums/LifecycleValue'
import { GamepadAxis, XRAxes } from '../input/enums/InputEnums'
import { CameraInput, GamepadButtons, MouseInput, TouchInputs } from '../input/enums/InputEnums'
import { InputType } from '../input/enums/InputType'
import { InputBehaviorType, InputSchema } from '../input/interfaces/InputSchema'
import { InputAlias } from '../input/types/InputAlias'
import { InteractorComponent } from '../interaction/components/InteractorComponent'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRUserSettings, XR_ROTATION_MODE } from '../xr/types/XRUserSettings'
import { ParityValue } from '../common/enums/ParityValue'
import { InputValue } from '../input/interfaces/InputValue'
import { NumericalType } from '../common/types/NumericalTypes'
import { InteractedComponent } from '../interaction/components/InteractedComponent'
import { AutoPilotClickRequestComponent } from '../navigation/component/AutoPilotClickRequestComponent'
import { switchCameraMode } from './functions/switchCameraMode'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'

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

const interact = (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number): void => {
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
const cycleCameraMode = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
  const cameraFollow = getComponent(entity, FollowCameraComponent)

  switch (cameraFollow?.mode) {
    case CameraModes.FirstPerson:
      switchCameraMode(entity, { cameraMode: CameraModes.ShoulderCam })
      break
    case CameraModes.ShoulderCam:
      switchCameraMode(entity, { cameraMode: CameraModes.ThirdPerson })
      cameraFollow.distance = cameraFollow.minDistance + 1
      break
    case CameraModes.ThirdPerson:
      switchCameraMode(entity, { cameraMode: CameraModes.TopDown })
      break
    case CameraModes.TopDown:
      switchCameraMode(entity, { cameraMode: CameraModes.FirstPerson })
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
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
  const follower = getComponent(entity, FollowCameraComponent)
  if (follower && follower.mode !== CameraModes.FirstPerson) {
    follower.locked = !follower.locked
  }
}

const switchShoulderSide: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
  const cameraFollow = getComponent(entity, FollowCameraComponent)
  if (cameraFollow) {
    cameraFollow.shoulderSide = !cameraFollow.shoulderSide
  }
}

let lastScrollDelta = 0
/**
 * Change camera distance.
 * @param entity Entity holding camera and input component.
 */
const changeCameraDistanceByDelta: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const inputComponent = getComponent(entity, InputComponent)

  if (!inputComponent.data.has(inputKey)) {
    return
  }

  const cameraFollow = getComponent(entity, FollowCameraComponent)
  if (cameraFollow === undefined || cameraFollow.mode === CameraModes.Strategic) return //console.warn("cameraFollow is undefined")

  const inputPrevValue = (inputComponent.prevData.get(inputKey)?.value as number) ?? 0
  const value = inputValue.value as number

  const scrollDelta =
    Math.min(1, Math.max(-1, value - inputPrevValue)) * (inputValue.inputAction === TouchInputs.Scale ? 0.25 : 1)
  if (cameraFollow.mode !== CameraModes.ThirdPerson && scrollDelta === lastScrollDelta) {
    return
  }
  lastScrollDelta = scrollDelta

  switch (cameraFollow.mode) {
    case CameraModes.FirstPerson:
      if (scrollDelta > 0) {
        switchCameraMode(entity, { cameraMode: CameraModes.ShoulderCam })
      }
      break
    case CameraModes.ShoulderCam:
      if (scrollDelta > 0) {
        switchCameraMode(entity, { cameraMode: CameraModes.ThirdPerson })
        cameraFollow.distance = cameraFollow.minDistance + 1
      }
      if (scrollDelta < 0) {
        switchCameraMode(entity, { cameraMode: CameraModes.FirstPerson })
      }
      break
    default:
    case CameraModes.ThirdPerson:
      const newDistance = cameraFollow.distance + scrollDelta
      cameraFollow.distance = Math.max(cameraFollow.minDistance, Math.min(cameraFollow.maxDistance, newDistance))

      if (cameraFollow.distance >= cameraFollow.maxDistance) {
        if (scrollDelta > 0) {
          switchCameraMode(entity, { cameraMode: CameraModes.TopDown })
        }
      } else if (cameraFollow.distance <= cameraFollow.minDistance) {
        if (scrollDelta < 0) {
          switchCameraMode(entity, { cameraMode: CameraModes.ShoulderCam })
        }
      }

      break
    case CameraModes.TopDown:
      if (scrollDelta < 0) {
        switchCameraMode(entity, { cameraMode: CameraModes.ThirdPerson })
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
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const object = getComponent(entity, Object3DComponent)
  const body = object.value?.getObjectByName('Body') as Mesh

  if (!body?.isMesh) {
    return
  }

  const input = getComponent(entity, InputComponent)
  const inputData = input?.data.get(inputKey)
  if (!inputData) {
    return
  }
  const morphValue = inputData.value
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
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  const input = getComponent(entity, InputComponent)

  const data = input.data.get(inputKey)

  if (data.type === InputType.TWODIM) {
    controller.localMovementDirection.z = data.value[0]
    controller.localMovementDirection.x = data.value[1]
  } else if (data.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    controller.localMovementDirection.z = data.value[2]
    controller.localMovementDirection.x = data.value[0]
  }
}
const setWalking: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  controller.isWalking = inputValue.lifecycleState !== LifecycleValue.ENDED
  controller.moveSpeed = controller.isWalking ? controller.walkSpeed : controller.runSpeed
}

const setLocalMovementDirection: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
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
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  const input = getComponent(entity, InputComponent)
  const values = input.data.get(BaseInput.XR_AXIS_MOVE)?.value
  if (!values) return

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
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const input = getComponent(entity, InputComponent)
  const values = input.data.get(BaseInput.XR_AXIS_LOOK)?.value
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

const lookByInputAxis: InputBehaviorType = (entity: Entity): void => {
  const input = getComponent(entity, InputComponent)
  const data = input.data.get(BaseInput.GAMEPAD_STICK_RIGHT)
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

export const clickNavMesh: InputBehaviorType = (actorEntity, inputKey, inputValue): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) {
    return
  }
  const input = getComponent(actorEntity, InputComponent)
  const coords = input.data.get(BaseInput.SCREENXY)?.value
  if (coords) {
    addComponent(actorEntity, AutoPilotClickRequestComponent, { coords: new Vector2(coords[0], coords[1]) })
  }
}

// what do we want this to look like?
// instead of assigning a hardware input to a base input, we want to map them

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
  map.set(TouchInputs.DoubleTouch, BaseInput.JUMP)
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

  map.set('w', BaseInput.FORWARD)
  map.set('a', BaseInput.LEFT)
  map.set('s', BaseInput.BACKWARD)
  map.set('d', BaseInput.RIGHT)
  map.set('e', BaseInput.INTERACT)
  map.set(' ', BaseInput.JUMP)
  map.set('shift', BaseInput.WALK)
  map.set('p', BaseInput.POINTER_LOCK)
  map.set('v', BaseInput.SWITCH_CAMERA)
  map.set('c', BaseInput.SWITCH_SHOULDER_SIDE)
  map.set('f', BaseInput.LOCKING_CAMERA)

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

  // BUTTON

  map.set(BaseInput.SWITCH_CAMERA, cycleCameraMode)
  map.set(BaseInput.LOCKING_CAMERA, fixedCameraBehindAvatar)
  map.set(BaseInput.SWITCH_SHOULDER_SIDE, switchShoulderSide)

  map.set(BaseInput.INTERACT, interact)
  map.set(BaseInput.GRAB_LEFT, interact)
  map.set(BaseInput.GRAB_RIGHT, interact)

  map.set(BaseInput.JUMP, setLocalMovementDirection)
  map.set(BaseInput.WALK, setWalking)
  map.set(BaseInput.FORWARD, setLocalMovementDirection)
  map.set(BaseInput.BACKWARD, setLocalMovementDirection)
  map.set(BaseInput.LEFT, setLocalMovementDirection)
  map.set(BaseInput.RIGHT, setLocalMovementDirection)

  // AXIS

  map.set(CameraInput.Happy, setAvatarExpression)
  map.set(CameraInput.Sad, setAvatarExpression)

  map.set(BaseInput.CAMERA_SCROLL, changeCameraDistanceByDelta)
  map.set(BaseInput.MOVEMENT_PLAYERONE, moveByInputAxis)
  map.set(BaseInput.GAMEPAD_STICK_LEFT, lookByInputAxis)
  map.set(BaseInput.GAMEPAD_STICK_RIGHT, lookByInputAxis)
  map.set(BaseInput.XR_AXIS_LOOK, lookFromXRInputs)
  map.set(BaseInput.XR_AXIS_MOVE, moveFromXRInputs)

  map.set(BaseInput.PRIMARY, clickNavMesh)

  return map
}

export const AvatarInputSchema: InputSchema = {
  onAdded: () => {},
  onRemove: () => {},
  inputMap: createAvatarInput(),
  behaviorMap: createBehaviorMap()
}
