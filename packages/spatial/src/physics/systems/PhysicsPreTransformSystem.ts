/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Entity, defineQuery, defineSystem, getComponent } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { getState } from '@etherealengine/hyperflux'
import { Not } from 'bitecs'
import { TransformComponent, TransformSystem } from '../../SpatialModule'
import { V_000 } from '../../common/constants/MathConstants'
import { isDirty } from '../../transform/systems/TransformSystem'
import {
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  RigidBodyFixedTagComponent
} from '../components/RigidBodyComponent'

export const teleportRigidbody = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const isAwake = !rigidBody.body.isSleeping()
  rigidBody.body.setTranslation(transform.position, isAwake)
  rigidBody.body.setRotation(transform.rotation, isAwake)
  rigidBody.body.setLinvel(V_000, isAwake)
  rigidBody.body.setAngvel(V_000, isAwake)
  rigidBody.previousPosition.copy(transform.position)
  rigidBody.position.copy(transform.position)
  rigidBody.previousRotation.copy(transform.rotation)
  rigidBody.rotation.copy(transform.rotation)
}

export const lerpTransformFromRigidbody = (entity: Entity, alpha: number) => {
  /*
  Interpolate the remaining time after the fixed pipeline is complete.
  See https://gafferongames.com/post/fix_your_timestep/#the-final-touch
  */

  const previousPositionX = RigidBodyComponent.previousPosition.x[entity]
  const previousPositionY = RigidBodyComponent.previousPosition.y[entity]
  const previousPositionZ = RigidBodyComponent.previousPosition.z[entity]
  const previousRotationX = RigidBodyComponent.previousRotation.x[entity]
  const previousRotationY = RigidBodyComponent.previousRotation.y[entity]
  const previousRotationZ = RigidBodyComponent.previousRotation.z[entity]
  const previousRotationW = RigidBodyComponent.previousRotation.w[entity]

  const positionX = RigidBodyComponent.position.x[entity]
  const positionY = RigidBodyComponent.position.y[entity]
  const positionZ = RigidBodyComponent.position.z[entity]
  const rotationX = RigidBodyComponent.rotation.x[entity]
  const rotationY = RigidBodyComponent.rotation.y[entity]
  const rotationZ = RigidBodyComponent.rotation.z[entity]
  const rotationW = RigidBodyComponent.rotation.w[entity]

  TransformComponent.position.x[entity] = positionX * alpha + previousPositionX * (1 - alpha)
  TransformComponent.position.y[entity] = positionY * alpha + previousPositionY * (1 - alpha)
  TransformComponent.position.z[entity] = positionZ * alpha + previousPositionZ * (1 - alpha)
  TransformComponent.rotation.x[entity] = rotationX * alpha + previousRotationX * (1 - alpha)
  TransformComponent.rotation.y[entity] = rotationY * alpha + previousRotationY * (1 - alpha)
  TransformComponent.rotation.z[entity] = rotationZ * alpha + previousRotationZ * (1 - alpha)
  TransformComponent.rotation.w[entity] = rotationW * alpha + previousRotationW * (1 - alpha)

  TransformComponent.dirtyTransforms[entity] = true
}

export const copyTransformToRigidBody = (entity: Entity) => {
  RigidBodyComponent.position.x[entity] =
    RigidBodyComponent.previousPosition.x[entity] =
    RigidBodyComponent.targetKinematicPosition.x[entity] =
      TransformComponent.position.x[entity]
  RigidBodyComponent.position.y[entity] =
    RigidBodyComponent.previousPosition.y[entity] =
    RigidBodyComponent.targetKinematicPosition.y[entity] =
      TransformComponent.position.y[entity]
  RigidBodyComponent.position.z[entity] =
    RigidBodyComponent.previousPosition.z[entity] =
    RigidBodyComponent.targetKinematicPosition.z[entity] =
      TransformComponent.position.z[entity]
  RigidBodyComponent.rotation.x[entity] =
    RigidBodyComponent.previousRotation.x[entity] =
    RigidBodyComponent.targetKinematicRotation.x[entity] =
      TransformComponent.rotation.x[entity]
  RigidBodyComponent.rotation.y[entity] =
    RigidBodyComponent.previousRotation.y[entity] =
    RigidBodyComponent.targetKinematicRotation.y[entity] =
      TransformComponent.rotation.y[entity]
  RigidBodyComponent.rotation.z[entity] =
    RigidBodyComponent.previousRotation.z[entity] =
    RigidBodyComponent.targetKinematicRotation.z[entity] =
      TransformComponent.rotation.z[entity]
  RigidBodyComponent.rotation.w[entity] =
    RigidBodyComponent.previousRotation.w[entity] =
    RigidBodyComponent.targetKinematicRotation.w[entity] =
      TransformComponent.rotation.w[entity]
  const rigidbody = getComponent(entity, RigidBodyComponent)
  rigidbody.body.setTranslation(rigidbody.position, true)
  rigidbody.body.setRotation(rigidbody.rotation, true)
  rigidbody.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  rigidbody.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
}

const rigidbodyQuery = defineQuery([TransformComponent, RigidBodyComponent])
const kinematicRigidbodyQuery = defineQuery([
  TransformComponent,
  RigidBodyComponent,
  Not(RigidBodyFixedTagComponent),
  Not(RigidBodyDynamicTagComponent)
])

const filterAwakeCleanRigidbodies = (entity: Entity) =>
  !getComponent(entity, RigidBodyComponent).body.isSleeping() && !isDirty(entity)

export const execute = () => {
  const ecsState = getState(ECSState)

  /**
   * Update entity transforms
   */
  const allRigidbodyEntities = rigidbodyQuery()
  const kinematicRigidbodyEntities = kinematicRigidbodyQuery()
  const awakeCleanRigidbodyEntities = allRigidbodyEntities.filter(filterAwakeCleanRigidbodies)
  const dirtyKinematicRigidbodyEntities = kinematicRigidbodyEntities.filter(isDirty)
  // const dirtyRigidbodyEntities = allRigidbodyEntities.filter(isDirty)

  // if rigidbody transforms have been dirtied, teleport the rigidbody to the transform
  for (const entity of dirtyKinematicRigidbodyEntities) copyTransformToRigidBody(entity)

  // lerp awake clean rigidbody entities (and make their transforms dirty)
  const simulationRemainder = ecsState.frameTime - ecsState.simulationTime
  const alpha = Math.min(simulationRemainder / ecsState.simulationTimestep, 1)
  for (const entity of awakeCleanRigidbodyEntities) lerpTransformFromRigidbody(entity, alpha)
}

export const PhysicsPreTransformSystem = defineSystem({
  uuid: 'ee.engine.PhysicsPreTransformSystem',
  insert: { before: TransformSystem },
  execute
})
