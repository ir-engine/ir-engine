import { ArrowHelper, Matrix4, Quaternion, Vector3 } from 'three'

import { addActionReceptor, getState } from '@xrengine/hyperflux'

import { V_000, V_001, V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { AvatarMovementScheme } from '../input/enums/InputEnums'
import { XRAxes } from '../input/enums/InputEnums'
import { RapierCollisionComponent } from '../physics/components/RapierCollisionComponent'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../xr/XRComponents'
import { AvatarInputSchema } from './AvatarInputSchema'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from './components/AvatarHeadDecapComponent'
import { detectUserInCollisions } from './functions/detectUserInCollisions'
import {
  alignXRCameraWithAvatar,
  moveLocalAvatar,
  moveXRAvatar,
  rotateXRAvatar,
  xrCameraNeedsAlignment
} from './functions/moveAvatar'
import { respawnAvatar } from './functions/respawnAvatar'
import { accessAvatarInputSettingsState, AvatarInputSettingsReceptor } from './state/AvatarInputSettingsState'

/**
 * TODO: convert this to hyperflux state
 */
export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  // Speeds are same as animation's root motion
  walkSpeed = 1.6762927669761485
  runSpeed = 3.769894125544925 * 1.5
  jumpHeight = 6
  movementScheme = AvatarMovementScheme.Linear
}

const displacementXZ = new Vector3(),
  invOrientation = new Quaternion(),
  rotMatrix = new Matrix4(),
  targetOrientation = new Quaternion()

export default async function AvatarControllerSystem(world: World) {
  const controllerQuery = defineQuery([AvatarControllerComponent])
  const localXRInputQuery = defineQuery([
    LocalInputTagComponent,
    XRInputSourceComponent,
    AvatarControllerComponent,
    TransformComponent
  ])
  const collisionQuery = defineQuery([AvatarControllerComponent, RapierCollisionComponent])

  addActionReceptor(AvatarInputSettingsReceptor)

  const lastCamPos = new Vector3(),
    displacement = new Vector3()
  let isLocalXRCameraReady = false

  return () => {
    for (const entity of controllerQuery.exit(world)) {
      removeAvatarControllerRigidBody(entity, world)
    }

    for (const entity of localXRInputQuery.enter(world)) {
      isLocalXRCameraReady = false
    }

    // for (const entity of localXRInputQuery(world)) {
    //   const { camera } = Engine.instance.currentWorld

    //   if (displacement.lengthSq() > 0 || xrCameraNeedsAlignment(entity, camera)) {
    //     alignXRCameraWithAvatar(entity, camera, lastCamPos)
    //     continue
    //   }

    //   if (!isLocalXRCameraReady) {
    //     alignXRInputContainerYawWithAvatar(entity)
    //     isLocalXRCameraReady = true
    //   }

    //   moveXRAvatar(world, entity, Engine.instance.currentWorld.camera, lastCamPos)
    //   rotateXRAvatar(world, entity, Engine.instance.currentWorld.camera)
    // }

    const controller = getComponent(Engine.instance.currentWorld.localClientEntity, AvatarControllerComponent)
    if (controller?.movementEnabled) {
      moveLocalAvatar(Engine.instance.currentWorld.localClientEntity)
    }

    for (const entity of collisionQuery(world)) {
      detectUserInCollisions(entity)
    }

    return world
  }
}

const alignXRInputContainerYawWithAvatar = (entity: Entity) => {
  const inputSource = getComponent(entity, XRInputSourceComponent)
  const transform = getComponent(entity, TransformComponent)
  const dir = new Vector3(0, 0, -1)
  dir.applyQuaternion(transform.rotation).setY(0).normalize()
  inputSource.container.quaternion.setFromUnitVectors(V_001, dir)
}

const _cameraDirection = new Vector3()
const _mat = new Matrix4()
const _desiredRotation = new Quaternion()
export const rotateBodyTowardsCameraDirection = (entity: Entity) => {
  const fixedDeltaSeconds = getState(EngineState).fixedDeltaSeconds.value
  const controller = getComponent(entity, AvatarControllerComponent)

  const cameraRotation = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent).rotation
  const direction = _cameraDirection.set(0, 0, 1).applyQuaternion(cameraRotation)
  direction.y = 0
  _desiredRotation.setFromRotationMatrix(_mat.lookAt(V_000, direction, V_010))

  const rot = _desiredRotation.copy(controller.body.rotation() as Quaternion)
  rot.slerp(_desiredRotation, Math.max(Engine.instance.currentWorld.deltaSeconds * 2, 3 * fixedDeltaSeconds))

  controller.body.setRotation(rot, true)
}

const _velXZ = new Vector3()
export const rotateBodyTowardsVelocityVector = (entity: Entity) => {
  const fixedDeltaSeconds = getState(EngineState).fixedDeltaSeconds.value
  const controller = getComponent(entity, AvatarControllerComponent)
  const velocity = getComponent(entity, VelocityComponent)

  _velXZ.set(velocity.linear.x, 0, velocity.linear.z)

  if (_velXZ.lengthSq() <= 0.001) return

  rotMatrix.lookAt(_velXZ, V_000, V_010)
  targetOrientation.setFromRotationMatrix(rotMatrix)

  const rot = _desiredRotation.copy(controller.body.rotation() as Quaternion)
  rot.slerp(targetOrientation, Math.max(Engine.instance.currentWorld.deltaSeconds * 2, 3 * fixedDeltaSeconds))

  controller.body.setRotation(rot, true)
}

export const removeAvatarControllerRigidBody = (entity: Entity, world: World = Engine.instance.currentWorld) => {
  const controller = getComponent(entity, AvatarControllerComponent, true)
  if (controller?.body) world.physicsWorld.removeRigidBody(controller.body)
}

export const updateMap = () => {
  const avatarInputState = accessAvatarInputSettingsState()
  const inputMap = AvatarInputSchema.inputMap
  if (avatarInputState.invertRotationAndMoveSticks.value) {
    inputMap.set(XRAxes.Left, BaseInput.XR_AXIS_LOOK)
    inputMap.set(XRAxes.Right, BaseInput.XR_AXIS_MOVE)
  } else {
    inputMap.set(XRAxes.Left, BaseInput.XR_AXIS_MOVE)
    inputMap.set(XRAxes.Right, BaseInput.XR_AXIS_LOOK)
  }
}
