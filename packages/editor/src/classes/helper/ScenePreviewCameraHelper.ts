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
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { BOUNDING_BOX_COLORS } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { BufferGeometry, Float32BufferAttribute, PerspectiveCamera } from 'three'

function createCameraFrustumGeometry(camera: PerspectiveCamera): BufferGeometry {
  const positions: number[] = []

  const fov = (camera.fov * Math.PI) / 180
  const aspect = camera.aspect
  const near = camera.near
  const far = Math.min(camera.far, 10)

  const nearHeight = 2 * Math.tan(fov / 2) * near
  const nearWidth = nearHeight * aspect
  const farHeight = 2 * Math.tan(fov / 2) * far
  const farWidth = farHeight * aspect

  const nearHalfWidth = nearWidth / 2
  const nearHalfHeight = nearHeight / 2
  const nearTopLeft = [-nearHalfWidth, nearHalfHeight, -near]
  const nearTopRight = [nearHalfWidth, nearHalfHeight, -near]
  const nearBottomLeft = [-nearHalfWidth, -nearHalfHeight, -near]
  const nearBottomRight = [nearHalfWidth, -nearHalfHeight, -near]

  const farHalfWidth = farWidth / 2
  const farHalfHeight = farHeight / 2
  const farTopLeft = [-farHalfWidth, farHalfHeight, -far]
  const farTopRight = [farHalfWidth, farHalfHeight, -far]
  const farBottomLeft = [-farHalfWidth, -farHalfHeight, -far]
  const farBottomRight = [farHalfWidth, -farHalfHeight, -far]

  positions.push(...nearTopLeft, ...nearTopRight)
  positions.push(...nearTopRight, ...nearBottomRight)
  positions.push(...nearBottomRight, ...nearBottomLeft)
  positions.push(...nearBottomLeft, ...nearTopLeft)

  positions.push(...farTopLeft, ...farTopRight)
  positions.push(...farTopRight, ...farBottomRight)
  positions.push(...farBottomRight, ...farBottomLeft)
  positions.push(...farBottomLeft, ...farTopLeft)

  positions.push(...nearTopLeft, ...farTopLeft)
  positions.push(...nearTopRight, ...farTopRight)
  positions.push(...nearBottomLeft, ...farBottomLeft)
  positions.push(...nearBottomRight, ...farBottomRight)

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createCameraBodyGeometry(): BufferGeometry {
  const positions: number[] = []
  const size = 0.2

  const halfSize = size / 2

  positions.push(-halfSize, halfSize, halfSize, halfSize, halfSize, halfSize)
  positions.push(halfSize, halfSize, halfSize, halfSize, -halfSize, halfSize)
  positions.push(halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize)
  positions.push(-halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize)

  positions.push(-halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize)
  positions.push(halfSize, halfSize, -halfSize, halfSize, -halfSize, -halfSize)
  positions.push(halfSize, -halfSize, -halfSize, -halfSize, -halfSize, -halfSize)
  positions.push(-halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize)

  positions.push(-halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize)
  positions.push(halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize)
  positions.push(halfSize, -halfSize, halfSize, halfSize, -halfSize, -halfSize)
  positions.push(-halfSize, -halfSize, halfSize, -halfSize, -halfSize, -halfSize)

  const lensRadius = size * 0.3
  const lensLength = size * 0.5
  const lensSegments = 8

  for (let i = 0; i < lensSegments; i++) {
    const angle1 = (i / lensSegments) * Math.PI * 2
    const angle2 = ((i + 1) / lensSegments) * Math.PI * 2

    const x1 = Math.cos(angle1) * lensRadius
    const y1 = Math.sin(angle1) * lensRadius
    const x2 = Math.cos(angle2) * lensRadius
    const y2 = Math.sin(angle2) * lensRadius

    positions.push(x1, y1, halfSize + lensLength, x2, y2, halfSize + lensLength)

    if (i % 2 === 0) {
      positions.push(x1, y1, halfSize, x1, y1, halfSize + lensLength)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createCameraGizmoGeometry(camera: PerspectiveCamera): BufferGeometry {
  const frustumGeometry = createCameraFrustumGeometry(camera)
  const bodyGeometry = createCameraBodyGeometry()

  const mergedGeometry = mergeBufferGeometries([frustumGeometry, bodyGeometry])

  frustumGeometry.dispose()
  bodyGeometry.dispose()

  return mergedGeometry!
}

export const ScenePreviewCameraHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const previewCameraComponent = useComponent(parentEntity, ScenePreviewCameraComponent)
  const cameraHelperEntity = useHookstate<Entity>(UndefinedEntity)

  useEffect(() => {
    if (!(selected || hovered)) return

    const helperEntity = createEntity()
    setComponent(helperEntity, EntityTreeComponent, { parentEntity })

    const camera = previewCameraComponent.camera.value as PerspectiveCamera
    const gizmoGeometry = createCameraGizmoGeometry(camera)

    setComponent(helperEntity, LineSegmentComponent, {
      name: 'camera-helper',
      geometry: gizmoGeometry?.clone(),
      color: hovered ? BOUNDING_BOX_COLORS.HOVERED : BOUNDING_BOX_COLORS.SELECTED
    })

    cameraHelperEntity.set(helperEntity)

    return () => {
      removeEntity(helperEntity)
      cameraHelperEntity.set(UndefinedEntity)
    }
  }, [selected, hovered])

  useEffect(() => {
    if (cameraHelperEntity.value === UndefinedEntity) return

    const helper = getMutableComponent(cameraHelperEntity.value, LineSegmentComponent)
    if (!helper) return

    const camera = previewCameraComponent.camera.value as PerspectiveCamera
    const newGeometry = createCameraGizmoGeometry(camera)

    if (helper.geometry.value) {
      helper.geometry.value.dispose()
    }
    helper.geometry.set(newGeometry)
  }, [cameraHelperEntity, previewCameraComponent.camera])

  return null
}
