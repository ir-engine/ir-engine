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

import { defineComponent, getComponent, S, useComponent, useEntityContext } from '@ir-engine/ecs'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { Vector3 } from 'three'
import { TransformPivot } from '../../common/constants/TransformConstants'
import { useTransformPivot } from '../../common/functions/useTransformPivot'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

const delta = new Vector3()

const MAX_ZOOM_DISTANCE = 1000

export const CameraOrbitComponent = defineComponent({
  name: 'CameraOrbitComponent',

  schema: S.Object({
    focusedEntities: S.Array(S.Entity()),
    transformPivot: S.LiteralUnion(Object.values(TransformPivot), TransformPivot.FirstSelected),
    minimumZoom: S.Number(0.5),
    cameraOrbitCenter: T.Vec3(),
    disabled: S.Bool(false)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const cameraOrbit = useComponent(entity, CameraOrbitComponent)
    const pivot = useTransformPivot(cameraOrbit.focusedEntities.value, cameraOrbit.transformPivot.value)

    useImmediateEffect(() => {
      if (!pivot.position) return
      const zoom = Math.max(cameraOrbit.minimumZoom.value * 10, pivot.bounds.getSize(new Vector3()).length())
      const transform = getComponent(entity, TransformComponent)
      cameraOrbit.cameraOrbitCenter.value.copy(pivot.position)
      delta.set(0, 0, 1).applyQuaternion(transform.rotation).multiplyScalar(Math.min(zoom, MAX_ZOOM_DISTANCE))
      transform.position.copy(pivot.position).add(delta)
    }, [pivot])

    return null
  }
})
