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
  Easing,
  Entity,
  EntityTreeComponent,
  UndefinedEntity,
  createEntity,
  getMutableComponent,
  removeEntity,
  setComponent,
  useComponent
} from '@ir-engine/ecs'
import { PointLightComponent } from '@ir-engine/spatial'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { BOUNDING_BOX_COLORS } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { iconGizmoTransitionTimeout } from '../../constants/GizmoPresets'

function createPointLightSphereGeometry(range: number): BufferGeometry {
  const positions: number[] = []
  const segments = 16
  const rings = 8

  for (let ring = 0; ring <= rings; ring++) {
    const phi = (ring / rings) * Math.PI
    const y = Math.cos(phi) * range
    const ringRadius = Math.sin(phi) * range

    if (ring === 0 || ring === rings) {
      for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2
        const angle2 = ((i + 1) / segments) * Math.PI * 2

        const x1 = Math.cos(angle1) * ringRadius * 0.1
        const z1 = Math.sin(angle1) * ringRadius * 0.1
        const x2 = Math.cos(angle2) * ringRadius * 0.1
        const z2 = Math.sin(angle2) * ringRadius * 0.1

        positions.push(x1, y, z1)
        positions.push(x2, y, z2)
      }
    } else {
      for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2
        const angle2 = ((i + 1) / segments) * Math.PI * 2

        const x1 = Math.cos(angle1) * ringRadius
        const z1 = Math.sin(angle1) * ringRadius
        const x2 = Math.cos(angle2) * ringRadius
        const z2 = Math.sin(angle2) * ringRadius

        positions.push(x1, y, z1)
        positions.push(x2, y, z2)
      }
    }
  }

  for (let i = 0; i < segments; i += 2) {
    const angle = (i / segments) * Math.PI * 2
    const x = Math.cos(angle)
    const z = Math.sin(angle)

    for (let ring = 0; ring < rings; ring++) {
      const phi1 = (ring / rings) * Math.PI
      const phi2 = ((ring + 1) / rings) * Math.PI

      const y1 = Math.cos(phi1) * range
      const r1 = Math.sin(phi1) * range
      const y2 = Math.cos(phi2) * range
      const r2 = Math.sin(phi2) * range

      positions.push(x * r1, y1, z * r1)
      positions.push(x * r2, y2, z * r2)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createPointLightGizmoGeometry(range: number): BufferGeometry {
  const visualRange = range === 0 ? 5 : range

  const sphereGeometry = createPointLightSphereGeometry(visualRange)

  const mergedGeometry = mergeBufferGeometries([sphereGeometry])

  sphereGeometry.dispose()

  return mergedGeometry!
}

export const PointLightHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const pointLight = useComponent(parentEntity, PointLightComponent)
  const pointLightHelperEntity = useHookstate<Entity>(UndefinedEntity)

  useEffect(() => {
    if (!(selected || hovered)) return

    const helperEntity = createEntity()
    setComponent(helperEntity, EntityTreeComponent, { parentEntity })
    setComponent(helperEntity, LineSegmentComponent, {
      name: 'point-light-helper',
      geometry: createPointLightGizmoGeometry(pointLight.range.value)?.clone(),
      color: pointLight.color.value,
      opacity: 0
    })
    pointLightHelperEntity.set(helperEntity)

    // @ts-ignore causes issues with the type system value inferred as never

    LineSegmentComponent.setTransition(helperEntity, 'opacity', 1, {
      duration: iconGizmoTransitionTimeout,
      easing: Easing.quadratic.inOut
    })

    return () => {
      // @ts-ignore causes issues with the type system value inferred as never
      LineSegmentComponent.setTransition(helperEntity, 'opacity', 0, {
        duration: iconGizmoTransitionTimeout,
        easing: Easing.quadratic.inOut
      })

      setTimeout(() => {
        removeEntity(helperEntity)
        pointLightHelperEntity.set(UndefinedEntity)
      }, iconGizmoTransitionTimeout)
    }
  }, [selected, hovered])

  useEffect(() => {
    if (pointLightHelperEntity.value === UndefinedEntity) return

    const helper = getMutableComponent(pointLightHelperEntity.value, LineSegmentComponent)
    helper.color.set(hovered ? BOUNDING_BOX_COLORS.HOVERED : pointLight.color.value)

    const newGeometry = createPointLightGizmoGeometry(pointLight.range.value)

    if (newGeometry) {
      helper.geometry.value?.dispose()
      helper.geometry.set(newGeometry)
    }
  }, [pointLightHelperEntity.value, pointLight.color, pointLight.range, hovered])

  return null
}
