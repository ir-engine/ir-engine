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

function createCameraFrustumGeometry(camera: PerspectiveCamera, maxDistance = 10): BufferGeometry {
  const { fov, aspect, near } = camera
  const far = Math.min(camera.far, maxDistance)
  const halfFov = (fov * Math.PI) / 360

  const nearDim = { h: 2 * Math.tan(halfFov) * near, w: 0 }
  nearDim.w = nearDim.h * aspect

  const farDim = { h: 2 * Math.tan(halfFov) * far, w: 0 }
  farDim.w = farDim.h * aspect

  const createCorners = (width, height, z) => {
    const hw = width / 2,
      hh = height / 2
    return [
      [-hw, hh, z],
      [hw, hh, z],
      [hw, -hh, z],
      [-hw, -hh, z]
    ]
  }

  const nearCorners = createCorners(nearDim.w, nearDim.h, near)
  const farCorners = createCorners(farDim.w, farDim.h, far)

  const addQuad = (corners, positions) => {
    for (let i = 0; i < 4; i++) {
      positions.push(...corners[i], ...corners[(i + 1) % 4])
    }
  }

  const positions: any[] = []
  addQuad(nearCorners, positions)
  addQuad(farCorners, positions)

  nearCorners.forEach((near, i) => {
    positions.push(...near, ...farCorners[i])
  })

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createCameraBodyGeometry(size = 0.2, lensConfig = { radius: 0.3, length: 0.5, segments: 12 }): BufferGeometry {
  const hs = size / 2
  const positions: number[] = []

  const faces = [
    [
      [-hs, hs, -hs],
      [hs, hs, -hs],
      [hs, -hs, -hs],
      [-hs, -hs, -hs]
    ],
    [
      [-hs, hs, hs],
      [hs, hs, hs],
      [hs, -hs, hs],
      [-hs, -hs, hs]
    ],
    [
      [-hs, hs, -hs],
      [-hs, hs, hs],
      [-hs, -hs, hs],
      [-hs, -hs, -hs]
    ],
    [
      [hs, hs, -hs],
      [hs, hs, hs],
      [hs, -hs, hs],
      [hs, -hs, -hs]
    ],
    [
      [-hs, hs, -hs],
      [hs, hs, -hs],
      [hs, hs, hs],
      [-hs, hs, hs]
    ],
    [
      [-hs, -hs, -hs],
      [hs, -hs, -hs],
      [hs, -hs, hs],
      [-hs, -hs, hs]
    ]
  ]

  faces.forEach((face) => {
    for (let i = 0; i < 4; i++) {
      positions.push(...face[i], ...face[(i + 1) % 4])
    }
  })

  const { radius, length, segments } = lensConfig
  const lensR = size * radius
  const lensL = size * length
  const lensZ = -hs - lensL

  Array.from({ length: segments }, (_, i) => {
    const a1 = (i / segments) * Math.PI * 2
    const a2 = ((i + 1) / segments) * Math.PI * 2
    const [x1, y1] = [Math.cos(a1) * lensR, Math.sin(a1) * lensR]
    const [x2, y2] = [Math.cos(a2) * lensR, Math.sin(a2) * lensR]

    positions.push(x1, y1, lensZ, x2, y2, lensZ)
    if (i % 3 === 0) positions.push(x1, y1, -hs, x1, y1, lensZ)
  })

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
