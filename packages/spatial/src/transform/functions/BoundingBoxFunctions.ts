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

import { Entity, getOptionalComponent, getSimulationCounterpart } from '@ir-engine/ecs'
import { useMemo } from 'react'
import { Box3, Vector3 } from 'three'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponents'
import { TransformComponent } from '../components/TransformComponent'
import { computeTransformMatrixWithChildren } from '../systems/TransformSystem'

/**
 * Returns all vertices of the bounding box, useful for including all vertices in the camera's view rather than hoping min and max are aligned with the camera
 * @param boundingBox
 */
export function getBoundingBoxVertices(boundingBox: Box3): Vector3[] {
  const min = boundingBox.min
  const max = boundingBox.max

  return [
    new Vector3(min.x, min.y, min.z),
    new Vector3(min.x, min.y, max.z),
    new Vector3(min.x, max.y, min.z),
    new Vector3(min.x, max.y, max.z),
    new Vector3(max.x, min.y, min.z),
    new Vector3(max.x, min.y, max.z),
    new Vector3(max.x, max.y, min.z),
    new Vector3(max.x, max.y, max.z)
  ]
}

const _box = new Box3()
const _position = new Vector3()

export function computeWorldBounds(entities: readonly Entity[], boundingBox: Box3 = new Box3()) {
  boundingBox.makeEmpty()
  for (const entity of entities) {
    const sEid = getSimulationCounterpart(entity)
    const obj = getOptionalComponent(sEid, ObjectComponent)
    const transform = getOptionalComponent(sEid, TransformComponent)
    if (transform) {
      computeTransformMatrixWithChildren(sEid)
    }
    const box = getOptionalComponent(sEid, BoundingBoxComponent)
    if (obj) {
      boundingBox.expandByObject(obj)
    } else if (!box && transform) {
      boundingBox.expandByPoint(TransformComponent.getWorldPosition(sEid, _position))
    } else if (box && transform) {
      _box.copy(box.box)
      _box.applyMatrix4(transform.matrixWorld)
      boundingBox.expandByPoint(_box.min)
      boundingBox.expandByPoint(_box.max)
    }
  }
  return boundingBox
}

export function useWorldBounds(entities: readonly Entity[], live: boolean = false) {
  const box = useMemo(() => {
    const boundingBox = new Box3()
    if (live) return boundingBox
    return computeWorldBounds(entities, boundingBox)
  }, [entities])
  if (live) computeWorldBounds(entities, box)
  return box
}
