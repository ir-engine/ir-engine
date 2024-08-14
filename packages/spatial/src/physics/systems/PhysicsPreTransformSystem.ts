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

import { Matrix4, Quaternion, Vector3 } from 'three'

import { defineQuery, defineSystem, Entity, getComponent } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { getState } from '@etherealengine/hyperflux'

import { Vector3_One, Vector3_Zero } from '../../common/constants/MathConstants'
import { EntityTreeComponent, getAncestorWithComponent, iterateEntityNode } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeTransformMatrix, isDirty, TransformDirtyUpdateSystem } from '../../transform/systems/TransformSystem'
import { Physics } from '../classes/Physics'
import { ColliderComponent } from '../components/ColliderComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'

const localMatrix = new Matrix4()
const parentMatrixInverse = new Matrix4()
const position = new Vector3()
const rotation = new Quaternion()
const scale = new Vector3()
const mat4 = new Matrix4()

const setDirty = (entity: Entity) => (TransformComponent.dirtyTransforms[entity] = true)

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

  position.x = positionX * alpha + previousPositionX * (1 - alpha)
  position.y = positionY * alpha + previousPositionY * (1 - alpha)
  position.z = positionZ * alpha + previousPositionZ * (1 - alpha)
  rotation.x = rotationX * alpha + previousRotationX * (1 - alpha)
  rotation.y = rotationY * alpha + previousRotationY * (1 - alpha)
  rotation.z = rotationZ * alpha + previousRotationZ * (1 - alpha)
  rotation.w = rotationW * alpha + previousRotationW * (1 - alpha)

  const transform = getComponent(entity, TransformComponent)

  const rigidBodyEntity = getAncestorWithComponent(entity, RigidBodyComponent)
  const rigidBodyTransform = getComponent(rigidBodyEntity, TransformComponent)
  parentMatrixInverse.copy(rigidBodyTransform.matrixWorld).invert()
  localMatrix.compose(position, rotation, Vector3_One).premultiply(parentMatrixInverse)
  localMatrix.decompose(position, rotation, scale)
  transform.matrix.compose(position, rotation, transform.scale)
  transform.matrixWorld.multiplyMatrices(rigidBodyTransform.matrixWorld, transform.matrix)

  /** set all children dirty deeply, but set this entity to clean */
  iterateEntityNode(entity, setDirty)
  TransformComponent.dirtyTransforms[entity] = false
}

export const copyTransformToRigidBody = (entity: Entity) => {
  const world = Physics.getWorld(entity)
  if (!world) return

  // if the entity has a parent, we need to use the scene space
  computeTransformMatrix(entity)
  TransformComponent.getMatrixRelativeToScene(entity, mat4)
  mat4.decompose(position, rotation, scale)

  RigidBodyComponent.position.x[entity] =
    RigidBodyComponent.previousPosition.x[entity] =
    RigidBodyComponent.targetKinematicPosition.x[entity] =
      position.x
  RigidBodyComponent.position.y[entity] =
    RigidBodyComponent.previousPosition.y[entity] =
    RigidBodyComponent.targetKinematicPosition.y[entity] =
      position.y
  RigidBodyComponent.position.z[entity] =
    RigidBodyComponent.previousPosition.z[entity] =
    RigidBodyComponent.targetKinematicPosition.z[entity] =
      position.z
  RigidBodyComponent.rotation.x[entity] =
    RigidBodyComponent.previousRotation.x[entity] =
    RigidBodyComponent.targetKinematicRotation.x[entity] =
      rotation.x
  RigidBodyComponent.rotation.y[entity] =
    RigidBodyComponent.previousRotation.y[entity] =
    RigidBodyComponent.targetKinematicRotation.y[entity] =
      rotation.y
  RigidBodyComponent.rotation.z[entity] =
    RigidBodyComponent.previousRotation.z[entity] =
    RigidBodyComponent.targetKinematicRotation.z[entity] =
      rotation.z
  RigidBodyComponent.rotation.w[entity] =
    RigidBodyComponent.previousRotation.w[entity] =
    RigidBodyComponent.targetKinematicRotation.w[entity] =
      rotation.w

  const rigidbody = getComponent(entity, RigidBodyComponent)
  Physics.setRigidbodyPose(world, entity, rigidbody.position, rigidbody.rotation, Vector3_Zero, Vector3_Zero)

  /** set all children dirty deeply, but set this entity to clean */
  iterateEntityNode(entity, setDirty)
  TransformComponent.dirtyTransforms[entity] = false
}

const copyTransformToCollider = (entity: Entity) => {
  const world = Physics.getWorld(entity)
  if (!world) return
  computeTransformMatrix(entity)
  const rigidbodyEntity = getAncestorWithComponent(entity, RigidBodyComponent)
  if (!rigidbodyEntity) return
  const colliderDesc = Physics.createColliderDesc(world, entity, rigidbodyEntity)
  if (!colliderDesc) return
  Physics.removeCollider(world, entity)
  Physics.attachCollider(world, colliderDesc, rigidbodyEntity, entity)
}

const rigidbodyQuery = defineQuery([TransformComponent, RigidBodyComponent, EntityTreeComponent])
const colliderQuery = defineQuery([TransformComponent, ColliderComponent, EntityTreeComponent]) // @todo maybe add Not(RigidBodyComponent) to this query

const filterAwakeCleanRigidbodies = (entity: Entity) => {
  // if the entity has a parent that is dirty, we need to update the transform
  const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
  if (TransformComponent.dirtyTransforms[parentEntity]) return true
  // if the entity is dirty, we don't need to update the transform
  if (isDirty(entity)) return false
  const world = Physics.getWorld(entity)
  if (!world) return false
  // if the entity is not dirty, we only need to update the transform if it is awake
  return !Physics.isSleeping(world, entity)
}

export const execute = () => {
  const ecsState = getState(ECSState)

  /** Update entity transforms */
  const allRigidbodyEntities = rigidbodyQuery()
  const dirtyRigidbodyEntities = allRigidbodyEntities.filter(isDirty)
  const dirtyColliderEntities = colliderQuery().filter(isDirty)

  /** Ff rigidbody transforms have been dirtied, teleport the rigidbody to the transform */
  for (const entity of dirtyRigidbodyEntities) copyTransformToRigidBody(entity)

  /** Ff collider transforms have been dirtied, update them */
  for (const entity of dirtyColliderEntities) copyTransformToCollider(entity)

  /** Lerp awake clean rigidbody entities (and make their transforms dirty) */
  const simulationRemainder = ecsState.frameTime - ecsState.simulationTime
  const alpha = Math.min(simulationRemainder / ecsState.simulationTimestep, 1)

  const awakeCleanRigidbodyEntities = allRigidbodyEntities.filter(filterAwakeCleanRigidbodies)
  for (const entity of awakeCleanRigidbodyEntities) lerpTransformFromRigidbody(entity, alpha)
}

export const PhysicsPreTransformSystem = defineSystem({
  uuid: 'ee.engine.PhysicsPreTransformSystem',
  insert: { after: TransformDirtyUpdateSystem },
  execute
})
