import { QueryFilterFlags } from '@dimforge/rapier3d-compat'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { ObjectDirection } from '../../common/constants/Axis3D'
import { V_000, V_010 } from '../../common/constants/MathConstants'
import checkPositionIsValid from '../../common/functions/checkPositionIsValid'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { teleportObject } from '../../physics/systems/PhysicsSystem'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { updateWorldOrigin } from '../../transform/updateWorldOrigin'
import { getControlMode, ReferenceSpace, XRState } from '../../xr/XRState'
import { AvatarSettings } from '../AvatarControllerSystem'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'

const _quat = new Quaternion()

export const avatarCameraOffset = new Vector3(0, 0.14, 0.1)

/**
 * raycast internals
 */
const avatarGroundRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: ObjectDirection.Down,
  maxDistance: 1.1,
  groups: 0
}

//   const avatarInputState = getState(AvatarInputSettingsState)
//   /** teleport controls handled in AvatarInputSchema */
//   if (getControlMode() === 'attached' && avatarInputState.controlScheme.value === AvatarMovementScheme.Teleport) return

//   moveAvatar(entity)
// }

const cameraDirection = new Vector3()
const forwardOrientation = new Quaternion()
const targetWorldMovement = new Vector3()
const desiredMovement = new Vector3()
const viewerMovement = new Vector3()
const finalAvatarMovement = new Vector3()

export function updateLocalAvatarPosition(additionalMovement?: Vector3) {
  const world = Engine.instance.currentWorld
  const entity = world.localClientEntity
  const xrFrame = Engine.instance.xrFrame

  if (!entity || (!xrFrame && !additionalMovement)) return

  const xrState = getState(XRState)
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const controller = getComponent(entity, AvatarControllerComponent)
  const avatarHeight = getComponent(entity, AvatarComponent)?.avatarHeight ?? 1.6

  const viewerPose = xrFrame && ReferenceSpace.origin ? xrFrame.getViewerPose(ReferenceSpace.origin) : null
  xrState.viewerPose.set(viewerPose)

  viewerMovement.copy(V_000)

  if (viewerPose)
    viewerMovement.set(
      viewerPose.transform.position.x - rigidbody.targetKinematicPosition.x,
      Math.max(viewerPose.transform.position.y - rigidbody.targetKinematicPosition.y - avatarHeight * 0.95, 0),
      viewerPose.transform.position.z - rigidbody.targetKinematicPosition.z
    )

  desiredMovement.copy(viewerMovement)
  if (controller.movementEnabled && additionalMovement) desiredMovement.add(additionalMovement)

  const avatarCollisionGroups = controller.bodyCollider.collisionGroups() & ~CollisionGroups.Trigger

  controller.controller.computeColliderMovement(
    controller.bodyCollider,
    desiredMovement,
    QueryFilterFlags.EXCLUDE_SENSORS,
    avatarCollisionGroups
  )

  const computedMovement = controller.controller.computedMovement() as Vector3

  rigidbody.targetKinematicPosition.add(computedMovement)

  /** rapier's computed movement is a bit bugged, so do a small raycast at the avatar's feet to snap it to the ground if it's close enough */
  avatarGroundRaycast.origin.copy(rigidbody.targetKinematicPosition)
  avatarGroundRaycast.groups = avatarCollisionGroups
  avatarGroundRaycast.origin.y += 1
  const groundHits = Physics.castRay(world.physicsWorld, avatarGroundRaycast)
  // controller.isInAir = !controller.controller.computedGrounded()
  controller.isInAir = true

  const originTransform = getComponent(world.originEntity, TransformComponent)

  if (groundHits.length) {
    const hit = groundHits[0]
    const controllerOffset = controller.controller.offset()
    rigidbody.targetKinematicPosition.y = hit.position.y + controllerOffset
    // hack for atached
    computedMovement.y -= hit.position.y + controllerOffset
    controller.isInAir = hit.distance > 1 + controllerOffset * 1.5
    originTransform.position.y = hit.position.y
  }

  if (!controller.isInAir) controller.verticalVelocity = 0

  finalAvatarMovement.subVectors(computedMovement, viewerMovement)

  updateReferenceSpaceFromAvatarMovement(finalAvatarMovement)
}

export const updateReferenceSpaceFromAvatarMovement = (movement: Vector3) => {
  const attached = getControlMode() === 'attached'
  if (attached) {
    const world = Engine.instance.currentWorld
    const originTransform = getComponent(world.originEntity, TransformComponent)
    originTransform.position.add(movement)
    updateWorldOrigin()
    updateLocalAvatarPositionAttachedMode()
  }
}

const _additionalMovement = new Vector3()

/**
 * Avatar movement via gamepad
 */
export const applyGamepadInput = (entity: Entity) => {
  if (!entity) return

  const world = Engine.instance.currentWorld
  const camera = world.camera
  const deltaSeconds = world.deltaSeconds /** @todo put this back in the fixed pipeline */
  const controller = getComponent(entity, AvatarControllerComponent)

  const lerpAlpha = 6 * deltaSeconds
  const legSpeed = controller.isWalking ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed
  camera.getWorldDirection(cameraDirection).setY(0).normalize()
  forwardOrientation.setFromUnitVectors(ObjectDirection.Forward, cameraDirection)

  targetWorldMovement
    .copy(controller.gamepadLocalInput)
    .multiplyScalar(legSpeed * deltaSeconds)
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

  // apply gamepad movement and gravity
  if (controller.movementEnabled) controller.verticalVelocity -= 9.81 * deltaSeconds
  const verticalMovement = controller.verticalVelocity * deltaSeconds
  _additionalMovement.set(controller.gamepadWorldMovement.x, verticalMovement, controller.gamepadWorldMovement.z)
  updateLocalAvatarPosition(_additionalMovement)
}

const _mat4 = new Matrix4()
const vec3 = new Vector3()

/**
 * Rotates a matrix around it's own origin with a quaternion
 * @param matrix
 * @param point
 * @param rotation
 */
export const spinMatrixWithQuaternion = (matrix: Matrix4, rotation: Quaternion) => {
  rotateMatrixAboutPoint(matrix, vec3.set(matrix.elements[12], matrix.elements[13], matrix.elements[14]), rotation)
}

/**
 * Rotates a matrix around a specific point
 * @param matrix
 * @param point
 * @param rotation
 */
export const rotateMatrixAboutPoint = (matrix: Matrix4, point: Vector3, rotation: Quaternion) => {
  matrix.premultiply(_mat4.makeTranslation(-point.x, -point.y, -point.z))
  matrix.premultiply(_mat4.makeRotationFromQuaternion(rotation))
  matrix.premultiply(_mat4.makeTranslation(point.x, point.y, point.z))
}

/**
 * Rotates the avatar's rigidbody around the Y axis by a given angle
 * @param entity
 * @param angle
 */
export const rotateAvatar = (entity: Entity, angle: number) => {
  _quat.setFromAxisAngle(V_010, angle)
  const rigidBody = getComponent(entity, RigidBodyComponent)
  rigidBody.targetKinematicRotation.multiply(_quat)

  if (getControlMode() === 'attached') {
    const world = Engine.instance.currentWorld
    const worldOriginTransform = getComponent(world.originEntity, TransformComponent)
    spinMatrixWithQuaternion(worldOriginTransform.matrix, _quat)
    worldOriginTransform.matrix.decompose(
      worldOriginTransform.position,
      worldOriginTransform.rotation,
      worldOriginTransform.scale
    )
    updateWorldOrigin()
  }
}

export const updateLocalAvatarPositionAttachedMode = () => {
  const entity = Engine.instance.currentWorld.localClientEntity
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)

  // for immersive and attached avatars, we don't want to interpolate the rigidbody in the transform system, so set
  // previous and current position to the target position

  rigidbody.previousPosition.copy(rigidbody.targetKinematicPosition)
  rigidbody.position.copy(rigidbody.targetKinematicPosition)
  transform.position.copy(rigidbody.targetKinematicPosition)
  rigidbody.body.setTranslation(rigidbody.targetKinematicPosition, true)
}

const viewerQuat = new Quaternion()
const avatarRotationAroundY = new Euler()
const avatarRotation = new Quaternion()

const _updateLocalAvatarRotationAttachedMode = () => {
  const entity = Engine.instance.currentWorld.localClientEntity
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  const viewerPose = getState(XRState).viewerPose.value

  if (!viewerPose) return

  const viewerOrientation = viewerPose.transform.orientation
  viewerQuat.set(viewerOrientation.x, viewerOrientation.y, viewerOrientation.z, viewerOrientation.w)
  // const avatarRotation = extractRotationAboutAxis(viewerQuat, V_010, _quat)
  avatarRotationAroundY.setFromQuaternion(viewerQuat, 'YXZ')
  avatarRotation.setFromAxisAngle(V_010, avatarRotationAroundY.y + Math.PI)

  // for immersive and attached avatars, we don't want to interpolate the rigidbody in the transform system, so set
  // previous and current rotation to the target rotation
  rigidbody.previousRotation.copy(avatarRotation)
  rigidbody.rotation.copy(avatarRotation)
  transform.rotation.copy(avatarRotation)
}

export const updateLocalAvatarRotation = () => {
  const world = Engine.instance.currentWorld
  const entity = world.localClientEntity
  if (getControlMode() === 'attached') {
    _updateLocalAvatarRotationAttachedMode()
  } else {
    const alpha = 1 - Math.exp(-3 * world.deltaSeconds)
    if (hasComponent(entity, AvatarHeadDecapComponent)) {
      _slerpBodyTowardsCameraDirection(entity, alpha)
    } else {
      _slerpBodyTowardsVelocity(entity, alpha)
    }
  }
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
    const transform = getComponent(entity, TransformComponent)
    updateReferenceSpaceFromAvatarMovement(new Vector3().subVectors(raycastHit.position as Vector3, transform.position))
  } else {
    console.log('invalid position', targetPosition, raycastHit)
  }
}

const _cameraDirection = new Vector3()
const _mat = new Matrix4()

const rotMatrix = new Matrix4()
const targetOrientation = new Quaternion()

const _slerpBodyTowardsCameraDirection = (entity: Entity, alpha: number) => {
  const rigidbody = getComponent(entity, RigidBodyComponent)
  if (!rigidbody) return

  const cameraRotation = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent).rotation
  const direction = _cameraDirection.set(0, 0, 1).applyQuaternion(cameraRotation).setComponent(1, 0)
  targetOrientation.setFromRotationMatrix(_mat.lookAt(V_000, direction, V_010))
  rigidbody.targetKinematicRotation.slerp(targetOrientation, alpha)
}

const _velXZ = new Vector3()
const prevVectors = new Map<Entity, Vector3>()
const _slerpBodyTowardsVelocity = (entity: Entity, alpha: number) => {
  const rigidbody = getComponent(entity, RigidBodyComponent)
  if (!rigidbody) return

  const vector = rigidbody.linearVelocity

  let prevVector = prevVectors.get(entity)!
  if (!prevVector) {
    prevVector = new Vector3(0, 0, 1)
    prevVectors.set(entity, prevVector)
  }

  _velXZ.set(vector.x, 0, vector.z)
  const isZero = _velXZ.distanceTo(V_000) < 0.1
  if (isZero) _velXZ.copy(prevVector)
  if (!isZero) prevVector.copy(_velXZ)

  rotMatrix.lookAt(_velXZ, V_000, V_010)
  targetOrientation.setFromRotationMatrix(rotMatrix)

  rigidbody.targetKinematicRotation.slerp(targetOrientation, alpha)
}
