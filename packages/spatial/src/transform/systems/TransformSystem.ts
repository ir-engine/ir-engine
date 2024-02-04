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

import {
  AnimationSystemGroup,
  Engine,
  Entity,
  defineQuery,
  defineSystem,
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@etherealengine/ecs'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { NetworkState } from '../../networking/NetworkState'
import { GroupComponent } from '../../renderer/components/GroupComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { XRState } from '../../xr/XRState'
import { TransformSerialization } from '../TransformSerialization'
import { BoundingBoxComponent, updateBoundingBox } from '../components/BoundingBoxComponents'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import {
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent,
  FrustumCullCameraComponent
} from '../components/DistanceComponents'
import { TransformComponent } from '../components/TransformComponent'
import { computeTransformMatrix } from '../functions/TransformFunctions'

const transformQuery = defineQuery([TransformComponent])
const groupQuery = defineQuery([GroupComponent, VisibleComponent])

const boundingBoxQuery = defineQuery([BoundingBoxComponent])

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])
const distanceFromCameraQuery = defineQuery([TransformComponent, DistanceFromCameraComponent])
const frustumCulledQuery = defineQuery([TransformComponent, FrustumCullCameraComponent])

//isProxified: used to check if an object is proxified
declare module 'three/src/core/Object3D' {
  export interface Object3D {
    readonly isProxified: true | undefined
  }
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

export const isDirty = (entity: Entity) => TransformComponent.dirtyTransforms[entity]

const sortedTransformEntities = [] as Entity[]

const execute = () => {
  const { localClientEntity } = Engine.instance
  // TODO: move entity tree mutation logic here for more deterministic and less redundant calculations

  // if transform order is dirty, sort by reference depth
  // Note: cyclic references will cause undefined behavior

  /**
   * Sort transforms if needed
   */
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

  // entities with dirty parent or reference entities, or computed transforms, should also be dirty
  for (const entity of sortedTransformEntities) {
    const makeDirty =
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

export const TransformDirtyCleanupSystem = defineSystem({
  uuid: 'ee.engine.TransformDirtyCleanupSystem',
  insert: { after: TransformSystem },
  execute: () => {
    for (const entity in TransformComponent.dirtyTransforms) TransformComponent.dirtyTransforms[entity] = false
  }
})
