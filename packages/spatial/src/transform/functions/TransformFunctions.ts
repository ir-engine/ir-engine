import { Entity, getComponent, getOptionalComponent } from '@etherealengine/ecs'
import { V_000 } from '../../common/constants/MathConstants'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import { EntityTreeComponent } from '../components/EntityTree'
import { TransformComponent, composeMatrix } from '../components/TransformComponent'

export const computeTransformMatrix = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  updateTransformFromComputedTransform(entity)
  composeMatrix(entity)
  const entityTree = getOptionalComponent(entity, EntityTreeComponent)
  const parentEntity = entityTree?.parentEntity
  if (parentEntity) {
    const parentTransform = getOptionalComponent(parentEntity, TransformComponent)
    if (parentTransform) transform.matrixWorld.multiplyMatrices(parentTransform.matrixWorld, transform.matrix)
  } else {
    transform.matrixWorld.copy(transform.matrix)
  }
}

export const teleportRigidbody = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  const rigidBody = getComponent(entity, RigidBodyComponent)
  if (!rigidBody.body) return
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
  if (!rigidbody.body) return
  rigidbody.body.setTranslation(rigidbody.position, true)
  rigidbody.body.setRotation(rigidbody.rotation, true)
  rigidbody.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  rigidbody.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
}

const updateTransformFromComputedTransform = (entity: Entity) => {
  const computedTransform = getOptionalComponent(entity, ComputedTransformComponent)
  if (!computedTransform) return
  computedTransform.computeFunction(entity, computedTransform.referenceEntity)
}
