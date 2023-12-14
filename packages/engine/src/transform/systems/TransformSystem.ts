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

import { useEffect } from 'react'
import { Camera, Frustum, Matrix4, Mesh, Vector3 } from 'three'

import { insertionSort } from '@etherealengine/common/src/utils/insertionSort'
import { getMutableState, getState, none } from '@etherealengine/hyperflux'

import { CameraComponent } from '../../camera/components/CameraComponent'
import { V_000 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, getOptionalComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { BoundingBoxComponent, updateBoundingBox } from '../../interaction/components/BoundingBoxComponents'
import { NetworkState } from '../../networking/NetworkState'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { XRState } from '../../xr/XRState'
import { TransformSerialization } from '../TransformSerialization'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import {
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent,
  FrustumCullCameraComponent
} from '../components/DistanceComponents'
import { TransformComponent, composeMatrix } from '../components/TransformComponent'

const transformQuery = defineQuery([TransformComponent])
const rigidbodyQuery = defineQuery([TransformComponent, RigidBodyComponent])
const groupQuery = defineQuery([GroupComponent, VisibleComponent])

const boundingBoxQuery = defineQuery([BoundingBoxComponent])

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])
const distanceFromCameraQuery = defineQuery([TransformComponent, DistanceFromCameraComponent])
const frustumCulledQuery = defineQuery([TransformComponent, FrustumCullCameraComponent])

export const computeTransformMatrix = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  updateTransformFromComputedTransform(entity)
  composeMatrix(entity)
  const entityTree = getOptionalComponent(entity, EntityTreeComponent)
  const parentEntity = entityTree?.parentEntity
  if (parentEntity) {
    const parentTransform = getComponent(parentEntity, TransformComponent)
    if (parentTransform) transform.matrixWorld.multiplyMatrices(parentTransform.matrixWorld, transform.matrix)
  } else {
    transform.matrixWorld.copy(transform.matrix)
  }
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

const updateTransformFromComputedTransform = (entity: Entity) => {
  const computedTransform = getOptionalComponent(entity, ComputedTransformComponent)
  if (!computedTransform) return
  computedTransform.computeFunction(entity, computedTransform.referenceEntity)
}

export const updateGroupChildren = (entity: Entity) => {
  const group = getComponent(entity, GroupComponent) as any as (Mesh & Camera)[]
  // drop down one level and update children

  for (const root of group) {
    if (root.isProxified) continue
    for (const obj of root.children) {
      obj.updateMatrixWorld()
      obj.matrixWorldNeedsUpdate = false
    }
  }
}

const _tempDistSqrVec3 = new Vector3()

const getDistanceSquaredFromTarget = (entity: Entity, targetPosition: Vector3) => {
  return TransformComponent.getWorldPosition(entity, _tempDistSqrVec3).distanceToSquared(targetPosition)
}

const _frustum = new Frustum()
const _projScreenMatrix = new Matrix4()

const originChildEntities = new Set<Entity>()

/** get list of entities that are children of the world origin */
const updateOriginChildEntities = (entity: Entity) => {
  const referenceEntity = getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntity
  const parentEntity = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity

  if (referenceEntity && (originChildEntities.has(referenceEntity) || referenceEntity === Engine.instance.originEntity))
    originChildEntities.add(referenceEntity)
  if (parentEntity && (originChildEntities.has(parentEntity) || parentEntity === Engine.instance.originEntity))
    originChildEntities.add(parentEntity)
}

const transformDepths = new Map<Entity, number>()

const updateTransformDepth = (entity: Entity) => {
  if (transformDepths.has(entity)) return transformDepths.get(entity)

  const referenceEntity = getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntity
  const parentEntity = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity

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

const isDirty = (entity: Entity) => TransformComponent.dirtyTransforms[entity]

const filterAwakeCleanRigidbodies = (entity: Entity) =>
  !getComponent(entity, RigidBodyComponent).body.isSleeping() && !isDirty(entity)

const sortedTransformEntities = [] as Entity[]

const execute = () => {
  const { localClientEntity } = Engine.instance
  // TODO: move entity tree mutation logic here for more deterministic and less redundant calculations

  // if transform order is dirty, sort by reference depth
  // Note: cyclic references will cause undefined behavior

  /**
   * Sort transforms if needed
   */
  const engineState = getState(EngineState)
  const xrFrame = getState(XRState).xrFrame

  let needsSorting = TransformComponent.transformsNeedSorting

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
    TransformComponent.transformsNeedSorting = false
  }

  /**
   * Update entity transforms
   */
  const allRigidbodyEntities = rigidbodyQuery()
  const awakeCleanRigidbodyEntities = allRigidbodyEntities.filter(filterAwakeCleanRigidbodies)
  const dirtyRigidbodyEntities = allRigidbodyEntities.filter(isDirty)

  // if rigidbody transforms have been dirtied, teleport the rigidbody to the transform
  for (const entity of dirtyRigidbodyEntities) copyTransformToRigidBody(entity)

  // lerp awake clean rigidbody entities (and make their transforms dirty)
  const simulationRemainder = engineState.frameTime - engineState.simulationTime
  const alpha = Math.min(simulationRemainder / engineState.simulationTimestep, 1)
  for (const entity of awakeCleanRigidbodyEntities) lerpTransformFromRigidbody(entity, alpha)

  // entities with dirty parent or reference entities, or computed transforms, should also be dirty
  for (const entity of sortedTransformEntities) {
    const makeDirty =
      TransformComponent.dirtyTransforms[entity] ||
      TransformComponent.dirtyTransforms[entity] ||
      TransformComponent.dirtyTransforms[getOptionalComponent(entity, EntityTreeComponent)?.parentEntity ?? -1] ||
      TransformComponent.dirtyTransforms[
        getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntity ?? -1
      ] ||
      hasComponent(entity, ComputedTransformComponent)
    TransformComponent.dirtyTransforms[entity] = makeDirty
  }

  const dirtySortedTransformEntities = sortedTransformEntities.filter(isDirty)
  for (const entity of dirtySortedTransformEntities) computeTransformMatrix(entity)

  // XRUI is the only non ecs hierarchy with support still - see https://github.com/EtherealEngine/etherealengine/issues/8519
  const dirtyOrAnimatingGroupEntities = groupQuery().filter(isDirty)
  for (const entity of dirtyOrAnimatingGroupEntities) updateGroupChildren(entity)

  if (!xrFrame) {
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
    const viewCamera = camera.cameras[0]
    viewCamera.matrixWorld.copy(camera.matrixWorld)
    viewCamera.matrixWorldInverse.copy(camera.matrixWorldInverse)
    viewCamera.projectionMatrix.copy(camera.projectionMatrix)
    viewCamera.projectionMatrixInverse.copy(camera.projectionMatrixInverse)
  }

  const dirtyBoundingBoxes = boundingBoxQuery().filter(isDirty)
  for (const entity of dirtyBoundingBoxes) updateBoundingBox(entity)

  for (const entity in TransformComponent.dirtyTransforms) TransformComponent.dirtyTransforms[entity] = false

  const cameraPosition = getComponent(Engine.instance.cameraEntity, TransformComponent).position
  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  for (const entity of distanceFromCameraQuery())
    DistanceFromCameraComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(entity, cameraPosition)

  /** @todo expose the frustum in WebGLRenderer to not calculate this twice  */
  _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  _frustum.setFromProjectionMatrix(_projScreenMatrix)

  for (const entity of frustumCulledQuery()) {
    const boundingBox = (
      getOptionalComponent(entity, BoundingBoxComponent) ?? getOptionalComponent(entity, BoundingBoxComponent)
    )?.box
    const cull = boundingBox
      ? _frustum.intersectsBox(boundingBox)
      : _frustum.containsPoint(getComponent(entity, TransformComponent).position)
    FrustumCullCameraComponent.isCulled[entity] = cull ? 0 : 1
  }
  if (localClientEntity) {
    const localClientPosition = TransformComponent.getWorldPosition(localClientEntity, vec3)
    if (localClientPosition) {
      for (const entity of distanceFromLocalClientQuery())
        DistanceFromLocalClientComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(
          entity,
          localClientPosition
        )
    }
  }
}

const vec3 = new Vector3()

const reactor = () => {
  useEffect(() => {
    const networkState = getMutableState(NetworkState)

    networkState.networkSchema[TransformSerialization.ID].set({
      read: TransformSerialization.readTransform,
      write: TransformSerialization.writeTransform
    })

    return () => {
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
  insert: { after: AnimationSystemGroup },
  execute,
  reactor
})
