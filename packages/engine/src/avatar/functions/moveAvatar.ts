import { Collider } from '@dimforge/rapier3d-compat'
import { Matrix4, OrthographicCamera, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { rotate } from '@xrengine/common/src/utils/mathUtils'
import { getState } from '@xrengine/hyperflux'

import { Direction } from '../../common/constants/Axis3D'
import { V_010 } from '../../common/constants/MathConstants'
import checkPositionIsValid from '../../common/functions/checkPositionIsValid'
import { smoothDamp } from '../../common/functions/MathLerpFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../xr/XRComponents'
import { AvatarSettings, rotateBodyTowardsCameraDirection, rotateBodyTowardsVector } from '../AvatarControllerSystem'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarHeadDecapComponent'
import { XRCameraUpdatePendingTagComponent } from '../components/XRCameraUpdatePendingTagComponent'
import { getAvatarBoneWorldPosition } from './avatarFunctions'
import { respawnAvatar } from './respawnAvatar'

const forward = new Vector3(0, 0, 1)

const quat = new Quaternion()
const mat4 = new Matrix4()
const tempVec1 = new Vector3()
const tempVec2 = new Vector3()
const tempVec3 = new Vector3()

const displacement = new Vector3()
export const avatarCameraOffset = new Vector3(0, 0.14, 0.1)
const velocityToSet = new Vector3()

const degrees60 = (60 * Math.PI) / 180

export const moveLocalAvatar = (entity: Entity) => {
  const camera = Engine.instance.currentWorld.camera
  const timeStep = getState(EngineState).fixedDeltaSeconds.value
  const controller = getComponent(entity, AvatarControllerComponent)

  let onGround = false

  const physicsWorld = Engine.instance.currentWorld.physicsWorld
  const collidersInContactWithFeet = [] as Collider[]
  physicsWorld.contactsWith(controller.bodyCollider, (otherCollider) => {
    collidersInContactWithFeet.push(otherCollider)
  })

  for (const otherCollider of collidersInContactWithFeet) {
    physicsWorld.contactPair(controller.bodyCollider, otherCollider, (manifold, flipped) => {
      if (manifold.numContacts() > 0) {
        tempVec1.copy(manifold.normal() as Vector3)
        const angle = tempVec1.angleTo(V_010)
        if (angle < degrees60) onGround = true
      }
    })
  }

  controller.isInAir = !onGround

  const cameraDirection = camera.getWorldDirection(tempVec1).setY(0).normalize()
  const forwardOrientation = quat.setFromUnitVectors(forward, cameraDirection)

  controller.velocitySimulator.target.copy(controller.localMovementDirection)
  controller.velocitySimulator.simulate(timeStep * (onGround ? 1 : 0.2))
  const velocityScale = controller.velocitySimulator.position

  const moveSpeed = controller.isWalking ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed
  controller.currentSpeed = smoothDamp(controller.currentSpeed, moveSpeed, controller.speedVelocity, 0.1, timeStep)

  const prevVelocity = controller.body.linvel()
  const currentVelocity = tempVec1
    .copy(velocityScale)
    .multiplyScalar(controller.currentSpeed)
    .applyQuaternion(forwardOrientation)
    .setComponent(1, prevVelocity.y)

  if (onGround) {
    currentVelocity.y = 0
    if (controller.localMovementDirection.y > 0 && !controller.isJumping) {
      // takeoffVelocity = sqrt(2 * jumpHeight * gravity)
      currentVelocity.y = Math.sqrt(2 * AvatarSettings.instance.jumpHeight * 9.8)
      controller.isJumping = true
    } else if (controller.isJumping) {
      controller.isJumping = false
    }
  } else {
    // apply gravity to avatar velocity
    currentVelocity.y = prevVelocity.y - 9.8 * timeStep
  }

  controller.body.setLinvel(currentVelocity, true)

  if (hasComponent(entity, AvatarHeadDecapComponent)) rotateBodyTowardsCameraDirection(entity)
  else rotateBodyTowardsVector(entity, currentVelocity)

  // TODO: implement scene lower bounds parameter
  if (controller.body.translation().y < -10) respawnAvatar(entity)

  // const cameraPosition = camera.position
  // const avatarPosition = tempVec1
  // getAvatarNeckOffsetPosition(entity, avatarCameraOffset, avatarPosition)

  // avatarPosition.subVectors(cameraPosition, lastCameraPos)
  // lastCameraPos.copy(cameraPosition)

  // const displacement = new Vector3(avatarPosition.x, 0, avatarPosition.z)
  // const dl = displacement.lengthSq()
  // // Limit the distance traveled in a frame
  // if (displacement.lengthSq() > 1.0 || dl <= Number.EPSILON) return

  // const transform = getComponent(entity, TransformComponent)
  // transform.position.copy(controller.controller.translation() as Vector3)
}

/**
 * Rotates the avatar horizontally using HMD rotation
 *
 * @param world
 * @param entity
 * @param camera
 */
export const rotateXRAvatar = (world: World, entity: Entity, camera: PerspectiveCamera | OrthographicCamera) => {
  const avatarTransform = getComponent(entity, TransformComponent)

  const avatarFwd = tempVec1.set(0, 0, 1).applyQuaternion(avatarTransform.rotation).setY(0).normalize()
  const camFwd = tempVec2.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize()

  const angle = Math.acos(avatarFwd.dot(camFwd))
  const clamp = Math.PI * 0.5

  quat.identity()

  if (angle > clamp) {
    const deltaTarget = tempVec3.subVectors(camFwd, avatarFwd)
    // clamp delta target to within the ratio
    deltaTarget.multiplyScalar(clamp / angle)
    // set new target
    deltaTarget.add(avatarFwd).normalize()

    quat.setFromUnitVectors(deltaTarget, camFwd)

    avatarTransform.rotation.premultiply(quat)
  }

  tempVec1.subVectors(avatarTransform.position, camera.position).applyQuaternion(quat).add(camera.position)
  tempVec2.subVectors(tempVec1, avatarTransform.position).setY(0)

  // const displacement = new Vector3(tempVec2.x, 0, tempVec2.z)

  // Rotate around camera
  // moveAvatarController(entity, displacement)
}

const vec3 = new Vector3()

/**
 * Rotates the camera when in XR mode by a given amount
 * @param {Entity} entity
 * @param {number} amount
 */
export const rotateXRCamera = (amount: number) => {
  const cameraParentRotation = Engine.instance.currentWorld.camera.parent?.rotation
  if (cameraParentRotation) {
    vec3.copy(Direction.Up).multiplyScalar(amount)
    const quat = new Quaternion().copy(Engine.instance.currentWorld.camera.parent!.quaternion)
    rotate(quat, vec3.x, vec3.y, vec3.z)
    cameraParentRotation.setFromQuaternion(quat)
  }
}

/**
 * Returns offset position from avatar neck bone
 *
 * @param entity
 * @param offset In, offset from neck
 * @param position Out, offset position
 */
export const getAvatarNeckOffsetPosition = (entity: Entity, offset: Vector3, position: Vector3) => {
  getAvatarBoneWorldPosition(entity, 'Neck', position)
  const avatarTransform = getComponent(entity, TransformComponent)
  tempVec2.copy(offset)
  tempVec2.applyQuaternion(avatarTransform.rotation)
  position.add(tempVec2)
}

/**
 * NOTE: Use this function alongwith XRCameraUpdatePendingTagComponent always
 * Aligns the XR camra position with the avatar's neck
 * Note: There is a delay from when the camera parent's position is set and
 * the camera position is updated
 * @param entity
 * @param camera
 */
export const alignXRCameraPositionWithAvatar = (entity: Entity, camera: PerspectiveCamera | OrthographicCamera) => {
  const cameraContainerPos = camera.parent!.position
  tempVec1.subVectors(cameraContainerPos, camera.position)
  tempVec2.copy(avatarCameraOffset)
  getAvatarNeckOffsetPosition(entity, tempVec2, cameraContainerPos)
  cameraContainerPos.add(tempVec1)
}

/**
 * NOTE: Use this function alongwith XRCameraUpdatePendingTagComponent always
 * Aligns the XR camra rotation with the avatar's forward vector
 * @param entity
 * @param camera
 */
export const alignXRCameraRotationWithAvatar = (entity: Entity, camera: PerspectiveCamera | OrthographicCamera) => {
  const avatarTransform = getComponent(entity, TransformComponent)
  const camParentRot = camera.parent!.quaternion
  tempVec1.set(0, 0, 1).applyQuaternion(Engine.instance.currentWorld.camera.quaternion).setY(0).normalize()
  quat.setFromUnitVectors(tempVec2.set(0, 0, 1), tempVec1).invert()
  tempVec1.set(0, 0, -1).applyQuaternion(avatarTransform.rotation).setY(0).normalize()
  camParentRot.setFromUnitVectors(tempVec2.set(0, 0, 1), tempVec1).multiply(quat)
}

/**
 *
 * @param entity The avatar
 * @param displacement The displacement to apply to the avatar; this value is modified to reflect the actual displacement applied
 */
const moveAvatarController = (entity: Entity, displacement: Vector3) => {
  const controller = getComponent(entity, AvatarControllerComponent)
  const rigidBody = controller.body

  // multiply by reciprocal of delta seconds to move 1 unit per second
  const fixedDelta = getState(EngineState).fixedDeltaSeconds.value
  velocityToSet.copy(displacement).multiplyScalar(1 / fixedDelta)

  // Displacement is calculated using last position because the updated position of rigidbody will show up in next frame
  // since we apply velocity to body and position is updated after physics engine step
  // const currentPosition = rigidBody.translation() as Vector3
  // displacement.copy(currentPosition as Vector3).sub(controller.lastPosition as Vector3)

  // const transform = getComponent(entity, TransformComponent)
  // displacement.applyQuaternion(transform.rotation)

  // controller.lastPosition.copy(currentPosition)
  rigidBody.setLinvel(velocityToSet, true)
}

export const xrCameraNeedsAlignment = (
  entity: Entity,
  camera: PerspectiveCamera | OrthographicCamera,
  thresholdSq: number = 0.1
): boolean => {
  const avatarPosition = tempVec1
  getAvatarNeckOffsetPosition(entity, avatarCameraOffset, avatarPosition)
  return avatarPosition.subVectors(avatarPosition, camera.position).lengthSq() > thresholdSq
}

export const alignXRCameraWithAvatar = (
  entity: Entity,
  camera: PerspectiveCamera | OrthographicCamera,
  lastCameraPos: Vector3
): void => {
  lastCameraPos.subVectors(camera.position, camera.parent!.position)

  // if (!hasComponent(entity, XRCameraUpdatePendingTagComponent)) {
  //   alignXRCameraPositionWithAvatar(entity, camera)
  //   addComponent(entity, XRCameraUpdatePendingTagComponent, {})
  // }

  // Calculate new camera world position
  lastCameraPos.add(camera.parent!.position)
}

/**
 * Moves the avatar using camera displacement
 * @param world
 * @param entity
 * @param camera
 * @param lastCameraPos Out, last frame camera position
 * @returns
 */
export const moveXRAvatar = (
  world: World,
  entity: Entity,
  camera: PerspectiveCamera | OrthographicCamera,
  lastCameraPos: Vector3
): void => {
  const cameraPosition = camera.position
  const avatarPosition = tempVec1
  getAvatarNeckOffsetPosition(entity, avatarCameraOffset, avatarPosition)

  avatarPosition.subVectors(cameraPosition, lastCameraPos)
  lastCameraPos.copy(cameraPosition)

  const displacement = new Vector3(avatarPosition.x, 0, avatarPosition.z)
  const dl = displacement.lengthSq()
  // Limit the distance traveled in a frame
  if (displacement.lengthSq() > 1.0 || dl <= Number.EPSILON) return

  moveAvatarController(entity, displacement)
}

/**
 * Teleports the avatar to new position
 * @param entity
 * @param newPosition
 */
export const teleportAvatar = (entity: Entity, newPosition: Vector3): void => {
  if (!hasComponent(entity, AvatarComponent)) {
    console.warn('Teleport avatar called on non-avatar entity')
    return
  }

  if (checkPositionIsValid(newPosition, false)) {
    const avatar = getComponent(entity, AvatarComponent)
    const controllerComponent = getComponent(entity, AvatarControllerComponent)
    newPosition.y = newPosition.y + avatar.avatarHalfHeight
    controllerComponent.body.setTranslation(newPosition, true)
  } else {
    console.log('invalid position', newPosition)
  }
}
