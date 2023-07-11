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

import { Not } from 'bitecs'
import { useEffect } from 'react'
import { Camera, Frustum, Matrix4, Mesh, Skeleton, SkinnedMesh, Vector3 } from 'three'

import { insertionSort } from '@etherealengine/common/src/utils/insertionSort'
import { defineActionQueue, getMutableState, getState, none, removeActionQueue } from '@etherealengine/hyperflux'

import { V_000 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { BoundingBoxComponent, BoundingBoxDynamicTag } from '../../interaction/components/BoundingBoxComponents'
import { NetworkState } from '../../networking/NetworkState'
import {
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  RigidBodyFixedTagComponent,
  RigidBodyKinematicPositionBasedTagComponent,
  RigidBodyKinematicVelocityBasedTagComponent
} from '../../physics/components/RigidBodyComponent'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import {
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent,
  FrustumCullCameraComponent
} from '../components/DistanceComponents'
import { LocalTransformComponent, TransformComponent } from '../components/TransformComponent'
import { TransformSerialization } from '../TransformSerialization'

const transformQuery = defineQuery([TransformComponent])
const nonDynamicLocalTransformQuery = defineQuery([
  LocalTransformComponent,
  Not(RigidBodyDynamicTagComponent),
  Not(RigidBodyKinematicPositionBasedTagComponent),
  Not(RigidBodyKinematicVelocityBasedTagComponent)
])
const rigidbodyTransformQuery = defineQuery([TransformComponent, RigidBodyComponent])
const fixedRigidBodyQuery = defineQuery([TransformComponent, RigidBodyComponent, RigidBodyFixedTagComponent])
const groupQuery = defineQuery([GroupComponent, TransformComponent])

const staticBoundingBoxQuery = defineQuery([GroupComponent, BoundingBoxComponent])
const dynamicBoundingBoxQuery = defineQuery([GroupComponent, BoundingBoxComponent, BoundingBoxDynamicTag])

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])
const distanceFromCameraQuery = defineQuery([TransformComponent, DistanceFromCameraComponent])
const frustumCulledQuery = defineQuery([TransformComponent, FrustumCullCameraComponent])

export const computeLocalTransformMatrix = (entity: Entity) => {
  const localTransform = getComponent(entity, LocalTransformComponent)
  localTransform.matrix.compose(localTransform.position, localTransform.rotation, localTransform.scale)
}

export const computeTransformMatrix = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  updateTransformFromComputedTransform(entity)
  updateTransformFromLocalTransform(entity)
  transform.matrix.compose(transform.position, transform.rotation, transform.scale)
  transform.matrixInverse.copy(transform.matrix).invert()
}

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
  RigidBodyComponent.position.x[entity] = TransformComponent.position.x[entity]
  RigidBodyComponent.position.y[entity] = TransformComponent.position.y[entity]
  RigidBodyComponent.position.z[entity] = TransformComponent.position.z[entity]
  RigidBodyComponent.rotation.x[entity] = TransformComponent.rotation.x[entity]
  RigidBodyComponent.rotation.y[entity] = TransformComponent.rotation.y[entity]
  RigidBodyComponent.rotation.z[entity] = TransformComponent.rotation.z[entity]
  RigidBodyComponent.rotation.w[entity] = TransformComponent.rotation.w[entity]
  const rigidbody = getComponent(entity, RigidBodyComponent)
  rigidbody.body.setTranslation(rigidbody.position, false)
  rigidbody.body.setRotation(rigidbody.rotation, false)
}

const updateTransformFromLocalTransform = (entity: Entity) => {
  const localTransform = getOptionalComponent(entity, LocalTransformComponent)
  const isRigidbody =
    hasComponent(entity, RigidBodyDynamicTagComponent) ||
    hasComponent(entity, RigidBodyKinematicPositionBasedTagComponent) ||
    hasComponent(entity, RigidBodyKinematicVelocityBasedTagComponent)
  const parentTransform = localTransform?.parentEntity
    ? getOptionalComponent(localTransform.parentEntity, TransformComponent)
    : undefined
  if (!localTransform || !parentTransform || isRigidbody) return false
  const transform = getComponent(entity, TransformComponent)
  transform.matrix.multiplyMatrices(parentTransform.matrix, localTransform.matrix)
  transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
  return true
}

const updateTransformFromComputedTransform = (entity: Entity) => {
  const computedTransform = getOptionalComponent(entity, ComputedTransformComponent)
  if (!computedTransform) return false
  computedTransform.computeFunction(entity, computedTransform.referenceEntity)
  return true
}

export const updateGroupChildren = (entity: Entity) => {
  const group = getComponent(entity, GroupComponent) as any as (Mesh & Camera)[]
  // drop down one level and update children
  for (const root of group) {
    for (const obj of root.children) {
      obj.updateMatrixWorld()
      obj.matrixWorldNeedsUpdate = false
    }
  }
}

const getDistanceSquaredFromTarget = (entity: Entity, targetPosition: Vector3) => {
  return getComponent(entity, TransformComponent).position.distanceToSquared(targetPosition)
}

const _frustum = new Frustum()
const _projScreenMatrix = new Matrix4()

/** @deprecated */
const modifyPropertyActionQueue = defineActionQueue(EngineActions.sceneObjectUpdate.matches)

const originChildEntities = new Set<Entity>()

/** get list of entities that are children of the world origin */
const updateOriginChildEntities = (entity: Entity) => {
  const referenceEntity = getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntity
  const parentEntity = getOptionalComponent(entity, LocalTransformComponent)?.parentEntity

  if (referenceEntity && (originChildEntities.has(referenceEntity) || referenceEntity === Engine.instance.originEntity))
    originChildEntities.add(referenceEntity)
  if (parentEntity && (originChildEntities.has(parentEntity) || parentEntity === Engine.instance.originEntity))
    originChildEntities.add(parentEntity)
}

const transformDepths = new Map<Entity, number>()

const updateTransformDepth = (entity: Entity) => {
  if (transformDepths.has(entity)) return transformDepths.get(entity)

  const referenceEntity = getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntity
  const parentEntity = getOptionalComponent(entity, LocalTransformComponent)?.parentEntity

  const referenceEntityDepth = referenceEntity ? updateTransformDepth(referenceEntity) : 0
  const parentEntityDepth = parentEntity ? updateTransformDepth(parentEntity) : 0
  const depth = Math.max(referenceEntityDepth, parentEntityDepth) + 1
  transformDepths.set(entity, depth)

  return depth
}

const compareReferenceDepth = (a: Entity, b: Entity) => {
  const aDepth = transformDepths.get(a)!
  const bDepth = transformDepths.get(b)!
  return aDepth - bDepth
}

const traverseComputeBoundingBox = (mesh: Mesh) => {
  if (mesh.isMesh) mesh.geometry.computeBoundingBox()
}

const computeBoundingBox = (entity: Entity) => {
  const box = getComponent(entity, BoundingBoxComponent).box
  const group = getComponent(entity, GroupComponent)

  box.makeEmpty()

  for (const obj of group) {
    obj.traverse(traverseComputeBoundingBox)
    box.expandByObject(obj)
  }
}

const updateBoundingBox = (entity: Entity) => {
  const box = getComponent(entity, BoundingBoxComponent).box
  const group = getComponent(entity, GroupComponent)
  box.makeEmpty()
  for (const obj of group) box.expandByObject(obj)
}

const isDirty = (entity: Entity) => TransformComponent.dirtyTransforms[entity]
const isDirtyNonKinematic = (entity: Entity) =>
  TransformComponent.dirtyTransforms[entity] &&
  !hasComponent(entity, RigidBodyKinematicPositionBasedTagComponent) &&
  !hasComponent(entity, RigidBodyKinematicVelocityBasedTagComponent)

const filterAwakeRigidbodies = (entity: Entity) => !getComponent(entity, RigidBodyComponent).body.isSleeping()

const filterSleepingRigidbodies = (entity: Entity) => getComponent(entity, RigidBodyComponent).body.isSleeping()

let sortedTransformEntities = [] as Entity[]

/** override Skeleton.update, as it is called inside  */
const skeletonUpdate = Skeleton.prototype.update

function noop() {}

function iterateSkeletons(skinnedMesh: SkinnedMesh) {
  if (skinnedMesh.isSkinnedMesh) {
    skinnedMesh.skeleton.update()
  }
}

const execute = () => {
  const { localClientEntity } = Engine.instance
  // TODO: move entity tree mutation logic here for more deterministic and less redundant calculations

  // if transform order is dirty, sort by reference depth
  // Note: cyclic references will cause undefined behavior

  /**
   * Sort transforms if needed
   */
  const engineState = getState(EngineState)
  const xrFrame = Engine.instance.xrFrame

  let needsSorting = engineState.transformsNeedSorting

  for (const entity of transformQuery.enter()) {
    sortedTransformEntities.push(entity)
    needsSorting = true
  }

  for (const entity of transformQuery.exit()) {
    const idx = sortedTransformEntities.indexOf(entity)
    idx > -1 && sortedTransformEntities.splice(idx, 1)
    needsSorting = true
  }

  if (needsSorting) {
    transformDepths.clear()
    for (const entity of sortedTransformEntities) updateTransformDepth(entity)
    for (const entity of sortedTransformEntities) updateOriginChildEntities(entity)
    insertionSort(sortedTransformEntities, compareReferenceDepth) // Insertion sort is speedy O(n) for mostly sorted arrays
    getMutableState(EngineState).transformsNeedSorting.set(false)
  }

  /**
   * Update entity transforms
   */
  const allRigidbodyEntities = rigidbodyTransformQuery()
  const awakeRigidbodyEntities = allRigidbodyEntities.filter(filterAwakeRigidbodies)

  // lerp awake rigidbody entities (and make their transforms dirty)
  const simulationRemainder = engineState.frameTime - engineState.simulationTime
  const alpha = Math.min(simulationRemainder / engineState.simulationTimestep, 1)
  for (const entity of awakeRigidbodyEntities) lerpTransformFromRigidbody(entity, alpha)

  // entities with dirty parent or reference entities, or computed transforms, should also be dirty
  for (const entity of transformQuery()) {
    const makeDirty =
      TransformComponent.dirtyTransforms[entity] ||
      TransformComponent.dirtyTransforms[getOptionalComponent(entity, LocalTransformComponent)?.parentEntity ?? -1] ||
      TransformComponent.dirtyTransforms[
        getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntity ?? -1
      ] ||
      hasComponent(entity, ComputedTransformComponent)
    TransformComponent.dirtyTransforms[entity] = makeDirty
  }

  const dirtyNonDynamicLocalTransformEntities = nonDynamicLocalTransformQuery().filter(isDirty)
  const dirtySortedTransformEntities = sortedTransformEntities.filter(isDirty)
  const dirtyGroupEntities = groupQuery().filter(isDirty)
  const dirtyFixedRigidbodyEntities = fixedRigidBodyQuery().filter(isDirty)

  for (const entity of dirtyNonDynamicLocalTransformEntities) computeLocalTransformMatrix(entity)
  for (const entity of dirtySortedTransformEntities) computeTransformMatrix(entity)

  for (const entity of dirtyFixedRigidbodyEntities) copyTransformToRigidBody(entity)
  for (const entity of dirtyGroupEntities) updateGroupChildren(entity)

  if (!xrFrame) {
    const camera = Engine.instance.camera
    const viewCamera = camera.cameras[0]
    viewCamera.matrixWorld.copy(camera.matrixWorld)
    viewCamera.matrixWorldInverse.copy(camera.matrixWorldInverse)
    viewCamera.projectionMatrix.copy(camera.projectionMatrix)
    viewCamera.projectionMatrixInverse.copy(camera.projectionMatrixInverse)
  }

  for (const entity in TransformComponent.dirtyTransforms) TransformComponent.dirtyTransforms[entity] = false

  for (const entity of staticBoundingBoxQuery.enter()) computeBoundingBox(entity)
  for (const entity of dynamicBoundingBoxQuery()) updateBoundingBox(entity)

  /** @todo - refactor */
  for (const action of modifyPropertyActionQueue()) {
    for (const entity of action.entities) {
      if (
        hasComponent(entity, BoundingBoxComponent) &&
        hasComponent(entity, TransformComponent) &&
        hasComponent(entity, GroupComponent)
      )
        updateBoundingBox(entity)
    }
  }

  const cameraPosition = getComponent(Engine.instance.cameraEntity, TransformComponent).position
  for (const entity of distanceFromCameraQuery())
    DistanceFromCameraComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(entity, cameraPosition)

  /** @todo expose the frustum in WebGLRenderer to not calculate this twice  */
  _projScreenMatrix.multiplyMatrices(Engine.instance.camera.projectionMatrix, Engine.instance.camera.matrixWorldInverse)
  _frustum.setFromProjectionMatrix(_projScreenMatrix)

  for (const entity of frustumCulledQuery())
    FrustumCullCameraComponent.isCulled[entity] = _frustum.containsPoint(
      getComponent(entity, TransformComponent).position
    )
      ? 0
      : 1

  if (localClientEntity) {
    const localClientPosition = getOptionalComponent(localClientEntity, TransformComponent)?.position
    if (localClientPosition) {
      for (const entity of distanceFromLocalClientQuery())
        DistanceFromLocalClientComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(
          entity,
          localClientPosition
        )
    }
  }

  /** for HMDs, only iterate priority queue entities to reduce matrix updates per frame. otherwise, this will be automatically run by threejs */
  /** @todo include in auto performance scaling metrics */
  // if (Engine.instance.xrFrame) {
  //   /**
  //    * Update threejs skeleton manually
  //    *  - overrides default behaviour in WebGLRenderer.render, calculating mat4 multiplcation
  //    */
  //   Skeleton.prototype.update = skeletonUpdate
  //   for (const entity of Engine.instance.priorityAvatarEntities) {
  //     const group = getComponent(entity, GroupComponent)
  //     for (const obj of group) obj.traverse(iterateSkeletons)
  //   }
  //   Skeleton.prototype.update = noop
  // }
}

const reactor = () => {
  useEffect(() => {
    const networkState = getMutableState(NetworkState)

    networkState.networkSchema[TransformSerialization.ID].set({
      read: TransformSerialization.readTransform,
      write: TransformSerialization.writeTransform
    })

    return () => {
      Skeleton.prototype.update = skeletonUpdate

      networkState.networkSchema[TransformSerialization.ID].set(none)

      originChildEntities.clear()
      sortedTransformEntities.length = 0
      transformDepths.clear()
    }
  }, [])
  return null
}

export const TransformSystem = defineSystem({
  uuid: 'ee.engine.TransformSystem',
  execute,
  reactor
})
