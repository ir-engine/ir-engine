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

import { Engine, EntityUUID, UUIDComponent, getComponent, hasComponent } from '@ir-engine/ecs'
import { defineState, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect, useState } from 'react'
import { Frustum, Mesh, Plane, Vector3 } from 'three'
import { EditorState } from '../../../services/EditorServices'
import { SelectionState } from '../../../services/SelectionServices'

import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
export const SelectionBoxState = defineState({
  name: 'selectionBox State',
  initial: () => ({
    selectionBoxEnabled: false
  })
})

export default function SelectionBox({
  viewportRef,
  toolbarRef
}: {
  viewportRef: React.RefObject<HTMLDivElement>
  toolbarRef: React.RefObject<HTMLDivElement>
}) {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  // const [width, setWidth] = useState(0)
  // const [height, setHeight] = useState(0)
  const width = useHookstate(0)
  const height = useHookstate(0)

  const [isDragging, setIsDragging] = useState(false)
  const handleMouseDown = (e: React.MouseEvent) => {
    const viewportRect = viewportRef.current!.getBoundingClientRect()
    const toolbarRect = toolbarRef.current!.getBoundingClientRect()

    setStartX(e.clientX)
    setStartY(e.clientY)
    setIsDragging(true)
    setLeft(Math.max(e.clientX - viewportRect.left, 0))
    setTop(Math.max(e.clientY - viewportRect.top - toolbarRect.height, 0))
    width.set(0)
    height.set(0)
    // setWidth(0)
    // setHeight(0)

    SelectionState.updateSelection([])
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const viewportRect = viewportRef.current!.getBoundingClientRect()
    const toolbarRect = toolbarRef.current!.getBoundingClientRect()
    if (!isDragging) return
    width.set(Math.min(e.clientX - startX, viewportRect.width - startX))
    height.set(Math.min(e.clientY - startY, viewportRect.height + toolbarRect.height - startY))
  }
  const handleMouseUp = (e: React.MouseEvent) => {
    // width.set(e.clientX - startX)
    // height.set(e.clientY - startY)
    setIsDragging(false)
    if (getMutableState(selectionBox).selectionBoxEnabled.value) {
      updateSelectionEntity()
    }
  }
  const updateSelectionEntity = () => {
    const viewportRect = viewportRef.current!.getBoundingClientRect()
    const ndcX1 = (left / viewportRect.width) * 2 - 1
    const ndcX2 = ((left + width.value) / viewportRect.width) * 2 - 1
    const ndcY1 = 1 - (top / viewportRect.height) * 2
    const ndcY2 = 1 - ((top + height.value) / viewportRect.height) * 2
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    const selectedUUIDs = [] as EntityUUID[]
    // convert NDC points to world space (for both near and far planes)
    const p1Near = new Vector3(ndcX1, ndcY1, -1).unproject(camera) // top-left near
    const p2Near = new Vector3(ndcX2, ndcY1, -1).unproject(camera) // top-right near
    const p3Near = new Vector3(ndcX1, ndcY2, -1).unproject(camera) // bottom-left near
    const p4Near = new Vector3(ndcX2, ndcY2, -1).unproject(camera) // bottom-right near

    const p1Far = new Vector3(ndcX1, ndcY1, 1).unproject(camera) // top-left far
    const p2Far = new Vector3(ndcX2, ndcY1, 1).unproject(camera) // top-right far
    const p3Far = new Vector3(ndcX1, ndcY2, 1).unproject(camera) // bottom-left far
    const p4Far = new Vector3(ndcX2, ndcY2, 1).unproject(camera) // bottom-right far

    // construct the frustum with six planes
    const frustum = new Frustum(
      new Plane().setFromCoplanarPoints(p1Near, p2Near, p3Near), // Near plane
      new Plane().setFromCoplanarPoints(p1Far, p2Far, p3Far), // Far plane
      new Plane().setFromCoplanarPoints(p1Near, p1Far, p3Far), // Left plane
      new Plane().setFromCoplanarPoints(p2Near, p2Far, p4Far), // Right plane
      new Plane().setFromCoplanarPoints(p1Near, p2Near, p2Far), // Top plane
      new Plane().setFromCoplanarPoints(p3Near, p4Near, p4Far) // Bottom plane
    )

    const parentEntity = getState(EditorState).rootEntity
    iterateEntityNode(parentEntity, (entity) => {
      if (hasComponent(entity, ModelComponent)) {
        const scene = getComponent(entity, ModelComponent).scene
        if (!scene) return {}
        scene.traverse((mesh: Mesh) => {
          if (!mesh.isMesh) return
          if (frustum.intersectsObject(mesh)) {
            selectedUUIDs.push(getComponent(entity, UUIDComponent))
          }
        })
      }
    })

    SelectionState.updateSelection(selectedUUIDs)
  }
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any)
    document.addEventListener('mouseup', handleMouseUp as any)
    document.addEventListener('mousedown', handleMouseDown as any)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any)
      document.removeEventListener('mouseup', handleMouseUp as any)
      document.removeEventListener('mousedown', handleMouseDown as any)
    }
  }, [isDragging])
  return (
    <div className="relative h-full w-full">
      {getMutableState(selectionBox).selectionBoxEnabled.value && isDragging && (
        <div
          className="absolute z-[5] flex flex-col items-center border-2 border-dashed border-white bg-transparent"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${width.value}px`,
            height: `${height.value}px`
          }}
        />
      )}
      {/* )} */}
    </div>
  )
}
