import { SkinnedMesh, Vector2, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { isDev } from '@xrengine/common/src/utils/isDev'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../camera/components/TargetCameraRotationComponent'
import { CameraMode } from '../camera/types/CameraMode'
import { LifecycleValue } from '../common/enums/LifecycleValue'
import { ParityValue } from '../common/enums/ParityValue'
import { throttle } from '../common/functions/FunctionHelpers'
import { clamp } from '../common/functions/MathLerpFunctions'
import { Engine } from '../ecs/classes/Engine'
import { EngineActions } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../ecs/functions/ComponentFunctions'
import { InputComponent } from '../input/components/InputComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { PhysicsDebugInput } from '../input/enums/DebugEnum'
import {
  AvatarMovementScheme,
  CameraInput,
  GamepadAxis,
  GamepadButtons,
  MouseInput,
  TouchInputs
} from '../input/enums/InputEnums'
import { InputType } from '../input/enums/InputType'
import { InputBehaviorType, InputSchema } from '../input/interfaces/InputSchema'
import { InputValue } from '../input/interfaces/InputValue'
import { InputAlias } from '../input/types/InputAlias'
import { EquipperComponent } from '../interaction/components/EquipperComponent'
import { unequipEntity } from '../interaction/functions/equippableFunctions'
import { InteractState } from '../interaction/systems/InteractiveSystem'
import { AutoPilotClickRequestComponent } from '../navigation/component/AutoPilotClickRequestComponent'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { Physics, RaycastArgs } from '../physics/classes/Physics'
import { CollisionGroups } from '../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../physics/functions/getInteractionGroups'
import { boxDynamicConfig } from '../physics/functions/physicsObjectDebugFunctions'
import { SceneQueryType } from '../physics/types/PhysicsTypes'
import { accessEngineRendererState, EngineRendererAction } from '../renderer/EngineRendererState'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { XRLGripButtonComponent, XRRGripButtonComponent } from '../xr/XRComponents'
import { getControlMode } from '../xr/XRState'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { moveAvatarWithTeleport, rotateAvatar } from './functions/moveAvatar'
import { switchCameraMode } from './functions/switchCameraMode'
import { AvatarInputSettingsState } from './state/AvatarInputSettingsState'

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

const grip = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  // switch (inputValue.lifecycleState) {
  //   case LifecycleValue.Started: {
  //     if (inputKey == BaseInput.GRIP_LEFT) {
  //       addComponent(entity, XRLGripButtonComponent, {})
  //     } else {
  //       addComponent(entity, XRRGripButtonComponent, {})
  //     }
  //     break
  //   }
  //   case LifecycleValue.Ended: {
  //     if (inputKey == BaseInput.GRIP_LEFT) {
  //       removeComponent(entity, XRLGripButtonComponent)
  //     } else {
  //       removeComponent(entity, XRRGripButtonComponent)
  //     }
  //     break
  //   }
  // }
}

/**
 *
 * @param entity the one who interacts
 * @param args
 */

const interact = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  if (inputValue.lifecycleState !== LifecycleValue.Started) return
  const parityValue = getParityFromInputValue(inputKey)

  const interactState = getState(InteractState)

  dispatchAction(
    EngineActions.interactedWithObject({
      targetEntity: interactState.available[0].value,
      parityValue
    })
  )
}

/**
 *
 * @param entity the that holds the equipped object
 * @param args
 */

const drop = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  console.log('dropping')
  const equipper = getComponent(entity, EquipperComponent)
  if (!equipper?.equippedEntity) return

  unequipEntity(entity)
}

/**
 * Switch Camera mode from first person to third person and vice versa.
 * @param entity Entity holding {@link camera/components/FollowCameraComponent.FollowCameraComponent | Follow camera} component.
 */
const cycleCameraMode = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  if (inputValue.lifecycleState !== LifecycleValue.Started) return

  const cameraEntity = Engine.instance.currentWorld.cameraEntity
  const cameraFollow = getComponent(cameraEntity, FollowCameraComponent)

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
export const fixedCameraBehindAvatar: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue
): void => {
  if (inputValue.lifecycleState !== LifecycleValue.Started) return
  const follower = getComponent(Engine.instance.currentWorld.cameraEntity, FollowCameraComponent)
  if (follower && follower.mode !== CameraMode.FirstPerson) {
    follower.locked = !follower.locked
  }
}

export const switchShoulderSide: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue
): void => {
  const cameraEntity = Engine.instance.currentWorld.cameraEntity
  if (inputValue.lifecycleState !== LifecycleValue.Started) return
  const cameraFollow = getComponent(cameraEntity, FollowCameraComponent)
  if (cameraFollow) {
    cameraFollow.shoulderSide = !cameraFollow.shoulderSide
  }
}

export const setTargetCameraRotation = (entity: Entity, phi: number, theta: number, time = 0.3) => {
  const cameraRotationTransition = getComponent(entity, TargetCameraRotationComponent)
  if (!cameraRotationTransition) {
    addComponent(entity, TargetCameraRotationComponent, {
      phi: phi,
      phiVelocity: { value: 0 },
      theta: theta,
      thetaVelocity: { value: 0 },
      time: time
    })
  } else {
    cameraRotationTransition.phi = phi
    cameraRotationTransition.theta = theta
    cameraRotationTransition.time = time
  }
}

let lastScrollValue = 0

/**
 * Change camera distance.
 * @param entity Entity holding camera and input component.
 */
export const changeCameraDistanceByDelta: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue
): void => {
  const value = inputValue.value[0]
  const scrollDelta = Math.sign(value - lastScrollValue) * 0.5
  lastScrollValue = value

  if (scrollDelta === 0) {
    return
  }

  const avatarController = getComponent(entity, AvatarControllerComponent)
  const cameraEntity = avatarController.cameraEntity
  const followComponent = getComponent(cameraEntity, FollowCameraComponent)

  if (!followComponent) {
    return
  }

  const epsilon = 0.001
  const nextZoomLevel = clamp(followComponent.zoomLevel + scrollDelta, epsilon, followComponent.maxDistance)

  // Move out of first person mode
  if (followComponent.zoomLevel <= epsilon && scrollDelta > 0) {
    followComponent.zoomLevel = followComponent.minDistance
    return
  }

  // Move to first person mode
  if (nextZoomLevel < followComponent.minDistance) {
    followComponent.zoomLevel = epsilon
    setTargetCameraRotation(cameraEntity, 0, followComponent.theta)
    return
  }

  // Rotate camera to the top but let the player rotate if he/she desires
  if (Math.abs(followComponent.maxDistance - nextZoomLevel) <= 1.0 && scrollDelta > 0) {
    setTargetCameraRotation(cameraEntity, 85, followComponent.theta)
  }

  // Rotate from top
  if (
    Math.abs(followComponent.maxDistance - followComponent.zoomLevel) <= 1.0 &&
    scrollDelta < 0 &&
    followComponent.phi >= 80
  ) {
    setTargetCameraRotation(cameraEntity, 45, followComponent.theta)
  }

  followComponent.zoomLevel = nextZoomLevel
}

export const setCameraRotation: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue
): void => {
  const { deltaSeconds: delta } = Engine.instance.currentWorld

  const cameraEntity = Engine.instance.currentWorld.cameraEntity
  const followComponent = getComponent(cameraEntity, FollowCameraComponent)

  switch (inputKey) {
    case BaseInput.CAMERA_ROTATE_LEFT:
      followComponent.theta += 100 * delta
      break
    case BaseInput.CAMERA_ROTATE_RIGHT:
      followComponent.theta -= 100 * delta
      break
  }
  setTargetCameraRotation(cameraEntity, followComponent.phi, followComponent.theta)
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

const setAvatarExpression: InputBehaviorType = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  const object = getComponent(entity, Object3DComponent)
  let body
  object.value.traverse((obj: SkinnedMesh) => {
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

/** 90 degree */
const PI_BY_2 = Math.PI / 2

/** For Thumbstick angle less than 270 degree substract 90 from it.from
 * Otherwise substract 450 degree. This is to make angle range from -180 to 180 degree.
 */
const changedDirection = (radian: number) => {
  return radian < 3 * PI_BY_2 ? (radian = radian - PI_BY_2) : radian - 5 * PI_BY_2
}

export const toggleRunning: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  if (inputValue.lifecycleState === LifecycleValue.Started) controller.isWalking = !controller.isWalking
}

const setLocalMovementDirection: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue
): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  const hasEnded = inputValue.lifecycleState === LifecycleValue.Ended
  switch (inputKey) {
    case BaseInput.JUMP:
      controller.localMovementDirection.y = hasEnded ? 0 : 1
      break
    case BaseInput.FORWARD:
      controller.localMovementDirection.z = hasEnded ? 0 : -1
      break
    case BaseInput.BACKWARD:
      controller.localMovementDirection.z = hasEnded ? 0 : 1
      break
    case BaseInput.LEFT:
      controller.localMovementDirection.x = hasEnded ? 0 : -1
      break
    case BaseInput.RIGHT:
      controller.localMovementDirection.x = hasEnded ? 0 : 1
      break
  }
  controller.localMovementDirection.normalize()
}

const axisLookSensitivity = 200
const vrAxisLookSensitivity = 0.025

const moveLeftController: InputBehaviorType = (entity: Entity, inputKey: InputAlias, inputValue: InputValue): void => {
  const avatarController = getComponent(entity, AvatarControllerComponent)
  const cameraEntity = avatarController.cameraEntity
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)

  if (followCamera) {
    const target = getComponent(cameraEntity, TargetCameraRotationComponent) || followCamera
    if (target)
      setTargetCameraRotation(
        cameraEntity,
        target.phi - inputValue.value[1] * axisLookSensitivity,
        target.theta - inputValue.value[0] * axisLookSensitivity,
        0.1
      )
    return
  }

  // if vr, rotate the avatar
  if (getControlMode() === 'attached') {
    if (getState(AvatarInputSettingsState).controlScheme.value === 'AvatarMovementScheme_Teleport') {
      moveAvatarWithTeleport(entity, inputValue.value[1], inputKey === BaseInput.PRIMARY_MOVE_LEFT ? 'left' : 'right')

      if (inputValue.lifecycleState === LifecycleValue.Started) {
        rotateAvatar(entity, (Math.PI / 6) * (inputValue.value[0] > 0 ? -1 : 1)) // 30 degrees
      }
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

      if (inputValue.lifecycleState === LifecycleValue.Started && Math.abs(inputValue.value[0]) > 0.1) {
        rotateAvatar(entity, (Math.PI / 6) * (inputValue.value[0] > 0 ? -1 : 1)) // 30 degrees
      }
    }
  }
}
// const gamepadLook: InputBehaviorType = (entity: Entity): void => {
//   const input = getComponent(entity, InputComponent)
//   const data = input.data.get(BaseInput.GAMEPAD_STICK_RIGHT)!
//   if (data.lifecycleState === LifecycleValue.Ended) {
//     input.data.set(BaseInput.LOOKTURN, {
//       type: data.type,
//       value: [0, 0],
//       lifecycleState: LifecycleValue.Changed
//     })
//   }
//   if (data.type === InputType.TWODIM) {
//     input.data.set(BaseInput.LOOKTURN, {
//       type: data.type,
//       value: [data.value[0], data.value[1]],
//       lifecycleState: LifecycleValue.Changed
//     })
//   } else if (data.type === InputType.THREEDIM) {
//     input.data.set(BaseInput.LOOKTURN, {
//       type: data.type,
//       value: [data.value[0], data.value[2]],
//       lifecycleState: LifecycleValue.Changed
//     })
//   }
// }

export const handlePrimaryButton: InputBehaviorType = (entity, inputKey, inputValue): void => {
  if (inputValue.lifecycleState === LifecycleValue.Started)
    dispatchAction(EngineActions.buttonClicked({ clicked: true, button: BaseInput.PRIMARY }))
  if (inputValue.lifecycleState === LifecycleValue.Ended)
    dispatchAction(EngineActions.buttonClicked({ clicked: false, button: BaseInput.PRIMARY }))

  if (inputValue.lifecycleState !== LifecycleValue.Ended) {
    return
  }
  const input = getComponent(entity, InputComponent)
  const coords = input.data.get(BaseInput.SCREENXY)?.value
  if (coords) {
    addComponent(entity, AutoPilotClickRequestComponent, { coords: new Vector2(coords[0], coords[1]) })
  }
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
  map.set('KeyU', BaseInput.DROP_OBJECT)
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

  map.set(BaseInput.INTERACT, interact)
  map.set(BaseInput.DROP_OBJECT, drop)
  map.set(BaseInput.GRAB_LEFT, interact)
  map.set(BaseInput.GRAB_RIGHT, interact)

  map.set(BaseInput.GRIP_LEFT, grip)
  map.set(BaseInput.GRIP_RIGHT, grip)

  map.set(BaseInput.JUMP, setLocalMovementDirection)
  map.set(BaseInput.RUN, toggleRunning)
  map.set(BaseInput.FORWARD, setLocalMovementDirection)
  map.set(BaseInput.BACKWARD, setLocalMovementDirection)
  map.set(BaseInput.LEFT, setLocalMovementDirection)
  map.set(BaseInput.RIGHT, setLocalMovementDirection)
  map.set(BaseInput.CAMERA_ROTATE_LEFT, setCameraRotation)
  map.set(BaseInput.CAMERA_ROTATE_RIGHT, setCameraRotation)

  map.set(CameraInput.Happy, setAvatarExpression)
  map.set(CameraInput.Sad, setAvatarExpression)

  map.set(BaseInput.PRIMARY_MOVE_LEFT, moveLeftController)
  map.set(BaseInput.PRIMARY_MOVE_RIGHT, moveRightController)

  map.set(BaseInput.SWITCH_CAMERA, cycleCameraMode)
  map.set(BaseInput.LOCKING_CAMERA, fixedCameraBehindAvatar)
  map.set(BaseInput.SWITCH_SHOULDER_SIDE, switchShoulderSide)
  map.set(BaseInput.CAMERA_SCROLL, throttle(changeCameraDistanceByDelta, 30, { leading: true, trailing: false }))

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
