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

import { Entity, hasComponent } from '@ir-engine/ecs'
import { useMemo } from 'react'
import { Box3, Quaternion, Vector3 } from 'three'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeWorldBounds } from '../../transform/functions/BoundingBoxFunctions'
import { TransformPivot, TransformPivotType, TransformSpace, TransformSpaceType } from '../constants/TransformConstants'

const _bounds = new Box3()
const _position = new Vector3()
const _rotation = new Quaternion()
const _result = {
  bounds: _bounds,
  position: _position as Vector3 | undefined,
  rotation: _rotation as Quaternion | undefined
} as TransformPivotResult

interface TransformPivotResult {
  bounds: Box3
  position?: Vector3
  rotation?: Quaternion
}

/**
 * @param entities
 * @param transformPivot
 * @returns pivot result. Transient (values are valid only until the next time this function is called)
 */
export function computeTransformPivot(
  entities: readonly Entity[],
  transformPivot = TransformPivot.Center as TransformPivotType,
  transformSpace = TransformSpace.local as TransformSpaceType
): TransformPivotResult {
  const r = _result
  r.position = _position
  r.rotation = _rotation

  computeWorldBounds(entities, r.bounds)

  const firstEntity = entities[0]
  if (!hasComponent(firstEntity, TransformComponent)) {
    r.position = undefined
    r.rotation = undefined
    return r
  }

  if (transformSpace === 'local') {
    TransformComponent.getWorldPosition(firstEntity, r.position)
    TransformComponent.getWorldRotation(firstEntity, r.rotation)
  } else {
    TransformComponent.getWorldPosition(firstEntity, r.position)
    r.rotation.set(0, 0, 0, 1)
  }

  switch (transformPivot) {
    case TransformPivot.Origin:
      r.position.set(0, 0, 0)
      r.rotation.set(0, 0, 0, 1)
      break
    case TransformPivot.FirstSelected:
      break
    case TransformPivot.Center:
      if (!r.bounds.isEmpty()) {
        r.bounds.getCenter(r.position)
      }
      break
    case TransformPivot.Bottom: {
      if (!r.bounds.isEmpty()) {
        r.bounds.getCenter(r.position)
        r.position.y = r.bounds.min.y
      }
      break
    }
  }
  return r
}

export function useTransformPivot(
  entities: readonly Entity[],
  transformPivot: TransformPivotType,
  space = TransformSpace.local
) {
  return useMemo(() => {
    const result = computeTransformPivot(entities, transformPivot, space)
    return {
      bounds: result.bounds.clone(),
      position: result.position?.clone(),
      rotation: result.rotation?.clone()
    }
  }, [JSON.stringify(entities), transformPivot, space])
}
