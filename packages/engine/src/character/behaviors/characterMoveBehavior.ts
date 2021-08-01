import { Vector3, Matrix4, Quaternion } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { ControllerColliderComponent } from '../components/ControllerColliderComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../components/XRInputSourceComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

const upVector = new Vector3(0, 1, 0)
const quat = new Quaternion()
const mat4 = new Matrix4()
const newVelocity = new Vector3()
const onGroundVelocity = new Vector3()
const vec3 = new Vector3()

export const characterMoveBehavior = (entity: Entity, deltaTime): void => {
  const actor = getMutableComponent(entity, CharacterComponent)
  const velocity = getMutableComponent(entity, VelocityComponent)
  const transform = getMutableComponent(entity, TransformComponent)
  const controller = getMutableComponent(entity, ControllerColliderComponent)
  if (!controller.controller || !actor.movementEnabled) return

  if (actor.isGrounded) {
    vec3.copy(actor.localMovementDirection).multiplyScalar(deltaTime)
    actor.velocitySimulator.target.copy(vec3)
    actor.velocitySimulator.simulate(deltaTime)

    newVelocity.copy(actor.velocitySimulator.position).multiplyScalar(actor.moveSpeed)

    const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
    if (xrInputSourceComponent) {
      // if in VR follow look direction
      xrInputSourceComponent.head.getWorldQuaternion(quat)
      newVelocity.applyQuaternion(quat)
    } else {
      // otherwise ppply direction from character orientation
      newVelocity.applyQuaternion(transform.rotation)
    }

    const raycast = getMutableComponent(entity, RaycastComponent)
    const closestHit = raycast.raycastQuery.hits[0]

    if (closestHit) {
      onGroundVelocity.copy(newVelocity).setY(0)
      vec3.set(closestHit.normal.x, closestHit.normal.y, closestHit.normal.z)
      quat.setFromUnitVectors(upVector, vec3)
      mat4.makeRotationFromQuaternion(quat)
      onGroundVelocity.applyMatrix4(mat4)
    }

    controller.controller.velocity.x = newVelocity.x
    controller.controller.velocity.y = onGroundVelocity.y
    controller.controller.velocity.z = newVelocity.z

    if (actor.isJumping) {
      actor.isJumping = false
    }

    if (actor.localMovementDirection.y > 0 && !actor.isJumping) {
      controller.controller.velocity.y = actor.jumpHeight * deltaTime
      actor.isJumping = true
    }

    // TODO: make a proper resizing function if we ever need it
    //  collider.controller.resize(actor.BODY_SIZE);

    // TODO - Move on top of moving objects
    // physx has a feature for this, we should integrate both
    // if (actor.rayResult.body.mass > 0) {
    // 	const pointVelocity = new Vector3();
    // 	actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, pointVelocity);
    // 	newVelocity.add(threeFromCannonVector(pointVelocity));
    // }
  }

  // apply gravity
  controller.controller.velocity.y -= 0.2 * deltaTime
  velocity.velocity.copy(controller.controller.velocity)

  // move according to controller's velocity
  controller.controller.delta.x += controller.controller.velocity.x
  controller.controller.delta.y += controller.controller.velocity.y
  controller.controller.delta.z += controller.controller.velocity.z
}
