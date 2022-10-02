import { Collider } from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { AvatarDirection } from '../../common/constants/Axis3D'
import { V_010 } from '../../common/constants/MathConstants'
import checkPositionIsValid from '../../common/functions/checkPositionIsValid'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarMovementScheme } from '../../input/enums/InputEnums'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getControlMode, XRState } from '../../xr/XRState'
import { AvatarSettings, rotateBodyTowardsCameraDirection, rotateBodyTowardsVector } from '../AvatarControllerSystem'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarHeadDecapComponent'
import { AvatarTeleportTagComponent } from '../components/AvatarTeleportTagComponent'
import { AvatarInputSettingsState } from '../state/AvatarInputSettingsState'
import { avatarRadius } from './createAvatar'

const _vec3 = new Vector3()
const _quat = new Quaternion()
const _quat2 = new Quaternion()
const quat180y = new Quaternion().setFromAxisAngle(V_010, Math.PI)

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
  direction: AvatarDirection.Down,
  maxDistance: stepHeight,
  groups: getInteractionGroups(CollisionGroups.Avatars, CollisionGroups.Ground)
}

/**
 * moves the avatar according to physics contacts, velocity, gravity and step testing
 * @param entity
 */
export const moveLocalAvatar = (entity: Entity) => {
  const controller = getComponent(entity, AvatarControllerComponent)

  let onGround = false

  /**
   * Use physics contacts to detemine if avatar is grounded
   */
  const physicsWorld = Engine.instance.currentWorld.physicsWorld
  const collidersInContactWithFeet = [] as Collider[]
  physicsWorld.contactsWith(controller.bodyCollider, (otherCollider) => {
    if (otherCollider) collidersInContactWithFeet.push(otherCollider)
  })

  for (const otherCollider of collidersInContactWithFeet) {
    physicsWorld.contactPair(controller.bodyCollider, otherCollider, (manifold, flipped) => {
      if (manifold.numContacts() > 0) {
        _vec3.copy(manifold.normal() as Vector3)
        if (!flipped) _vec3.normalize().negate()
        const angle = _vec3.angleTo(V_010)
        if (angle < stepAngle) onGround = true
      }
    })
    if (onGround) break
  }

  controller.isInAir = !onGround

  const avatarInputState = getState(AvatarInputSettingsState)
  if (avatarInputState.controlScheme.value === AvatarMovementScheme.Teleport) moveAvatarWithTeleport(entity)
  else moveAvatarWithVelocity(entity)
}

/**
 * Moves the avatar with velocity controls
 * @param entity
 */
export const moveAvatarWithVelocity = (entity: Entity) => {
  const camera = Engine.instance.currentWorld.camera
  const timeStep = getState(EngineState).fixedDeltaSeconds.value

  const rigidBody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  const isInVR = getControlMode() === 'attached'

  const rigidbody = getComponent(entity, RigidBodyComponent)
  const controller = getComponent(entity, AvatarControllerComponent)

  /**
   * Do movement via velocity spring and collider velocity
   */
  const cameraDirection = camera.getWorldDirection(_vec3).setY(0).normalize()
  const forwardOrientation = _quat.setFromUnitVectors(AvatarDirection.Forward, cameraDirection)

  controller.velocitySimulator.target.copy(controller.localMovementDirection)
  controller.velocitySimulator.simulate(timeStep * (controller.isInAir ? 0.2 : 1))
  const velocitySpringDirection = controller.velocitySimulator.position

  // always walk in VR
  controller.currentSpeed =
    controller.isWalking || isInVR ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed

  const prevVelocity = rigidBody.body.linvel()
  const currentVelocity = _vec3
    .copy(velocitySpringDirection)
    .multiplyScalar(controller.currentSpeed)
    .applyQuaternion(forwardOrientation)
    .setComponent(1, prevVelocity.y)

  if (controller.isInAir) {
    // apply gravity to avatar velocity
    currentVelocity.y = prevVelocity.y - 9.81 * timeStep
  } else {
    currentVelocity.y = 0
    if (controller.localMovementDirection.y > 0 && !controller.isJumping) {
      // Formula: takeoffVelocity = sqrt(2 * jumpHeight * gravity)
      currentVelocity.y = Math.sqrt(2 * AvatarSettings.instance.jumpHeight * 9.81)
      controller.isJumping = true
    } else if (controller.isJumping) {
      controller.isJumping = false
    }
  }

  rigidbody.body.setLinvel(currentVelocity, true)

  /**
   * Do rotation
   * - if we are in attached mode, we dont need to do any extra rotation
   *     as this is done via the webxr camera automatically
   */
  if (!isInVR) {
    if (hasComponent(entity, AvatarHeadDecapComponent)) {
      rotateBodyTowardsCameraDirection(entity)
    } else {
      rotateBodyTowardsVector(entity, getComponent(entity, VelocityComponent).linear)
    }
  }

  /**
   * Step over small obstacles
   */
  const xzVelocity = _vec3.copy(velocitySpringDirection).setY(0)
  const xzVelocitySqrMagnitude = xzVelocity.lengthSq()
  if (xzVelocitySqrMagnitude > minimumStepSpeed) {
    // TODO this can be improved by using a shapeCast with a plane instead of a line
    // set the raycast position to the egde of the bottom of the cylindical portion of the capsule collider in the direction of motion
    avatarStepRaycast.origin
      .copy(transform.position)
      .add(xzVelocity.normalize().multiplyScalar(expandedAvatarRadius).applyQuaternion(forwardOrientation))
    avatarStepRaycast.origin.y += stepLowerBound + stepHeight

    const hits = Physics.castRay(Engine.instance.currentWorld.physicsWorld, avatarStepRaycast)
    if (hits.length && hits[0].collider !== controller.bodyCollider) {
      _vec3.copy(hits[0].normal as Vector3)
      const angle = _vec3.angleTo(V_010)
      if (angle < stepAngle) {
        const pos = rigidbody.body.translation()
        pos.y += stepHeight - hits[0].distance
        rigidbody.body.setTranslation(pos, true)
      }
    }
  }
}
/**
 * Moves the avatar with teleport controls
 * @param entity
 */
export const moveAvatarWithTeleport = (entity: Entity) => {
  const controller = getComponent(entity, AvatarControllerComponent)
  if (controller.localMovementDirection.z < -0.75 && !hasComponent(entity, AvatarTeleportTagComponent)) {
    addComponent(entity, AvatarTeleportTagComponent, true)
  } else if (controller.localMovementDirection.z === 0.0) {
    removeComponent(entity, AvatarTeleportTagComponent)
  }
}

const quat = new Quaternion()
/**
 * Updates the WebXR reference space, effectively moving the world to be in alignment with where the viewer should be seeing it.
 * @param entity
 */
export const updateReferenceSpace = (entity: Entity) => {
  const refSpace = getState(XRState).originReferenceSpace.value
  if (getControlMode() === 'attached' && refSpace) {
    const avatarTransform = getComponent(entity, TransformComponent)
    // rotate 180 degrees as physics looks down +z, and webxr looks down -z
    quat.copy(avatarTransform.rotation).multiply(quat180y)
    const xrRigidTransform = new XRRigidTransform(avatarTransform.position, quat)
    const offsetRefSpace = refSpace.getOffsetReferenceSpace(xrRigidTransform.inverse)
    EngineRenderer.instance.xrManager.setReferenceSpace(offsetRefSpace)
  }
}

/**
 * Rotates the avatar's rigidbody around the Y axis by a given entity
 * @param entity
 * @param angle
 */
export const rotateAvatar = (entity: Entity, angle: number) => {
  _quat.setFromAxisAngle(V_010, angle)
  const rigidBody = getComponent(entity, RigidBodyComponent).body
  _quat2.copy(rigidBody.rotation() as Quaternion).multiply(_quat)
  rigidBody.setRotation(_quat2, true)
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

  const newPosition = targetPosition.clone()

  if (checkPositionIsValid(newPosition, false)) {
    const avatar = getComponent(entity, AvatarComponent)
    newPosition.y += avatar.avatarHalfHeight
    const rigidbody = getComponent(entity, RigidBodyComponent)
    rigidbody.body.setTranslation(newPosition, true)
  } else {
    console.log('invalid position', newPosition)
  }
}
