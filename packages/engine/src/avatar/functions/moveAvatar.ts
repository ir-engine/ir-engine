import { Vector3, Matrix4, Quaternion, Plane } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { AvatarSettings } from '../AvatarControllerSystem'
import { Engine } from '../../ecs/classes/Engine'
import { XRInputSourceComponent } from '../components/XRInputSourceComponent'
import { useWorld } from '../../ecs/functions/SystemHooks'

/**
 * @author HydraFire <github.com/HydraFire>
 */

const upVector = new Vector3(0, 1, 0)
const quat = new Quaternion()
const mat4 = new Matrix4()
const newVelocity = new Vector3()
const onGroundVelocity = new Vector3()
const vec3 = new Vector3()
const forward = new Vector3(0, 0, 1)
const multiplier = 1 / 60

export const moveAvatar = (entity: Entity, deltaTime: number): void => {
  const avatar = getComponent(entity, AvatarComponent)
  const velocity = getComponent(entity, VelocityComponent)
  const controller = getComponent(entity, AvatarControllerComponent)

  if (!controller.movementEnabled) return

  const onGround = controller.collisions[0] || avatar.isGrounded

  vec3.copy(controller.localMovementDirection).multiplyScalar(multiplier)
  controller.velocitySimulator.target.copy(vec3)
  controller.velocitySimulator.simulate(deltaTime * (onGround ? 1 : 0.2))

  const moveSpeed = controller.isWalking ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed
  newVelocity.copy(controller.velocitySimulator.position).multiplyScalar(moveSpeed)

  velocity.velocity.setX(newVelocity.x)
  velocity.velocity.setZ(newVelocity.z)
  // apply gravity
  velocity.velocity.y -= 0.15 * deltaTime

  // threejs camera is weird, when in VR we must use the head direction
  if (hasComponent(entity, XRInputSourceComponent))
    getComponent(entity, XRInputSourceComponent).head.getWorldDirection(vec3)
  else Engine.camera.getWorldDirection(vec3)

  vec3.setY(0).normalize()
  quat.setFromUnitVectors(forward, vec3)

  velocity.velocity.applyQuaternion(quat)

  if (onGround) {
    const raycast = getComponent(entity, RaycastComponent)
    const closestHit = raycast.hits[0]

    if (closestHit) {
      onGroundVelocity.copy(newVelocity).setY(0)
      vec3.set(closestHit.normal.x, closestHit.normal.y, closestHit.normal.z)
      quat.setFromUnitVectors(upVector, vec3)
      mat4.makeRotationFromQuaternion(quat)
      onGroundVelocity.applyMatrix4(mat4)
    }

    velocity.velocity.y = onGroundVelocity.y

    if (controller.isJumping) {
      controller.isJumping = false
    }

    if (controller.localMovementDirection.y > 0 && !controller.isJumping) {
      velocity.velocity.y = AvatarSettings.instance.jumpHeight * multiplier
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

  const world = useWorld()

  const filters = new PhysX.PxControllerFilters(controller.filterData, world.physics.defaultCCTQueryCallback, null!)
  const collisionFlags = controller.controller.move(
    {
      x: velocity.velocity.x,
      y: velocity.velocity.y,
      z: velocity.velocity.z
    },
    0.001,
    world.fixedDelta,
    filters,
    world.physics.obstacleContext
  )
  controller.collisions = [
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_DOWN),
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_SIDES),
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_UP)
  ]
}
