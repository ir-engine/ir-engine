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
import { Vector3 } from 'three'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { useWorldBounds } from '../../transform/functions/BoundingBoxFunctions'
import { TransformPivot, TransformPivotType } from '../constants/TransformConstants'

export function useTransformPivot(entities: readonly Entity[], transformPivot: TransformPivotType) {
  const bounds = useWorldBounds(entities)

  const position = useMemo(() => {
    switch (transformPivot) {
      case TransformPivot.Origin:
        return new Vector3(0, 0, 0)
      case TransformPivot.FirstSelected:
        if (hasComponent(entities[0], TransformComponent)) {
          return TransformComponent.getWorldPosition(entities[0], new Vector3())
        }
        return undefined
      case TransformPivot.Center:
        if (bounds.isEmpty()) return undefined
        return bounds.getCenter(new Vector3())
      case TransformPivot.Bottom: {
        if (bounds.isEmpty()) return undefined
        const position = new Vector3()
        bounds.getCenter(position)
        position.y = bounds.min.y
        return position
      }
    }
  }, [bounds, transformPivot])

  return useMemo(
    () => ({
      bounds,
      position
    }),
    [bounds, position]
  )
}
