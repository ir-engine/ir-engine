import { Collider } from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { ObjectDirection } from '../../common/constants/Axis3D'
import { V_010 } from '../../common/constants/MathConstants'
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
import { AvatarSettings, rotateBodyTowardsCameraDirection, rotateBodyTowardsVector } from '../AvatarControllerSystem'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { AvatarTeleportComponent } from '../components/AvatarTeleportComponent'
import { AvatarInputSettingsState, AvatarMovementScheme } from '../state/AvatarInputSettingsState'
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

/**
 * Updates the avatar's isInAir property based on current physics contacts points
 * @param entity
 */
export const updateAvatarControllerOnGround = (entity: Entity) => {
  const controller = getComponent(entity, AvatarControllerComponent) as ComponentType<typeof AvatarControllerComponent>

  /**
   * Use physics contacts to detemine if avatar is grounded
   */
  const physicsWorld = Engine.instance.currentWorld.physicsWorld
  const collidersInContactWithFeet = [] as Collider[]
  physicsWorld.contactsWith(controller.bodyCollider, (otherCollider) => {
    if (otherCollider) collidersInContactWithFeet.push(otherCollider)
  })

  let onGround = false

  for (const otherCollider of collidersInContactWithFeet) {
    physicsWorld.contactPair(controller.bodyCollider, otherCollider, (manifold, flipped) => {
      console.log(manifold)
      if (manifold.numContacts() > 0) {
        _vec.copy(manifold.normal() as Vector3)
        if (!flipped) _vec.normalize().negate()
        const angle = _vec.angleTo(V_010)
        if (angle < stepAngle) onGround = true
      }
    })
    if (onGround) break
  }

  controller.isInAir = !onGround
}

//   const avatarInputState = getState(AvatarInputSettingsState)
//   /** teleport controls handled in AvatarInputSchema */
//   if (getControlMode() === 'attached' && avatarInputState.controlScheme.value === AvatarMovementScheme.Teleport) return

//   moveAvatar(entity)
// }

/**
 * Rotates the avatar
 * - if we are in attached mode, we dont need to do any extra rotation
 *     as this is done via the webxr camera automatically
 */
export const avatarApplyRotation = (entity: Entity) => {
  const isInVR = getControlMode() === 'attached'
  if (!isInVR) {
    if (hasComponent(entity, AvatarHeadDecapComponent)) {
      rotateBodyTowardsCameraDirection(entity)
    } else {
      rotateBodyTowardsVector(entity, getComponent(entity, RigidBodyComponent).linearVelocity)
    }
  }
}

const cameraDirection = new Vector3()
const forwardOrientation = new Quaternion()

/**
 * Avatar movement via velocity spring and collider velocity
 */
export const calculateAvatarDisplacementFromGamepad = (
  world: World,
  entity: Entity,
  outDisplacement: Vector3,
  isJumping: boolean
) => {
  const camera = world.camera
  camera.getWorldDirection(cameraDirection).setY(0).normalize()
  forwardOrientation.setFromUnitVectors(ObjectDirection.Forward, cameraDirection)

  const controller = getComponent(entity, AvatarControllerComponent)
  const isInVR = getControlMode() === 'attached'

  const deltaSeconds = world.deltaSeconds

  // always walk in VR
  const currentSpeed =
    controller.isWalking || isInVR ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed

  /** Multiple spring scale by speed and apply forward orientation */
  outDisplacement
    .copy(controller.gamepadMovementSmoothed)
    .multiplyScalar(currentSpeed * deltaSeconds)
    .applyQuaternion(forwardOrientation)

  if (!controller.isInAir) {
    controller.gamepadYVelocity = 0
    if (isJumping && !controller.isJumping) {
      // Formula: takeoffVelocity = sqrt(2 * jumpHeight * gravity)
      controller.gamepadYVelocity = Math.sqrt(2 * AvatarSettings.instance.jumpHeight * 9.81)
      controller.isJumping = true
    } else if (controller.isJumping) {
      controller.isJumping = false
    }
  } else {
    controller.gamepadYVelocity -= 9.81 * deltaSeconds
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
