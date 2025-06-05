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

import { useHookstate } from '@hookstate/core'
import {
  createEntity,
  Entity,
  EntityTreeComponent,
  getMutableComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent
} from '@ir-engine/ecs'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { DirectionalLightComponent } from '@ir-engine/spatial/src/SpatialModule'
import { BOUNDING_BOX_COLORS } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'

const size = 3
const lightPlaneGeometry = new BufferGeometry()
lightPlaneGeometry.setAttribute(
  'position',
  new Float32BufferAttribute(
    [
      -size,
      size,
      0,
      size,
      size,
      0,
      size,
      size,
      0,
      size,
      -size,
      0,
      size,
      -size,
      0,
      -size,
      -size,
      0,
      -size,
      -size,
      0,
      -size,
      size,
      0,
      -size,
      size,
      0,
      size,
      -size,
      0,
      size,
      size,
      0,
      -size,
      -size,
      0
    ],
    3
  )
)

const targetLineGeometry = new BufferGeometry()
const t = size * 0.1
targetLineGeometry.setAttribute(
  'position',
  new Float32BufferAttribute([-t, t, 0, 0, 0, 1, t, t, 0, 0, 0, 1, t, -t, 0, 0, 0, 1, -t, -t, 0, 0, 0, 1], 3)
)

const mergedGeometry = mergeBufferGeometries([targetLineGeometry, lightPlaneGeometry])

export const DirectionalLightHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const directionalLight = useComponent(parentEntity, DirectionalLightComponent)
  const directionalLightHelperEntity = useHookstate<Entity>(UndefinedEntity)
  useEffect(() => {
    if (!(selected || hovered)) return

    const helperEntity = createEntity()
    setComponent(helperEntity, EntityTreeComponent, { parentEntity })
    setComponent(helperEntity, LineSegmentComponent, {
      name: 'directional-light-helper',
      geometry: mergedGeometry?.clone(),
      color: directionalLight.color.value
    })
    directionalLightHelperEntity.set(helperEntity)

    return () => {
      removeEntity(helperEntity)
      directionalLightHelperEntity.set(UndefinedEntity)
    }
  }, [selected, hovered])

  useEffect(() => {
    if (directionalLightHelperEntity.value === UndefinedEntity) return
    const helper = getMutableComponent(directionalLightHelperEntity.value, LineSegmentComponent)
    if (!helper) return
    helper.color.set(hovered ? BOUNDING_BOX_COLORS.HOVERED : directionalLight.color.value)
  }, [directionalLightHelperEntity, directionalLight.color, hovered])

  return null
}
