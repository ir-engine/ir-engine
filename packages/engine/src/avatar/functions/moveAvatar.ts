/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { QueryFilterFlags } from '@dimforge/rapier3d-compat'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { smootheLerpAlpha } from '@etherealengine/common/src/utils/smootheLerpAlpha'
import { getState } from '@etherealengine/hyperflux'

import { ObjectDirection } from '../../common/constants/Axis3D'
import { V_000, V_010 } from '../../common/constants/MathConstants'
import checkPositionIsValid from '../../common/functions/checkPositionIsValid'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentType, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityNetworkState } from '../../networking/state/EntityNetworkState'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeAndUpdateWorldOrigin, updateWorldOrigin } from '../../transform/updateWorldOrigin'
import { XRState, getCameraMode, hasMovementControls } from '../../xr/XRState'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { AvatarMovementSettingsState } from '../state/AvatarMovementSettingsState'
import { AutopilotMarker, clearWalkPoint, scaleFluctuate } from './autopilotFunctions'

const avatarGroundRaycastDistanceIncrease = 0.5
const avatarGroundRaycastDistanceOffset = 1
const avatarGroundRaycastAcceptableDistance = 1.2

/**
 * raycast internals
 */
const avatarGroundRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: ObjectDirection.Down,
  maxDistance: avatarGroundRaycastDistanceOffset + avatarGroundRaycastDistanceIncrease,
  groups: 0
}

const cameraDirection = new Vector3()
const forwardOrientation = new Quaternion()
const targetWorldMovement = new Vector3()
const desiredMovement = new Vector3()
const viewerMovement = new Vector3()
const finalAvatarMovement = new Vector3()
const avatarHeadPosition = new Vector3()

export function updateLocalAvatarPosition(additionalMovement?: Vector3) {
  const entity = Engine.instance.localClientEntity
  const xrFrame = Engine.instance.xrFrame

  if (!entity || (!xrFrame && !additionalMovement)) return

  const xrState = getState(XRState)
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const controller = getComponent(entity, AvatarControllerComponent)
  const avatarHeight = getComponent(entity, AvatarComponent)?.avatarHeight ?? 1.6
  const originTransform = getComponent(Engine.instance.originEntity, TransformComponent)

  desiredMovement.copy(V_000)

  const attached = getCameraMode() === 'attached'
  if (attached) {
    const viewerPose = xrState.viewerPose
    /** move head position forward a bit to not be inside the avatar's body */
    avatarHeadPosition
      .set(0, avatarHeight * 0.95, 0.15)
      .applyQuaternion(rigidbody.targetKinematicRotation)
      .add(rigidbody.targetKinematicPosition)
    viewerPose &&
      viewerMovement
        .copy(viewerPose.transform.position as any)
        .applyMatrix4(originTransform.matrix)
        .sub(avatarHeadPosition)
    // vertical viewer movement should only apply updward movement to the rigidbody,
    // when the viewerpose is moving up over the current avatar head position
    viewerMovement.y = 0 // Math.max(viewerMovement.y, 0)
    desiredMovement.copy(viewerMovement)
    // desiredMovement.y = 0 // Math.max(desiredMovement.y, 0)
  } else {
    viewerMovement.copy(V_000)
  }

  if (!hasMovementControls()) {
    rigidbody.targetKinematicPosition.copy(rigidbody.position).add(desiredMovement)
    updateLocalAvatarPositionAttachedMode()
    return
  }

  if (controller.movementEnabled && additionalMovement) desiredMovement.add(additionalMovement)

  const avatarCollisionGroups = controller.bodyCollider.collisionGroups() & ~CollisionGroups.Trigger

  controller.controller.computeColliderMovement(
    controller.bodyCollider,
    desiredMovement,
    QueryFilterFlags.EXCLUDE_SENSORS,
    avatarCollisionGroups
  )

  const computedMovement = controller.controller.computedMovement() as Vector3
  if (desiredMovement.y === 0) computedMovement.y = 0

  rigidbody.targetKinematicPosition.copy(rigidbody.position).add(computedMovement)

  // const grounded = controller.controller.computedGrounded()
  /** rapier's computed movement is a bit bugged, so do a small raycast at the avatar's feet to snap it to the ground if it's close enough */
  avatarGroundRaycast.origin.copy(rigidbody.targetKinematicPosition)
  avatarGroundRaycast.groups = avatarCollisionGroups
  avatarGroundRaycast.origin.y += avatarGroundRaycastDistanceOffset
  const groundHits = Physics.castRay(Engine.instance.physicsWorld, avatarGroundRaycast)
  controller.isInAir = true

  if (groundHits.length) {
    const hit = groundHits[0]
    const controllerOffset = controller.controller.offset()
    // controller.isInAir = !grounded
    controller.isInAir = hit.distance > 1 + controllerOffset * 10
    if (!controller.isInAir) rigidbody.targetKinematicPosition.y = hit.position.y + controllerOffset
    if (hit.distance <= avatarGroundRaycastAcceptableDistance) {
      if (attached) originTransform.position.y = hit.position.y
      /** @todo after a physical jump, only apply viewer vertical movement once the user is back on the virtual ground */
    }
  }

  if (!controller.isInAir) controller.verticalVelocity = 0

  if (attached) updateReferenceSpaceFromAvatarMovement(finalAvatarMovement.subVectors(computedMovement, viewerMovement))
}

export const updateReferenceSpaceFromAvatarMovement = (movement: Vector3) => {
  const originTransform = getComponent(Engine.instance.originEntity, TransformComponent)
  originTransform.position.add(movement)
  computeAndUpdateWorldOrigin()
  updateLocalAvatarPositionAttachedMode()
}

const _additionalMovement = new Vector3()

/**
 * Avatar movement via click/pointer position
 */

const minimumDistanceSquared = 0.5 * 0.5
const walkPoint = new Vector3()

const currentDirection = new Vector3()
export const applyAutopilotInput = (entity: Entity) => {
  const deltaSeconds = getState(EngineState).simulationTimestep / 1000

  const markerState = getState(AutopilotMarker)

  const controller = getComponent(entity, AvatarControllerComponent)

  if (!controller || !markerState.walkTarget) return

  if (controller.gamepadLocalInput.lengthSq() > 0 || controller.isJumping || controller.isInAir) {
    clearWalkPoint()
    currentDirection.set(0, 0, 0)
    return
  }

  scaleFluctuate()

  const avatarPos = getComponent(entity, TransformComponent).position
  walkPoint.copy(markerState.walkTarget)
  const moveDirection = walkPoint.sub(avatarPos)
  const distanceSquared = moveDirection.lengthSq()
  const avatarMovementSettings = getState(AvatarMovementSettingsState)
  const legSpeed = controller.isWalking ? avatarMovementSettings.walkSpeed : avatarMovementSettings.runSpeed
  const yDirectionMultiplier = 1.25
  moveDirection
    .normalize()
    .multiplyScalar(deltaSeconds * legSpeed)
    .setY(moveDirection.y * yDirectionMultiplier)

  const lerpSpeed = 10
  currentDirection.lerp(moveDirection, deltaSeconds * lerpSpeed)

  if (distanceSquared > minimumDistanceSquared) updateLocalAvatarPosition(currentDirection)
  else {
    clearWalkPoint()
    currentDirection.set(0, 0, 0)
  }
}

/**
 * Avatar movement via gamepad
 */

export const applyGamepadInput = (entity: Entity) => {
  if (!entity) return

  const camera = Engine.instance.camera
  const deltaSeconds = getState(EngineState).simulationTimestep / 1000
  const controller = getComponent(entity, AvatarControllerComponent)

  const avatarMovementSettings = getState(AvatarMovementSettingsState)
  const legSpeed = controller.isWalking ? avatarMovementSettings.walkSpeed : avatarMovementSettings.runSpeed
  camera.getWorldDirection(cameraDirection).setY(0).normalize()
  forwardOrientation.setFromUnitVectors(ObjectDirection.Forward, cameraDirection)

  targetWorldMovement
    .copy(controller.gamepadLocalInput)
    .multiplyScalar(legSpeed * deltaSeconds)
    .applyQuaternion(forwardOrientation)

  // movement in the world XZ plane
  controller.gamepadWorldMovement.lerp(targetWorldMovement, 5 * deltaSeconds)

  // set vertical velocity on ground
  applyVerticalVelocity(controller, avatarMovementSettings)

  // apply gamepad movement and gravity
  if (controller.movementEnabled) controller.verticalVelocity -= 9.81 * deltaSeconds
  const verticalMovement = controller.verticalVelocity * deltaSeconds
  _additionalMovement.set(
    controller.gamepadWorldMovement.x,
    controller.isInAir || verticalMovement > 0 ? verticalMovement : 0,
    controller.gamepadWorldMovement.z
  )

  updateLocalAvatarPosition(_additionalMovement)
}

const applyVerticalVelocity = (
  controller: ComponentType<typeof AvatarControllerComponent>,
  avatarMovementSettings: typeof AvatarMovementSettingsState._TYPE
) => {
  if (!controller.isInAir) {
    controller.verticalVelocity = 0
    if (controller.gamepadJumpActive) {
      if (!controller.isJumping) {
        // Formula: takeoffVelocity = sqrt(2 * jumpHeight * gravity)
        controller.verticalVelocity = Math.sqrt(2 * avatarMovementSettings.jumpHeight * 9.81)
        controller.isJumping = true
      }
    } else if (controller.isJumping) {
      controller.isJumping = false
    }
  } else {
    controller.isJumping = false
  }
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

const desiredAvatarMatrix = new Matrix4()
const originRelativeToAvatarMatrix = new Matrix4()

/**
 * Translates and rotates the avatar and reference space
 * @param entity
 * @param translation
 * @param rotation
 */
export const translateAndRotateAvatar = (entity: Entity, translation: Vector3, rotation: Quaternion) => {
  const rigidBody = getComponent(entity, RigidBodyComponent)
  rigidBody.targetKinematicPosition.add(translation)
  rigidBody.targetKinematicRotation.multiply(rotation)

  if (getCameraMode() === 'attached') {
    const avatarTransform = getComponent(entity, TransformComponent)
    const originTransform = getComponent(Engine.instance.originEntity, TransformComponent)

    originRelativeToAvatarMatrix.multiplyMatrices(avatarTransform.matrixInverse, originTransform.matrix)
    desiredAvatarMatrix.compose(
      rigidBody.targetKinematicPosition,
      rigidBody.targetKinematicRotation,
      avatarTransform.scale
    )
    originTransform.matrix.multiplyMatrices(desiredAvatarMatrix, originRelativeToAvatarMatrix)
    originTransform.matrix.decompose(originTransform.position, originTransform.rotation, originTransform.scale)
    originTransform.matrixInverse.copy(originTransform.matrix).invert()

    updateWorldOrigin()
  }
}

export const updateLocalAvatarPositionAttachedMode = () => {
  const entity = Engine.instance.localClientEntity
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
  const entity = Engine.instance.localClientEntity
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  const viewerPose = getState(XRState).viewerPose

  if (!viewerPose) return

  const originTransform = getComponent(Engine.instance.originEntity, TransformComponent)
  const viewerOrientation = viewerPose.transform.orientation
  viewerQuat
    .set(viewerOrientation.x, viewerOrientation.y, viewerOrientation.z, viewerOrientation.w)
    .premultiply(originTransform.rotation)
  // const avatarRotation = extractRotationAboutAxis(viewerQuat, V_010, _quat)
  avatarRotationAroundY.setFromQuaternion(viewerQuat, 'YXZ')
  avatarRotation.setFromAxisAngle(V_010, avatarRotationAroundY.y + Math.PI)

  // for immersive and attached avatars, we don't want to interpolate the rigidbody in the transform system, so set
  // previous and current rotation to the target rotation
  rigidbody.targetKinematicRotation.copy(avatarRotation)
  rigidbody.previousRotation.copy(avatarRotation)
  rigidbody.rotation.copy(avatarRotation)
  transform.rotation.copy(avatarRotation)
}

export const updateLocalAvatarRotation = () => {
  const entity = Engine.instance.localClientEntity
  if (getCameraMode() === 'attached') {
    _updateLocalAvatarRotationAttachedMode()
  } else {
    const alpha = smootheLerpAlpha(3, Engine.instance.deltaSeconds)
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
export const teleportAvatar = (entity: Entity, targetPosition: Vector3, force = false): void => {
  if (!hasComponent(entity, AvatarComponent)) {
    console.warn('Teleport avatar called on non-avatar entity')
    return
  }

  const raycastOrigin = targetPosition.clone()
  raycastOrigin.y += 0.1
  const { raycastHit } = checkPositionIsValid(raycastOrigin, false)

  if (raycastHit || force) {
    const transform = getComponent(entity, TransformComponent)
    const rigidbody = getComponent(entity, RigidBodyComponent)
    const newPosition = raycastHit ? (raycastHit.position as Vector3) : targetPosition
    rigidbody.targetKinematicPosition.copy(newPosition)
    rigidbody.position.copy(newPosition)
    const attached = getCameraMode() === 'attached'
    if (attached) updateReferenceSpaceFromAvatarMovement(new Vector3().subVectors(newPosition, transform.position))
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

  const cameraRotation = getComponent(Engine.instance.cameraEntity, TransformComponent).rotation
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
    prevVector = new Vector3(0, 0, 1).applyQuaternion(
      getState(EntityNetworkState)[getComponent(entity, UUIDComponent)].spawnRotation
    )
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
