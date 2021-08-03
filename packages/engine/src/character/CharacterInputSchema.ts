import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { Entity } from '../ecs/classes/Entity'
import { addComponent, getComponent } from '../ecs/functions/EntityFunctions'
import { Input } from '../input/components/Input'
import { BaseInput } from '../input/enums/BaseInput'
import { Camera, Material, Mesh, Quaternion, Vector3, Vector2 } from 'three'
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh'
import { CameraModes } from '../camera/types/CameraModes'
import { LifecycleValue } from '../common/enums/LifecycleValue'
import { GamepadAxis, XRAxes } from '../input/enums/InputEnums'
import { getMutableComponent } from '../ecs/functions/EntityFunctions'
import { CameraInput, GamepadButtons, MouseInput, TouchInputs } from '../input/enums/InputEnums'
import { InputType } from '../input/enums/InputType'
import { InputBehaviorType, InputSchema } from '../input/interfaces/InputSchema'
import { InputAlias } from '../input/types/InputAlias'
import { Interactor } from '../interaction/components/Interactor'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { CharacterComponent } from './components/CharacterComponent'
import { isMobile } from '../common/functions/isMobile'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRUserSettings, XR_ROTATION_MODE } from '../xr/types/XRUserSettings'
import { ParityValue } from '../common/enums/ParityValue'
import { InputValue } from '../input/interfaces/InputValue'
import { NumericalType } from '../common/types/NumericalTypes'
import { InteractedComponent } from '../interaction/components/InteractedComponent'
import { AutoPilotClickRequestComponent } from '../navigation/component/AutoPilotClickRequestComponent'

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

  const interactor = getComponent(entity, Interactor)
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
  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent)

  switch (cameraFollow?.mode) {
    case CameraModes.FirstPerson:
      switchCameraMode(entity, { mode: CameraModes.ShoulderCam })
      break
    case CameraModes.ShoulderCam:
      switchCameraMode(entity, { mode: CameraModes.ThirdPerson })
      cameraFollow.distance = cameraFollow.minDistance + 1
      break
    case CameraModes.ThirdPerson:
      switchCameraMode(entity, { mode: CameraModes.TopDown })
      break
    case CameraModes.TopDown:
      switchCameraMode(entity, { mode: CameraModes.FirstPerson })
      break
    default:
      break
  }
}
/**
 * Fix camera behind the character to follow the character.
 * @param entity Entity on which camera will be fixed.
 */
const fixedCameraBehindCharacter: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
  const follower = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent)
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
  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent)
  if (cameraFollow) {
    cameraFollow.shoulderSide = !cameraFollow.shoulderSide
  }
}

const setVisible = (entity: Entity, visible: boolean): void => {
  const actor = getMutableComponent(entity, CharacterComponent)
  const object3DComponent = getComponent(entity, Object3DComponent)
  if (actor.visible !== visible) {
    actor.visible = visible
    object3DComponent.value.traverse((obj) => {
      const mat = (obj as SkinnedMesh).material
      if (mat) {
        if (visible) {
          ;(mat as Material).opacity = 1
          ;(mat as Material).transparent = false
        } else {
          ;(mat as Material).opacity = 0
          ;(mat as Material).transparent = true
        }
      }
    })
  }
}

let changeTimeout = undefined
const switchCameraMode = (entity: Entity, args: any = { pointerLock: false, mode: CameraModes.ThirdPerson }): void => {
  if (changeTimeout !== undefined) return
  changeTimeout = setTimeout(() => {
    clearTimeout(changeTimeout)
    changeTimeout = undefined
  }, 250)

  const actor = getMutableComponent(entity, CharacterComponent)

  const cameraFollow = getMutableComponent(entity, FollowCameraComponent)
  cameraFollow.mode = args.mode

  switch (args.mode) {
    case CameraModes.FirstPerson:
      {
        cameraFollow.phi = 0
        cameraFollow.locked = true
        setVisible(entity, false)
      }
      break

    case CameraModes.ShoulderCam:
      {
        setVisible(entity, true)
      }
      break

    default:
    case CameraModes.ThirdPerson:
      {
        setVisible(entity, true)
      }
      break

    case CameraModes.TopDown:
      {
        setVisible(entity, true)
      }
      break
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
  const inputComponent = getComponent(entity, Input) as Input

  if (!inputComponent.data.has(inputKey)) {
    return
  }

  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent)
  if (cameraFollow === undefined || cameraFollow.mode === CameraModes.Isometric) return //console.warn("cameraFollow is undefined");

  const inputPrevValue = (inputComponent.prevData.get(inputKey)?.value as number) ?? 0
  const value = inputValue.value as number

  const scrollDelta = Math.min(1, Math.max(-1, value - inputPrevValue)) * (isMobile ? 0.25 : 1)
  if (cameraFollow.mode !== CameraModes.ThirdPerson && scrollDelta === lastScrollDelta) {
    return
  }
  lastScrollDelta = scrollDelta

  switch (cameraFollow.mode) {
    case CameraModes.FirstPerson:
      if (scrollDelta > 0) {
        switchCameraMode(entity, { mode: CameraModes.ShoulderCam })
      }
      break
    case CameraModes.ShoulderCam:
      if (scrollDelta > 0) {
        switchCameraMode(entity, { mode: CameraModes.ThirdPerson })
        cameraFollow.distance = cameraFollow.minDistance + 1
      }
      if (scrollDelta < 0) {
        switchCameraMode(entity, { mode: CameraModes.FirstPerson })
      }
      break
    default:
    case CameraModes.ThirdPerson:
      const newDistance = cameraFollow.distance + scrollDelta
      cameraFollow.distance = Math.max(cameraFollow.minDistance, Math.min(cameraFollow.maxDistance, newDistance))

      if (cameraFollow.distance >= cameraFollow.maxDistance) {
        if (scrollDelta > 0) {
          switchCameraMode(entity, { mode: CameraModes.TopDown })
        }
      } else if (cameraFollow.distance <= cameraFollow.minDistance) {
        if (scrollDelta < 0) {
          switchCameraMode(entity, { mode: CameraModes.ShoulderCam })
        }
      }

      break
    case CameraModes.TopDown:
      if (scrollDelta < 0) {
        switchCameraMode(entity, { mode: CameraModes.ThirdPerson })
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

const setCharacterExpression: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  // console.log('setCharacterExpression', args.input, morphNameByInput[args.input]);
  const object: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent)
  const body = object.value?.getObjectByName('Body') as Mesh

  if (!body?.isMesh) {
    return
  }

  const input: Input = getComponent(entity, Input)
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

  // console.warn(args.input + ": " + morphName + ":" + morphIndex + " = " + morphValue);
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
  const actor = getMutableComponent(entity, CharacterComponent)
  const input = getComponent(entity, Input)

  const data = input.data.get(inputKey)

  if (data.type === InputType.TWODIM) {
    actor.localMovementDirection.z = data.value[0]
    actor.localMovementDirection.x = data.value[1]
  } else if (data.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    actor.localMovementDirection.z = data.value[2]
    actor.localMovementDirection.x = data.value[0]
  }
}
const setWalking: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const actor = getMutableComponent(entity, CharacterComponent)
  actor.isWalking = inputValue.lifecycleState !== LifecycleValue.ENDED
  actor.moveSpeed = actor.isWalking ? actor.walkSpeed : actor.runSpeed
}

const setLocalMovementDirection: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const actor = getMutableComponent(entity, CharacterComponent)
  const hasEnded = inputValue.lifecycleState === LifecycleValue.ENDED
  switch (inputKey) {
    case BaseInput.JUMP:
      actor.localMovementDirection.y = hasEnded ? 0 : 1
      break
    case BaseInput.FORWARD:
      actor.localMovementDirection.z = hasEnded ? 0 : 1
      break
    case BaseInput.BACKWARD:
      actor.localMovementDirection.z = hasEnded ? 0 : -1
      break
    case BaseInput.LEFT:
      actor.localMovementDirection.x = hasEnded ? 0 : 1
      break
    case BaseInput.RIGHT:
      actor.localMovementDirection.x = hasEnded ? 0 : -1
      break
  }
  actor.localMovementDirection.normalize()
}

const moveFromXRInputs: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const actor = getMutableComponent(entity, CharacterComponent)
  const input = getComponent(entity, Input)
  const values = input.data.get(BaseInput.XR_AXIS_MOVE)?.value
  if (!values) return

  actor.localMovementDirection.x = values[0] ?? actor.localMovementDirection.x
  actor.localMovementDirection.z = values[1] ?? actor.localMovementDirection.z
  actor.localMovementDirection.normalize()
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
  const input = getComponent(entity, Input)
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

const lookByInputAxis: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue<NumericalType>,
  delta: number
): void => {
  const input = getMutableComponent(entity, Input)
  const data = input.data.get(BaseInput.GAMEPAD_STICK_RIGHT)
  const multiplier = 0.1
  // adding very small noise to trigger same value to be "changed"
  // till axis values is not zero, look input should be treated as changed
  const noise = (Math.random() > 0.5 ? 1 : -1) * 0.00001

  if (data.type === InputType.TWODIM) {
    const isEmpty = Math.abs(data.value[0]) === 0 && Math.abs(data.value[1]) === 0
    // axis is set, transfer it into output and trigger changed
    if (!isEmpty) {
      input.data.set(BaseInput.LOOKTURN_PLAYERONE, {
        type: data.type,
        value: [data.value[0] * multiplier + noise, data.value[1] * multiplier + noise],
        lifecycleState: LifecycleValue.CHANGED
      })
    }
  } else if (data.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    const isEmpty = Math.abs(data.value[0]) === 0 && Math.abs(data.value[2]) === 0
    if (!isEmpty) {
      input.data.set(BaseInput.LOOKTURN_PLAYERONE, {
        type: data.type,
        value: [data.value[0] * multiplier + noise, data.value[2] * multiplier + noise],
        lifecycleState: LifecycleValue.CHANGED
      })
    }
  }
}

export const clickNavMesh: InputBehaviorType = (actorEntity, inputKey, inputValue): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) {
    return
  }
  const input = getComponent(actorEntity, Input)
  const coords = input.data.get(BaseInput.SCREENXY).value
  addComponent(actorEntity, AutoPilotClickRequestComponent, { coords: new Vector2(coords[0], coords[1]) })
}

// what do we want this to look like?
// instead of assigning a hardware input to a base input, we want to map them

export const createCharacterInput = () => {
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
  map.set(BaseInput.LOCKING_CAMERA, fixedCameraBehindCharacter)
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

  map.set(CameraInput.Happy, setCharacterExpression)
  map.set(CameraInput.Sad, setCharacterExpression)

  map.set(BaseInput.CAMERA_SCROLL, changeCameraDistanceByDelta)
  map.set(BaseInput.MOVEMENT_PLAYERONE, moveByInputAxis)
  map.set(BaseInput.GAMEPAD_STICK_LEFT, lookByInputAxis)
  map.set(BaseInput.GAMEPAD_STICK_RIGHT, lookByInputAxis)
  map.set(BaseInput.XR_AXIS_LOOK, lookFromXRInputs)
  map.set(BaseInput.XR_AXIS_MOVE, moveFromXRInputs)

  map.set(BaseInput.PRIMARY, clickNavMesh)

  return map
}

export const CharacterInputSchema: InputSchema = {
  onAdded: () => {},
  onRemove: () => {},
  inputMap: createCharacterInput(),
  behaviorMap: createBehaviorMap()
}
