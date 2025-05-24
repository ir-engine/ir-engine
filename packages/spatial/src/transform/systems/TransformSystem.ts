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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Frustum, Matrix4, Vector3 } from 'three'

import {
  AnimationSystemGroup,
  defineQuery,
  defineSystem,
  Entity,
  getComponent,
  getOptionalComponent,
  hasComponent,
  LayerComponents,
  Layers,
  NetworkSchemaState
} from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { insertionSort } from '../../common/functions/insertionSort'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { XRState } from '../../xr/XRState'
import { BoundingBoxComponent, updateBoundingBox } from '../components/BoundingBoxComponent'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../components/DistanceComponents'
import { TransformComponent } from '../components/TransformComponent'
import { TransformSerialization } from '../TransformSerialization'

const transformQuery = defineQuery([TransformComponent])
const computedTransformQuery = defineQuery([ComputedTransformComponent])

const boundingBoxQuery = defineQuery([BoundingBoxComponent])

const distanceFromCameraQuery = defineQuery([TransformComponent, DistanceFromCameraComponent])
const frustumCulledQuery = defineQuery([TransformComponent, FrustumCullCameraComponent])

const cameraQuery = defineQuery([TransformComponent, CameraComponent])

const _frustum = new Frustum()
const _worldPos = new Vector3()
const _projScreenMatrix = new Matrix4()

const _transformDepths = new Map<Entity, number>()

const updateTransformDepth = (entity: Entity) => {
  if (_transformDepths.has(entity)) return _transformDepths.get(entity)

  const referenceEntities = getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntities
  const parentEntity = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity

  const referenceEntityDepths = referenceEntities ? referenceEntities.map(updateTransformDepth) : []
  const parentEntityDepth = parentEntity ? updateTransformDepth(parentEntity) : 0
  const depth = Math.max(...referenceEntityDepths, parentEntityDepth) + 1
  _transformDepths.set(entity, depth)

  return depth
}

const compareReferenceDepth = (a: Entity, b: Entity) => {
  const aDepth = _transformDepths.get(a)!
  const bDepth = _transformDepths.get(b)!
  return aDepth - bDepth
}

const authoringTransformQuery = defineQuery([TransformComponent], Layers.Authoring)

export const isDirty = (entity: Entity) => TransformComponent.dirty[entity] === 1

// Re-export getDistanceSquaredFromTarget from TransformComponent
export const getDistanceSquaredFromTarget = TransformComponent.getDistanceSquaredFromTarget

const _sortedTransformEntities = [] as Entity[]

const sortAndMakeDirtyEntities = () => {
  // TODO: move entity tree mutation logic here for more deterministic and less redundant calculations

  // if transform order is dirty, sort by reference depth
  // Note: cyclic references will cause undefined behavior

  /**
   * Sort transforms if needed
   */

  let needsSorting =
    TransformComponent.transformsNeedSorting ||
    computedTransformQuery.enter().length ||
    computedTransformQuery.exit().length

  for (const entity of transformQuery.enter()) {
    _sortedTransformEntities.push(entity)
    needsSorting = true
  }

  for (const entity of transformQuery.exit()) {
    const idx = _sortedTransformEntities.indexOf(entity)
    idx > -1 && _sortedTransformEntities.splice(idx, 1)
    needsSorting = true
  }

  if (needsSorting) {
    _transformDepths.clear()
    for (const entity of _sortedTransformEntities) updateTransformDepth(entity)
    insertionSort(_sortedTransformEntities, compareReferenceDepth) // Insertion sort is speedy O(n) for mostly sorted arrays
    TransformComponent.transformsNeedSorting = false
  }

  /** Mark the corresponding simulation entity of any authoring layer entities as dirty */
  const dirtyAuthoringEntities = authoringTransformQuery().filter(isDirty)
  for (const entity of dirtyAuthoringEntities) {
    const authoringComponent = getComponent(entity, LayerComponents[Layers.Authoring])
    const linkedEntity = authoringComponent.relations[Layers.Simulation]
    TransformComponent.dirty[entity] = 0
    TransformComponent.dirty[linkedEntity] = 1
  }

  // entities with dirty parent or reference entities, or computed transforms, should also be dirty
  for (const entity of _sortedTransformEntities) {
    TransformComponent.dirty[entity] =
      TransformComponent.dirty[entity] ||
      (hasComponent(entity, ComputedTransformComponent) ? 1 : 0) ||
      TransformComponent.dirty[getOptionalComponent(entity, EntityTreeComponent)?.parentEntity ?? -1] ||
      0
  }
}

const execute = () => {
  const dirtySortedTransformEntities = _sortedTransformEntities.filter(isDirty)
  for (const entity of dirtySortedTransformEntities) TransformComponent.computeTransformMatrix(entity)

  const dirtyBoundingBoxes = boundingBoxQuery().filter(isDirty)
  for (const entity of dirtyBoundingBoxes) updateBoundingBox(entity)

  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  const cameraEntities = cameraQuery()

  const xrFrame = getState(XRState).xrFrame

  for (const entity of cameraEntities) {
    if (xrFrame && entity === viewerEntity) continue
    const camera = getComponent(entity, CameraComponent)
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
    const viewCamera = camera.cameras[0]
    viewCamera.matrixWorld.copy(camera.matrixWorld)
    viewCamera.matrixWorldInverse.copy(camera.matrixWorldInverse)
    viewCamera.projectionMatrix.copy(camera.projectionMatrix)
    viewCamera.projectionMatrixInverse.copy(camera.projectionMatrixInverse)
  }

  if (!viewerEntity || !hasComponent(viewerEntity, TransformComponent)) return

  const cameraPosition = getComponent(viewerEntity, TransformComponent).position
  const camera = getComponent(viewerEntity, CameraComponent)
  for (const entity of distanceFromCameraQuery())
    DistanceFromCameraComponent.squaredDistance[entity] = TransformComponent.getDistanceSquaredFromTarget(
      entity,
      cameraPosition
    )

  /** @todo expose the frustum in WebGLRenderer to not calculate this twice  */
  _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  _frustum.setFromProjectionMatrix(_projScreenMatrix)

  for (const entity of frustumCulledQuery()) {
    const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)?.box
    const shouldNotCull = boundingBox
      ? _frustum.intersectsBox(boundingBox)
      : _frustum.containsPoint(TransformComponent.getWorldPosition(entity, _worldPos))
    FrustumCullCameraComponent.isCulled[entity] = shouldNotCull ? 0 : 1
  }
}

const reactor = () => {
  useEffect(() => {
    const networkState = getMutableState(NetworkSchemaState)

    networkState[TransformSerialization.ID].set({
      read: TransformSerialization.readTransform,
      write: TransformSerialization.writeTransform
    })

    return () => {
      networkState[TransformSerialization.ID].set(none)
      _sortedTransformEntities.length = 0
      _transformDepths.clear()
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

export const TransformDirtyUpdateSystem = defineSystem({
  uuid: 'ee.engine.TransformDirtyUpdateSystem',
  insert: { before: TransformSystem },
  execute: sortAndMakeDirtyEntities
})

export const TransformDirtyCleanupSystem = defineSystem({
  uuid: 'ee.engine.TransformDirtyCleanupSystem',
  insert: { after: TransformSystem },
  execute: () => {
    TransformComponent.dirty.fill(0)
  }
})
