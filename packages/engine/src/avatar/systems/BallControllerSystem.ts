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

import { QueryFilterFlags, Ray } from '@dimforge/rapier3d-compat'
import {
  defineQuery,
  defineSystem,
  ECSState,
  getAllComponentData,
  getComponent,
  InputSystemGroup
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Quaternion, Vector3 } from 'three'
import { BallControllerComponent } from '../components/BallControllerComponent'

const direction = new Vector3()
const currentVelocity = new Vector3()
const dampedVelocity = new Vector3()
const force = new Vector3()
const cameraDirection = new Vector3()
const cameraForward = new Vector3(0, 0, -1)
const cameraRotation = new Quaternion()

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
      const rayStart = rigidbody.position.clone()
      const rayDir = new Vector3(0, -1, 0)
      const ray = new Ray(rayStart, rayDir)
      const filter = QueryFilterFlags.EXCLUDE_DYNAMIC
      const hit = world.castRay(ray, 0.5, true, filter)
      hit && console.log(getAllComponentData(hit?.collider.entity))
      controller.isGrounded = !!hit
    }

    // Get input direction
    const lateralMovement = (buttons.KeyD?.pressed ? 1 : 0) + (buttons.KeyA?.pressed ? -1 : 0)
    const forwardMovement = (buttons.KeyS?.pressed ? 1 : 0) + (buttons.KeyW?.pressed ? -1 : 0)
    const boost = buttons.ShiftLeft?.pressed

    // Get camera direction
    TransformComponent.back(viewerEntity, cameraDirection)
    cameraDirection.y = 0 // Zero out the y component to keep movement on the horizontal plane
    cameraDirection.normalize()

    // Create rotation quaternion from camera direction
    cameraRotation.setFromUnitVectors(cameraForward, cameraDirection)

    // Calculate movement direction
    direction.set(lateralMovement, 0, forwardMovement)
    if (direction.lengthSq() > 0) {
      direction.normalize()
    }

    // Apply camera rotation to movement direction
    direction.applyQuaternion(cameraRotation)

    // Get current velocity
    currentVelocity.copy(rigidbody.linearVelocity)
    const horizontalSpeed = new Vector3(currentVelocity.x, 0, currentVelocity.z).length()

    const rb = world?.Rigidbodies.get(entity)
    if (!rb) continue

    // Apply damping to linear velocity
    if (controller.linearDamping > 0 && horizontalSpeed > 0.01) {
      // Apply damping only to horizontal movement
      dampedVelocity.set(
        currentVelocity.x * (1 - controller.linearDamping * deltaSeconds),
        currentVelocity.y,
        currentVelocity.z * (1 - controller.linearDamping * deltaSeconds)
      )
      rb.setLinvel(dampedVelocity, true)
    }

    // Apply damping to angular velocity if the ball is rolling too fast
    if (controller.angularDamping > 0) {
      const angularVel = rb.angvel()
      const dampedAngularVel = {
        x: angularVel.x * (1 - controller.angularDamping * deltaSeconds),
        y: angularVel.y * (1 - controller.angularDamping * deltaSeconds),
        z: angularVel.z * (1 - controller.angularDamping * deltaSeconds)
      }
      rb.setAngvel(dampedAngularVel, true)
    }

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
