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
  Entity,
  EntityTreeComponent,
  UndefinedEntity,
  createEntity,
  getMutableComponent,
  removeEntity,
  setComponent,
  useComponent
} from '@ir-engine/ecs'
import { SpotLightComponent } from '@ir-engine/spatial'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { BOUNDING_BOX_COLORS } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'

function createSpotLightConeGeometry(angle: number, range: number): BufferGeometry {
  const segments = 16
  const positions: number[] = []

  const visualRange = range === 0 ? 10 : range
  const radius = Math.tan(angle) * visualRange

  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2
    const angle2 = ((i + 1) / segments) * Math.PI * 2

    const x1 = Math.cos(angle1) * radius
    const y1 = Math.sin(angle1) * radius
    const x2 = Math.cos(angle2) * radius
    const y2 = Math.sin(angle2) * radius

    positions.push(x1, y1, visualRange)
    positions.push(x2, y2, visualRange)
  }

  for (let i = 0; i < segments; i += 4) {
    const lineAngle = (i / segments) * Math.PI * 2
    const x = Math.cos(lineAngle) * radius
    const y = Math.sin(lineAngle) * radius

    positions.push(0, 0, 0)
    positions.push(x, y, visualRange)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createSpotLightRadialGeometry(angle: number, range: number): BufferGeometry {
  const positions: number[] = []

  const visualRange = range === 0 ? 10 : range
  const radius = Math.tan(angle) * visualRange

  const numLines = 16
  for (let i = 0; i < numLines; i++) {
    const lineAngle = (i / numLines) * Math.PI * 2
    const x = Math.cos(lineAngle) * radius
    const y = Math.sin(lineAngle) * radius

    positions.push(0, 0, 0)
    positions.push(x, y, visualRange)
  }

  const halfRange = visualRange * 0.5
  const halfRadius = Math.tan(angle) * halfRange
  for (let i = 0; i < 8; i++) {
    const lineAngle = (i / 8) * Math.PI * 2
    const x = Math.cos(lineAngle) * halfRadius
    const y = Math.sin(lineAngle) * halfRadius

    positions.push(0, 0, 0)
    positions.push(x, y, halfRange)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createSpotLightGizmoGeometry(angle: number, range: number): BufferGeometry {
  const coneGeometry = createSpotLightConeGeometry(angle, range)
  const radialGeometry = createSpotLightRadialGeometry(angle, range)

  const mergedGeometry = mergeBufferGeometries([coneGeometry, radialGeometry])

  coneGeometry.dispose()
  radialGeometry.dispose()

  return mergedGeometry!
}

export const SpotLightHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const spotLightComponent = useComponent(parentEntity, SpotLightComponent)
  const spotLightHelperEntity = useHookstate<Entity>(UndefinedEntity)

  useEffect(() => {
    if (!(selected || hovered)) return

    const helperEntity = createEntity()
    setComponent(helperEntity, EntityTreeComponent, { parentEntity })

    const gizmoGeometry = createSpotLightGizmoGeometry(spotLightComponent.angle.value, spotLightComponent.range.value)

    setComponent(helperEntity, LineSegmentComponent, {
      name: 'spot-light-helper',
      geometry: gizmoGeometry?.clone(),
      color: spotLightComponent.color.value
    })

    spotLightHelperEntity.set(helperEntity)

    return () => {
      removeEntity(helperEntity)
      spotLightHelperEntity.set(UndefinedEntity)
    }
  }, [selected, hovered])

  useEffect(() => {
    if (spotLightHelperEntity.value === UndefinedEntity) return

    const helper = getMutableComponent(spotLightHelperEntity.value, LineSegmentComponent)
    if (!helper) return

    helper.color.set(hovered ? BOUNDING_BOX_COLORS.HOVERED : spotLightComponent.color.value)

    const newGeometry = createSpotLightGizmoGeometry(spotLightComponent.angle.value, spotLightComponent.range.value)

    if (helper.geometry.value) {
      helper.geometry.value.dispose()
    }
    helper.geometry.set(newGeometry)
  }, [spotLightHelperEntity, spotLightComponent.color, spotLightComponent.angle, spotLightComponent.range, hovered])

  return null
}
