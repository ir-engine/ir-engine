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

import {
  Engine,
  EntityTreeComponent,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  getComponent,
  getOptionalComponent,
  getSimulationCounterpart,
  hasComponent,
  setComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { defineState, getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial/src/ReferenceSpaceState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  BoundingBoxComponent,
  updateBoundingBox
} from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'
import React from 'react'
import { Box2, Frustum, Plane, Vector2, Vector3 } from 'three'
import { EditorState } from '../../../services/EditorServices'
import { SelectionState } from '../../../services/SelectionServices'
export const SelectionBoxState = defineState({
  name: 'selectionBox State',
  initial: () => ({
    selectionBoxEnabled: false
  })
})

const _size = new Vector2()

export default function SelectionBox({
  viewportRef,
  toolbarRef
}: {
  viewportRef: React.RefObject<HTMLDivElement>
  toolbarRef: React.RefObject<HTMLDivElement>
}) {
  const start = useHookstate(() => new Vector2())
  const box = useHookstate(() => new Box2())
  const isDragging = useHookstate(false)

  const onPointerDown = (pointer: typeof InputPointerComponent._TYPE) => {
    start.set(pointer.position.clone())
  }

  const onPointerDrag = (pointer: typeof InputPointerComponent._TYPE) => {
    box.set(box.value.makeEmpty().expandByPoint(start.value).expandByPoint(pointer.position))
    isDragging.set(true)
  }

  const onPointerUp = (pointer: typeof InputPointerComponent._TYPE) => {
    isDragging.set(false)
    updateSelectionEntity()
  }

  const updateSelectionEntity = () => {
    const leftNDC = box.value.min.x
    // projection behavior breaks when width or height is 0, so we add a small epsilon
    const rightNDC = box.value.max.x + 0.001
    const topNDC = box.value.max.y + 0.001
    const bottomNDC = box.value.min.y
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    camera.updateMatrixWorld()
    camera.updateProjectionMatrix()
    let selectedUUIDs = [] as EntityUUID[]
    const p1Near = new Vector3(leftNDC, topNDC, -1).unproject(camera) // top-left near
    const p2Near = new Vector3(rightNDC, topNDC, -1).unproject(camera) // top-right near
    const p3Near = new Vector3(leftNDC, bottomNDC, -1).unproject(camera) // bottom-left near
    const p4Near = new Vector3(rightNDC, bottomNDC, -1).unproject(camera) // bottom-right near
    const p1Far = new Vector3(leftNDC, topNDC, 1).unproject(camera) // top-left far
    const p2Far = new Vector3(rightNDC, topNDC, 1).unproject(camera) // top-right far
    const p3Far = new Vector3(leftNDC, bottomNDC, 1).unproject(camera) // bottom-left far
    const p4Far = new Vector3(rightNDC, bottomNDC, 1).unproject(camera) // bottom-right far
    const nearPlane = new Plane().setFromCoplanarPoints(p1Near, p2Near, p4Near)
    const farPlane = new Plane().setFromCoplanarPoints(p1Far, p4Far, p2Far)
    const leftPlane = new Plane().setFromCoplanarPoints(p1Near, p3Near, p3Far)
    const rightPlane = new Plane().setFromCoplanarPoints(p4Far, p4Near, p2Far)
    const topPlane = new Plane().setFromCoplanarPoints(p1Near, p1Far, p2Near)
    const bottomPlane = new Plane().setFromCoplanarPoints(p3Near, p4Near, p4Far)

    // Construct the frustum
    const frustum = new Frustum(nearPlane, farPlane, leftPlane, rightPlane, topPlane, bottomPlane)
    const parentEntity = getState(EditorState).rootEntity
    const entities = getComponent(parentEntity, EntityTreeComponent).children
    entities.forEach((entity) => {
      const simulationEntity = getSimulationCounterpart(entity)
      if (simulationEntity !== UndefinedEntity) {
        if (
          hasComponent(simulationEntity, VisibleComponent) &&
          (hasComponent(simulationEntity, BoundingBoxComponent) ||
            hasComponent(simulationEntity, MeshComponent) ||
            hasComponent(simulationEntity, GLTFComponent))
        ) {
          setComponent(simulationEntity, BoundingBoxComponent)
          updateBoundingBox(simulationEntity)
          const boundingBox = getComponent(simulationEntity, BoundingBoxComponent).box
          const status = frustum.intersectsBox(boundingBox)
          if (status) {
            const uuid = getComponent(entity, UUIDComponent)
            if (!selectedUUIDs.includes(uuid)) {
              selectedUUIDs.push(uuid)
            }
          }
        }
      }
    })
    SelectionState.updateSelection(selectedUUIDs)
    selectedUUIDs = []
  }

  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value
  InputComponent.useExecuteWithInput(
    () => {
      if (!viewerEntity) return
      if (!getMutableState(SelectionBoxState).selectionBoxEnabled.value) {
        isDragging.set(false)
        return
      }

      const buttons = InputComponent.getButtons(viewerEntity)
      const pointer = getOptionalComponent(
        buttons.PrimaryClick?.inputSourceEntity || UndefinedEntity,
        InputPointerComponent
      )
      if (pointer && buttons?.PrimaryClick?.down) {
        onPointerDown(pointer)
      }
      if (pointer && buttons?.PrimaryClick?.dragging) {
        onPointerDrag(pointer)
      }
      if (pointer && buttons?.PrimaryClick?.up) {
        onPointerUp(pointer)
      }
    },
    InputExecutionOrder.With,
    true
  )

  const selectionBoxEnabled = useMutableState(SelectionBoxState).selectionBoxEnabled

  const vWidth = viewportRef.current?.clientWidth ?? 0
  const vHeight = viewportRef.current?.clientHeight ?? 0
  const left = ((box.value.min.x + 1) / 2) * vWidth
  const top = (1 - (box.value.max.y + 1) / 2) * vHeight - (toolbarRef.current?.clientHeight ?? 0)
  const size = box.value.getSize(_size)

  return (
    <div className="relative h-full w-full">
      {selectionBoxEnabled.value && isDragging.value && (
        <div
          className="absolute z-[5] flex touch-none flex-col items-center border-2 border-dashed border-white bg-transparent"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${(size.x / 2) * vWidth}px`,
            height: `${(size.y / 2) * vHeight}px`
          }}
        />
      )}
      {/* )} */}
    </div>
  )
}
