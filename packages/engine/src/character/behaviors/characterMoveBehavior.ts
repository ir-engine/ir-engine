import { Vector3, Matrix4, Quaternion } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { ControllerColliderComponent } from '../components/ControllerColliderComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../components/XRInputSourceComponent'

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
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
  const transform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any)
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
  if (!collider.controller || !actor.movementEnabled) return

  newVelocity.setScalar(0)
  onGroundVelocity.setScalar(0)

  if (actor.isGrounded) {
    vec3.copy(actor.localMovementDirection).multiplyScalar(deltaTime)
    actor.velocitySimulator.target.copy(vec3)
    actor.velocitySimulator.simulate(deltaTime)

    newVelocity.copy(actor.velocitySimulator.position).multiplyScalar(actor.moveSpeed)

    const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
    if (xrInputSourceComponent) {
      // Apply direction from head look
      xrInputSourceComponent.head.getWorldQuaternion(quat)
      // console.log(xrInputSourceComponent.head.getWorldPosition(new Vector3()), quat);
      newVelocity.applyQuaternion(quat)
    } else {
      // Apply direction from character orientation
      newVelocity.applyQuaternion(transform.rotation)
    }

    if (collider.closestHit) {
      onGroundVelocity.copy(newVelocity).setY(0)
      vec3.set(collider.closestHit.normal.x, collider.closestHit.normal.y, collider.closestHit.normal.z)
      quat.setFromUnitVectors(upVector, vec3)
      mat4.makeRotationFromQuaternion(quat)
      onGroundVelocity.applyMatrix4(mat4)
    }

    collider.controller.velocity.x = newVelocity.x
    collider.controller.velocity.y = onGroundVelocity.y
    collider.controller.velocity.z = newVelocity.z

    if (actor.isJumping) {
      actor.isJumping = false
    }

    if (actor.localMovementDirection.y > 0 && !actor.isJumping) {
      collider.controller.velocity.y = actor.jumpHeight * deltaTime
      actor.isJumping = true
      actor.isGrounded = false
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
  collider.controller.velocity.y -= 0.2 * deltaTime

  // move according to controller's velocity
  collider.controller.delta.x += collider.controller.velocity.x
  collider.controller.delta.y += collider.controller.velocity.y
  collider.controller.delta.z += collider.controller.velocity.z
}
