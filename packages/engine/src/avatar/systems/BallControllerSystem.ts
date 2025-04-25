import { Ray } from '@dimforge/rapier3d-compat'
import { defineQuery, defineSystem, ECSState, getComponent, InputSystemGroup } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Vector3 } from 'three'
import { BallControllerComponent } from '../components/BallControllerComponent'

const direction = new Vector3()
const currentVelocity = new Vector3()
const force = new Vector3()

const ballControlQuery = defineQuery([BallControllerComponent, RigidBodyComponent, TransformComponent])

const execute = () => {
  const deltaSeconds = getState(ECSState).deltaSeconds

  const viewerEntity = getState(ReferenceSpaceState).viewerEntity

  for (const entity of ballControlQuery()) {
    const buttons = InputComponent.getButtons(viewerEntity)
    const controller = getComponent(entity, BallControllerComponent)
    const rigidbody = getComponent(entity, RigidBodyComponent)
    const transform = getComponent(entity, TransformComponent)

    // Check if grounded using a short raycast
    const world = Physics.getWorld(entity)
    if (world) {
      const rayStart = transform.position.clone()
      const rayEnd = rayStart.clone().setY(rayStart.y - 0.1)
      const ray = new Ray(rayStart, rayEnd.sub(rayStart))
      const hit = world.castRay(ray, 0.1, true)
      controller.isGrounded = hit !== null
    }

    // Get input direction
    const lateralMovement = (buttons.KeyD?.pressed ? 1 : 0) + (buttons.KeyA?.pressed ? -1 : 0)
    const forwardMovement = (buttons.KeyS?.pressed ? 1 : 0) + (buttons.KeyW?.pressed ? -1 : 0)
    const boost = buttons.ShiftLeft?.pressed

    // Calculate movement direction
    direction.set(lateralMovement, 0, forwardMovement)
    if (direction.lengthSq() > 0) {
      direction.normalize()
    }

    // Get current velocity
    currentVelocity.copy(rigidbody.linearVelocity)
    const horizontalSpeed = new Vector3(currentVelocity.x, 0, currentVelocity.z).length()

    const rb = world?.Rigidbodies.get(entity)
    if (!rb) continue
    // Apply movement force if under max speed
    if (horizontalSpeed < controller.maxSpeed) {
      const controlMultiplier = controller.isGrounded ? controller.groundControl : controller.airControl
      const speedMultiplier = boost ? controller.boostMultiplier : 1
      force.copy(direction).multiplyScalar(controller.moveSpeed * controlMultiplier * speedMultiplier * deltaSeconds)
      rb.applyImpulse(force, true)
    }

    // Handle jumping
    if (controller.isGrounded && buttons.Space?.pressed) {
      rb.applyImpulse(new Vector3(0, controller.jumpForce, 0), true)
    }
  }
}

export const BallControllerSystem = defineSystem({
  uuid: 'ee.engine.BallControllerSystem',
  insert: { after: InputSystemGroup },
  execute
})
