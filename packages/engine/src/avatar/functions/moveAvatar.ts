import { Vector3, Matrix4, Quaternion } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { AvatarSettings } from '../AvatarControllerSystem'
import { Engine } from '../../ecs/classes/Engine'
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
const multiplier = 1 / 60

export const moveAvatar = (entity: Entity, deltaTime): void => {
  const avatar = getComponent(entity, AvatarComponent)
  const velocity = getComponent(entity, VelocityComponent)
  const controller = getComponent(entity, AvatarControllerComponent)

  if (!controller.movementEnabled) return

  vec3.copy(controller.localMovementDirection).multiplyScalar(multiplier)
  controller.velocitySimulator.target.copy(vec3)
  controller.velocitySimulator.simulate(deltaTime * (avatar.isGrounded ? 1 : 0.5))

  const moveSpeed = controller.isWalking ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed
  newVelocity.copy(controller.velocitySimulator.position).multiplyScalar(moveSpeed)
  velocity.velocity.copy(newVelocity)

  quat.copy(Engine.camera.quaternion)

  // threejs camera is weird, when not in VR we have to invert the direction
  if (!hasComponent(entity, XRInputSourceComponent)) newVelocity.multiplyScalar(-1)

  newVelocity.applyQuaternion(quat)

  controller.controller.velocity.x = newVelocity.x
  controller.controller.velocity.z = newVelocity.z

  if (avatar.isGrounded) {
    const raycast = getComponent(entity, RaycastComponent)
    const closestHit = raycast.raycastQuery.hits[0]

    if (closestHit) {
      onGroundVelocity.copy(newVelocity).setY(0)
      vec3.set(closestHit.normal.x, closestHit.normal.y, closestHit.normal.z)
      quat.setFromUnitVectors(upVector, vec3)
      mat4.makeRotationFromQuaternion(quat)
      onGroundVelocity.applyMatrix4(mat4)
    }

    controller.controller.velocity.y = onGroundVelocity.y

    if (controller.isJumping) {
      controller.isJumping = false
    }

    if (controller.localMovementDirection.y > 0 && !controller.isJumping) {
      controller.controller.velocity.y = AvatarSettings.instance.jumpHeight * multiplier
      controller.isJumping = true
    }

    // TODO: make a proper resizing function if we ever need it
    //  collider.controller.resize(avatar.BODY_SIZE);

    // TODO - Move on top of moving objects
    // physx has a feature for this, we should integrate both
    // if (avatar.rayResult.body.mass > 0) {
    // 	const pointVelocity = new Vector3();
    // 	avatar.rayResult.body.getVelocityAtWorldPoint(avatar.rayResult.hitPointWorld, pointVelocity);
    // 	newVelocity.add(threeFromCannonVector(pointVelocity));
    // }
  }

  // apply gravity
  controller.controller.velocity.y -= 0.2 * deltaTime

  // move according to controller's velocity
  controller.controller.delta.x += controller.controller.velocity.x
  controller.controller.delta.y += controller.controller.velocity.y
  controller.controller.delta.z += controller.controller.velocity.z
}
