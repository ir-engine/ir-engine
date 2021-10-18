import { Vector3, Matrix4, Quaternion, Plane, PerspectiveCamera, OrthographicCamera } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarControllerComponent, AvatarControllerComponentType } from '../components/AvatarControllerComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { AvatarSettings } from '../AvatarControllerSystem'
import { Engine } from '../../ecs/classes/Engine'
import { XRInputSourceComponent } from '../components/XRInputSourceComponent'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { World } from '../../ecs/classes/World'

/**
 * @author HydraFire <github.com/HydraFire>
 */

const upVector = new Vector3(0, 1, 0)
const forward = new Vector3(0, 0, 1)

const quat = new Quaternion()
const mat4 = new Matrix4()
const vec3 = new Vector3()

const newVelocity = new Vector3()
const onGroundVelocity = new Vector3()

export const moveAvatar = (world: World, entity: Entity, camera: PerspectiveCamera | OrthographicCamera): void => {
  const {
    fixedDelta,
    physics: { timeScale }
  } = world

  const timeStep = timeScale * fixedDelta

  const avatar = getComponent(entity, AvatarComponent)
  const velocity = getComponent(entity, VelocityComponent)
  const controller = getComponent(entity, AvatarControllerComponent)

  if (!controller.movementEnabled) return

  const onGround = controller.collisions[0] || avatar.isGrounded

  // move vec3 to controller input direction
  vec3.copy(controller.localMovementDirection).multiplyScalar(timeStep)

  // set velocity simulator target to vec3
  controller.velocitySimulator.target.copy(vec3)

  // step the velocity sim
  controller.velocitySimulator.simulate(timeStep * (onGround ? 1 : 0.2))

  // newVelocity = velocity sim position * moveSpeed
  const moveSpeed = controller.isWalking ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed
  newVelocity.copy(controller.velocitySimulator.position).multiplyScalar(moveSpeed)

  // avatar velocity = newVelocity (horizontal plane)
  velocity.velocity.setX(newVelocity.x)
  velocity.velocity.setZ(newVelocity.z)

  // apply gravity to avatar velocity
  velocity.velocity.y -= 0.15 * timeStep

  // threejs camera is weird, when in VR we must use the head diretion
  if (hasComponent(entity, XRInputSourceComponent))
    getComponent(entity, XRInputSourceComponent).head.getWorldDirection(vec3)
  else camera.getWorldDirection(vec3)

  // vec3 holds state of (controller input * timeStep)
  // set y to 0 and normalize horizontal plane
  vec3.setY(0).normalize()

  // forward.z = 1
  // quat = forward w/(controller input * timeStep)
  quat.setFromUnitVectors(forward, vec3)

  // apply quat to avatar velocity (= velocity sim position * moveSpeed)
  newVelocity.applyQuaternion(quat)

  if (onGround) {
    // if we are falling
    if (velocity.velocity.y < 0) {
      // look for something to fall onto
      const raycast = getComponent(entity, RaycastComponent)
      const closestHit = raycast.hits[0]

      // if something was found
      if (closestHit) {
        // groundVelocity = newVelocity (velocity sim w/quat applied)
        // zero out Y - horizontal plane
        onGroundVelocity.copy(newVelocity).setY(0)
        // vec3 = closestHit.normal
        vec3.set(closestHit.normal.x, closestHit.normal.y, closestHit.normal.z)
        // quat = upVector w/closestHit.normal
        quat.setFromUnitVectors(upVector, vec3)
        mat4.makeRotationFromQuaternion(quat)
        onGroundVelocity.applyMatrix4(mat4)
        velocity.velocity.y = onGroundVelocity.y
      }
    }

    if (
      // if controller jump input pressed
      controller.localMovementDirection.y > 0 &&
      // and we are on the ground
      velocity.velocity.y <= onGroundVelocity.y &&
      // and we are not already jumping
      !controller.isJumping
    ) {
      // jump
      velocity.velocity.y = (AvatarSettings.instance.jumpHeight * 1) / 60
      controller.isJumping = true
    } else if (controller.isJumping) {
      // reset isJumping the following frame
      controller.isJumping = false
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

  const target = {
    x: newVelocity.x,
    y: velocity.velocity.y,
    z: newVelocity.z
  }

  const filters = new PhysX.PxControllerFilters(controller.filterData, world.physics.defaultCCTQueryCallback, null!)
  const collisionFlags = controller.controller.move(target, 0.001, timeStep, filters, world.physics.obstacleContext)

  controller.collisions = [
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_DOWN),
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_SIDES),
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_UP)
  ]
}
