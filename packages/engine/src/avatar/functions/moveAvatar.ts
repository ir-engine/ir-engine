import { Collider } from '@dimforge/rapier3d-compat'
import { Matrix4, Quaternion, Vector2, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { ObjectDirection } from '../../common/constants/Axis3D'
import { V_00, V_000, V_010 } from '../../common/constants/MathConstants'
import checkPositionIsValid from '../../common/functions/checkPositionIsValid'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  ComponentType,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectAuthorityTag } from '../../networking/components/NetworkObjectComponent'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { updateWorldOrigin } from '../../transform/updateWorldOrigin'
import { getControlMode, XRState } from '../../xr/XRState'
import { AvatarSettings } from '../AvatarControllerSystem'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { AvatarTeleportComponent } from '../components/AvatarTeleportComponent'
import { AvatarInputSettingsState } from '../state/AvatarInputSettingsState'
import { avatarRadius } from './spawnAvatarReceptor'

const _vec = new Vector3()
const _quat = new Quaternion()
const _quat2 = new Quaternion()

export const avatarCameraOffset = new Vector3(0, 0.14, 0.1)

/**
 * configurables
 */
const stepHeight = 0.5
const stepAngle = (60 * Math.PI) / 180 // 60 degrees

/**
 * raycast internals
 */
const expandedAvatarRadius = avatarRadius + 0.025
const stepLowerBound = avatarRadius * 0.25
const minimumStepSpeed = 0.1
const avatarStepRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: ObjectDirection.Down,
  maxDistance: stepHeight,
  groups: getInteractionGroups(CollisionGroups.Avatars, CollisionGroups.Ground)
}

//   const avatarInputState = getState(AvatarInputSettingsState)
//   /** teleport controls handled in AvatarInputSchema */
//   if (getControlMode() === 'attached' && avatarInputState.controlScheme.value === AvatarMovementScheme.Teleport) return

//   moveAvatar(entity)
// }

const cameraDirection = new Vector3()
const forwardOrientation = new Quaternion()
const targetWorldMovement = new Vector3()

/**
 * Avatar movement via gamepad
 */
export const applyGamepadInput = (entity: Entity) => {
  if (!entity) return

  const world = Engine.instance.currentWorld
  const camera = world.camera
  const fixedDeltaSeconds = world.fixedDeltaSeconds
  const controller = getComponent(entity, AvatarControllerComponent)
  const rigidbody = getComponent(entity, RigidBodyComponent)

  const lerpAlpha = 6 * fixedDeltaSeconds
  const legSpeed = controller.isWalking ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed
  camera.getWorldDirection(cameraDirection).setY(0).normalize()
  forwardOrientation.setFromUnitVectors(ObjectDirection.Forward, cameraDirection)

  targetWorldMovement
    .copy(controller.gamepadLocalInput)
    .multiplyScalar(legSpeed * fixedDeltaSeconds)
    .applyQuaternion(forwardOrientation)

  /** compute smoothed movement in the world XZ plane */
  controller.gamepadWorldMovement.lerp(targetWorldMovement, lerpAlpha)

  // set vertical velocity on ground
  if (!controller.isInAir) {
    controller.verticalVelocity = 0
    if (controller.gamepadJumpActive) {
      if (!controller.isJumping) {
        // Formula: takeoffVelocity = sqrt(2 * jumpHeight * gravity)
        controller.verticalVelocity = Math.sqrt(2 * AvatarSettings.instance.jumpHeight * 9.81)
        controller.isJumping = true
      }
    } else if (controller.isJumping) {
      controller.isJumping = false
    }
  } else {
    controller.isJumping = false
  }

  // apply gravity
  controller.verticalVelocity -= 9.81 * fixedDeltaSeconds

  // apply movement
  controller.desiredMovement.x += controller.gamepadWorldMovement.x
  controller.desiredMovement.z += controller.gamepadWorldMovement.z
  controller.desiredMovement.y += controller.verticalVelocity * fixedDeltaSeconds
  controller.controller.computeColliderMovement(controller.bodyCollider, controller.desiredMovement)
  controller.isInAir = !controller.controller.computedGrounded()
  const computedMovement = controller.controller.computedMovement() as any
  rigidbody.nextPosition.copy(rigidbody.position).add(computedMovement)

  if (!controller.isInAir) controller.verticalVelocity = 0

  // apply rotation
  _avatarApplyRotation(entity)

  // reset desired movement
  controller.desiredMovement.copy(V_000)
}

/**
 * Rotates the avatar's rigidbody around the Y axis by a given angle
 * @param entity
 * @param angle
 */
export const rotateAvatar = (entity: Entity, angle: number) => {
  _quat.setFromAxisAngle(V_010, angle)
  const rigidBody = getComponent(entity, RigidBodyComponent)
  _quat2.copy(rigidBody.body.rotation() as Quaternion).multiply(_quat)
  rigidBody.nextRotation.copy(_quat2)
}

/**
 * Teleports the avatar to new position
 * @param entity
 * @param newPosition
 */
export const teleportAvatar = (entity: Entity, targetPosition: Vector3): void => {
  if (!hasComponent(entity, AvatarComponent)) {
    console.warn('Teleport avatar called on non-avatar entity')
    return
  }

  const raycastOrigin = targetPosition.clone()
  raycastOrigin.y += 0.1
  const { raycastHit } = checkPositionIsValid(raycastOrigin, false)

  if (raycastHit) {
    const pos = new Vector3().copy(raycastHit.position as Vector3)
    const transform = getComponent(entity, TransformComponent)
    transform.position.copy(pos)
  } else {
    console.log('invalid position', targetPosition, raycastHit)
  }
}

/**
 * Rotates the avatar
 * - if we are in attached mode, we dont need to do any extra rotation
 *     as this is done via the webxr camera automatically
 */
const _avatarApplyRotation = (entity: Entity) => {
  const isInVR = getControlMode() === 'attached'
  if (!isInVR) {
    if (hasComponent(entity, AvatarHeadDecapComponent)) {
      _rotateBodyTowardsCameraDirection(entity)
    } else {
      _rotateBodyTowardsVector(entity, getComponent(entity, RigidBodyComponent).linearVelocity)
    }
  }
}

const _cameraDirection = new Vector3()
const _mat = new Matrix4()

const rotMatrix = new Matrix4()
const targetOrientation = new Quaternion()
const finalOrientation = new Quaternion()

const _rotateBodyTowardsCameraDirection = (entity: Entity) => {
  const fixedDeltaSeconds = getState(EngineState).fixedDeltaSeconds.value
  const rigidbody = getComponent(entity, RigidBodyComponent)
  if (!rigidbody) return

  const cameraRotation = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent).rotation
  const direction = _cameraDirection.set(0, 0, 1).applyQuaternion(cameraRotation).setComponent(1, 0)
  targetOrientation.setFromRotationMatrix(_mat.lookAt(V_000, direction, V_010))

  finalOrientation.copy(rigidbody.body.rotation() as Quaternion)
  finalOrientation.slerp(targetOrientation, 3 * fixedDeltaSeconds)
  rigidbody.nextRotation.copy(finalOrientation)
}

const _velXZ = new Vector3()
const prevVectors = new Map<Entity, Vector3>()
const _rotateBodyTowardsVector = (entity: Entity, vector: Vector3) => {
  const rigidbody = getComponent(entity, RigidBodyComponent)
  if (!rigidbody) return

  let prevVector = prevVectors.get(entity)!
  if (!prevVector) {
    prevVector = new Vector3(0, 0, 1)
    prevVectors.set(entity, prevVector)
  }

  _velXZ.set(vector.x, 0, vector.z)
  const isZero = _velXZ.distanceTo(V_000) < 0.1
  if (isZero) _velXZ.copy(prevVector)
  if (!isZero) prevVector.copy(_velXZ)

  const fixedDeltaSeconds = getState(EngineState).fixedDeltaSeconds.value

  rotMatrix.lookAt(_velXZ, V_000, V_010)
  targetOrientation.setFromRotationMatrix(rotMatrix)

  const prevRot = getComponent(entity, TransformComponent).rotation
  finalOrientation.copy(prevRot)
  finalOrientation.slerp(targetOrientation, 3 * fixedDeltaSeconds)
  rigidbody.nextRotation.copy(finalOrientation)
}
