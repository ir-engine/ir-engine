/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { UUIDComponent } from '@ir-engine/ecs'
import { ComponentType, getComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { dispatchAction, getState } from '@ir-engine/hyperflux'
import { NetworkObjectAuthorityTag } from '@ir-engine/network'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { ObjectDirection, Vector3_Up, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { smootheLerpAlpha } from '@ir-engine/spatial/src/common/functions/MathLerpFunctions'
import checkPositionIsValid from '@ir-engine/spatial/src/common/functions/checkPositionIsValid'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@ir-engine/spatial/src/physics/functions/getInteractionGroups'
import { SceneQueryType } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { computeAndUpdateWorldOrigin, updateWorldOrigin } from '@ir-engine/spatial/src/transform/updateWorldOrigin'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { SpawnPoseState } from '@ir-engine/spatial/src/transform/SpawnPoseState'
import { preloadedAnimations } from '../animation/Util'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarColliderComponent, AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { AvatarMovementSettingsState } from '../state/AvatarMovementSettingsState'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { AutopilotMarker, clearWalkPoint, scaleFluctuate } from './autopilotFunctions'

const avatarGroundRaycastDistanceIncrease = 0.5
const avatarGroundRaycastDistanceOffset = 1
const avatarGroundRaycastAcceptableDistance = 1.05

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
const computedMovement = new Vector3()
let beganFalling = false

export function moveAvatar(entity: Entity, additionalMovement?: Vector3) {
  const xrFrame = getState(XRState).xrFrame

  if (!entity || (!xrFrame && !additionalMovement)) return

  const colliderEntity = getComponent(entity, AvatarColliderComponent).colliderEntity
  const bodyCollider = getComponent(colliderEntity, ColliderComponent)

  const xrState = getState(XRState)
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const controller = getComponent(entity, AvatarControllerComponent)
  const eyeHeight = getComponent(entity, AvatarComponent).eyeHeight
  const originTransform = getComponent(Engine.instance.localFloorEntity, TransformComponent)
  desiredMovement.copy(Vector3_Zero)

  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar
  const isMovementControlsEnabled = XRState.isMovementControlsEnabled

  if (isCameraAttachedToAvatar) {
    const viewerPose = xrState.viewerPose
    /** move head position forward a bit to not be inside the avatar's body */
    avatarHeadPosition
      .set(0, eyeHeight, 0.25)
      .applyQuaternion(rigidbody.targetKinematicRotation)
      .add(rigidbody.targetKinematicPosition)
    viewerPose &&
      viewerMovement
        .copy(viewerPose.transform.position as any)
        .multiplyScalar(1 / XRState.worldScale)
        .applyMatrix4(originTransform.matrix)
        .sub(avatarHeadPosition)
    // vertical viewer movement should only apply updward movement to the rigidbody,
    // when the viewerpose is moving up over the current avatar head position
    viewerMovement.y = 0 // Math.max(viewerMovement.y, 0)
    desiredMovement.copy(viewerMovement)
    // desiredMovement.y = 0 // Math.max(desiredMovement.y, 0)
  } else {
    viewerMovement.copy(Vector3_Zero)
  }

  const isMovementCaptured = controller.movementCaptured.length
  const isAuthorityPeer = hasComponent(entity, NetworkObjectAuthorityTag)
  const world = Physics.getWorld(entity)

  if (!isMovementControlsEnabled || isMovementCaptured || !isAuthorityPeer || !world) {
    rigidbody.targetKinematicPosition.copy(rigidbody.position).add(desiredMovement)
    updateLocalAvatarPosition(entity)
    return
  }

  if (additionalMovement) desiredMovement.add(additionalMovement)

  const avatarCollisionGroups = getInteractionGroups(
    bodyCollider.collisionLayer,
    bodyCollider.collisionMask & ~CollisionGroups.Trigger
  )

  Physics.computeColliderMovement(world, entity, colliderEntity, desiredMovement, avatarCollisionGroups)
  Physics.getComputedMovement(world, entity, computedMovement)

  if (desiredMovement.y === 0) computedMovement.y = 0

  rigidbody.targetKinematicPosition.copy(rigidbody.position).add(computedMovement)

  // const grounded = controller.controller.computedGrounded()
  /** rapier's computed movement is a bit bugged, so do a small raycast at the avatar's feet to snap it to the ground if it's close enough */
  avatarGroundRaycast.origin.copy(rigidbody.targetKinematicPosition)
  avatarGroundRaycast.groups = avatarCollisionGroups
  avatarGroundRaycast.origin.y += avatarGroundRaycastDistanceOffset
  const groundHits = Physics.castRay(world, avatarGroundRaycast)
  controller.isInAir = true

  if (groundHits.length) {
    const hit = groundHits[0]
    const controllerOffset = Physics.getControllerOffset(world, entity)
    controller.isInAir = hit.distance > avatarGroundRaycastDistanceOffset + controllerOffset * 10 // todo - 10 is way too big, should be 1, but this makes you fall down stairs

    if (!controller.isInAir) rigidbody.targetKinematicPosition.y = hit.position.y + controllerOffset
    if (controller.isInAir && !beganFalling) {
      dispatchAction(
        AvatarNetworkAction.setAnimationState({
          animationAsset: preloadedAnimations.locomotion,
          clipName: 'Fall',
          loop: true,
          layer: 1,
          entityUUID: getComponent(entity, UUIDComponent)
        })
      )
      beganFalling = true
    }
    if (hit.distance <= avatarGroundRaycastAcceptableDistance) {
      if (beganFalling) {
        dispatchAction(
          AvatarNetworkAction.setAnimationState({
            animationAsset: preloadedAnimations.locomotion,
            clipName: 'Fall',
            loop: true,
            layer: 1,
            needsSkip: true,
            entityUUID: getComponent(entity, UUIDComponent)
          })
        )
      }
      beganFalling = false
      if (isCameraAttachedToAvatar) originTransform.position.y = hit.position.y
      /** @todo after a physical jump, only apply viewer vertical movement once the user is back on the virtual ground */
    }
  }

  if (!controller.isInAir) controller.verticalVelocity = 0

  if (isCameraAttachedToAvatar)
    updateReferenceSpaceFromAvatarMovement(entity, finalAvatarMovement.subVectors(computedMovement, viewerMovement))
  else updateLocalAvatarPosition(entity)
}

export const updateReferenceSpaceFromAvatarMovement = (entity: Entity, movement: Vector3) => {
  const originTransform = getComponent(Engine.instance.localFloorEntity, TransformComponent)
  originTransform.position.add(movement)
  computeAndUpdateWorldOrigin()
  updateLocalAvatarPosition(entity)
}

const _additionalMovement = new Vector3()

/**
 * Avatar movement via click/pointer position
 */

const minimumDistanceSquared = 0.5 * 0.5
const walkPoint = new Vector3()

const currentDirection = new Vector3()
export const applyAutopilotInput = (entity: Entity) => {
  const deltaSeconds = getState(ECSState).simulationTimestep / 1000

  const markerState = getState(AutopilotMarker)

  const controller = getOptionalComponent(entity, AvatarControllerComponent)

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

  if (distanceSquared > minimumDistanceSquared) moveAvatar(entity, currentDirection)
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

  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  const deltaSeconds = getState(ECSState).simulationTimestep / 1000
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
  /**
   * @todo this is for suspending the avatar in the air while traversing through a portal.
   * rather than capturing movement here, we need another way of preventing gravity but allowing XR locomotion
   */
  if (!controller.movementCaptured.length) controller.verticalVelocity -= 9.81 * deltaSeconds
  const verticalMovement = controller.verticalVelocity * deltaSeconds
  _additionalMovement.set(
    controller.gamepadWorldMovement.x,
    controller.isInAir || verticalMovement > 0 ? verticalMovement : 0,
    controller.gamepadWorldMovement.z
  )

  moveAvatar(entity, _additionalMovement)
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

  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar
  if (isCameraAttachedToAvatar) {
    const avatarTransform = getComponent(entity, TransformComponent)
    const originTransform = getComponent(Engine.instance.localFloorEntity, TransformComponent)

    originRelativeToAvatarMatrix.copy(avatarTransform.matrix).invert().multiply(originTransform.matrix)
    desiredAvatarMatrix.compose(
      rigidBody.targetKinematicPosition,
      rigidBody.targetKinematicRotation,
      avatarTransform.scale
    )
    originTransform.matrix.multiplyMatrices(desiredAvatarMatrix, originRelativeToAvatarMatrix)
    originTransform.matrix.decompose(originTransform.position, originTransform.rotation, originTransform.scale)
    updateWorldOrigin()
  }

  rotationNeedsUpdate = true
}

export const updateLocalAvatarPosition = (entity: Entity) => {
  const world = Physics.getWorld(entity)
  if (!world) return

  const rigidbody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)

  // for immersive and attached avatars, we don't want to interpolate the rigidbody in the transform system, so set
  // previous and current position to the target position

  rigidbody.previousPosition.copy(rigidbody.targetKinematicPosition)
  rigidbody.position.copy(rigidbody.targetKinematicPosition)
  transform.position.copy(rigidbody.targetKinematicPosition)
  Physics.setKinematicRigidbodyPose(world, entity, rigidbody.targetKinematicPosition, rigidbody.rotation)
  delete TransformComponent.dirtyTransforms[entity]
}

const viewerQuat = new Quaternion()
const avatarRotationAroundY = new Euler()
const avatarRotation = new Quaternion()
let rotationNeedsUpdate = false

const _updateLocalAvatarRotationAttachedMode = (entity: Entity) => {
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const viewerPose = getState(XRState).viewerPose
  const transform = getComponent(entity, TransformComponent)

  if (!viewerPose) return

  const originTransform = getComponent(Engine.instance.localFloorEntity, TransformComponent)
  const viewerOrientation = viewerPose.transform.orientation

  //if angle between rigidbody forward and viewer forward is greater than 15 degrees, rotate rigidbody to viewer forward
  viewerQuat
    .set(viewerOrientation.x, viewerOrientation.y, viewerOrientation.z, viewerOrientation.w)
    .premultiply(originTransform.rotation)
  const viewerForward = new Vector3(0, 0, 1).applyQuaternion(viewerQuat as any).setY(0)
  const rigidbodyForward = new Vector3(0, 0, -1).applyQuaternion(rigidbody.targetKinematicRotation).setY(0)
  const angle = viewerForward.angleTo(rigidbodyForward)

  if (angle > Math.PI / 12 || rotationNeedsUpdate == true) {
    // const avatarRotation = extractRotationAboutAxis(viewerQuat, V_010, _quat)
    avatarRotationAroundY.setFromQuaternion(viewerQuat, 'YXZ')
    avatarRotation.setFromAxisAngle(Vector3_Up, avatarRotationAroundY.y + Math.PI)
    rotationNeedsUpdate = false
  }
  // for immersive and attached avatars, we don't want to interpolate the rigidbody in the transform system, so set
  // previous and current rotation to the target rotation
  transform.rotation.slerp(avatarRotation, 5 * getState(ECSState).deltaSeconds)
}

export const updateLocalAvatarRotation = (entity: Entity) => {
  if (XRState.isCameraAttachedToAvatar) {
    _updateLocalAvatarRotationAttachedMode(entity)
  } else {
    const deltaSeconds = getState(ECSState).deltaSeconds
    const alpha = smootheLerpAlpha(0.005, deltaSeconds)
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
  const physicsWorld = Physics.getWorld(entity)
  if (!physicsWorld) return

  const { raycastHit } = checkPositionIsValid(physicsWorld, raycastOrigin, false)

  if (raycastHit || force) {
    const transform = getComponent(entity, TransformComponent)
    const rigidbody = getComponent(entity, RigidBodyComponent)
    const newPosition = raycastHit ? (raycastHit.position as Vector3) : targetPosition
    rigidbody.targetKinematicPosition.copy(newPosition)
    rigidbody.position.copy(newPosition)
    const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar
    if (isCameraAttachedToAvatar)
      updateReferenceSpaceFromAvatarMovement(entity, new Vector3().subVectors(newPosition, transform.position))
  } else {
    // console.log('invalid position', targetPosition, raycastHit)
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
  targetOrientation.setFromRotationMatrix(_mat.lookAt(Vector3_Zero, direction, Vector3_Up))
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
      getState(SpawnPoseState)[getComponent(entity, UUIDComponent)].spawnRotation
    )
    prevVectors.set(entity, prevVector)
  }

  _velXZ.set(vector.x, 0, vector.z)
  const isZero = _velXZ.distanceTo(Vector3_Zero) < 0.1
  if (isZero) _velXZ.copy(prevVector)
  if (!isZero) prevVector.copy(_velXZ)

  rotMatrix.lookAt(_velXZ, Vector3_Zero, Vector3_Up)
  targetOrientation.setFromRotationMatrix(rotMatrix)

  rigidbody.targetKinematicRotation.slerp(targetOrientation, alpha)
}
