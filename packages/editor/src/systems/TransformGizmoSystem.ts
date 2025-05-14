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

import { useEffect } from 'react'

import { getComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'

import { EngineState, Entity } from '@ir-engine/ecs'
import { getState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { SnapMode } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import {
  filterEntitiesByViewer,
  InputHeuristicState,
  IntersectionData
} from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { MathUtils, Raycaster, Vector3 } from 'three'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'

/**Editor InputComponent raycast query */
const inputObjectsQuery = defineQuery([InputComponent, VisibleComponent, ObjectComponent])
const gizmoPickerObjectsQuery = defineQuery([
  InputComponent,
  ObjectComponent,
  VisibleComponent,
  TransformGizmoTagComponent
])

//prevent query from detecting CameraGizmoVisualEntity which has no ObjectComponent but has CameraGizmoTagComponent
const cameraGizmoQuery = defineQuery([CameraGizmoTagComponent, InputComponent, VisibleComponent, ObjectComponent])

const raycaster = new Raycaster()
raycaster.layers.enable(ObjectLayers.Gizmos)

export function editorInputHeuristic(
  viewerEntity: Entity,
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) {
  const isEditing = getState(EngineState).isEditing
  if (!isEditing) return

  const gizmoEnabled = getState(EditorHelperState).gizmoEnabled
  if (!gizmoEnabled) return

  raycaster.set(position, direction)

  const pickerObj = gizmoPickerObjectsQuery() // gizmo heuristic
  const cameraGizmo = cameraGizmoQuery() //camera gizmo heuristic

  //concatenating cameraGizmo to both pickerObjects(transformGizmo) and inputObjects
  const inputObj = [] as Entity[]

  const objects = (
    pickerObj.length > 0
      ? inputObj.concat(cameraGizmo).concat(pickerObj)
      : inputObj.concat(inputObjectsQuery()).concat(cameraGizmo)
  ) // gizmo heuristic
    .filter((eid) => filterEntitiesByViewer(eid, viewerEntity))
    .map((eid) => getComponent(eid, ObjectComponent))

  //camera gizmos layer should always be active here, since it doesn't disable based on transformGizmo existing
  pickerObj.length > 0
    ? raycaster.layers.enable(ObjectLayers.TransformGizmo)
    : raycaster.layers.disable(ObjectLayers.TransformGizmo)

  const hits = raycaster.intersectObjects(objects, true)
  for (const hit of hits) {
    intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
  }
}

const useTransformGizmoControl = (entities: Entity[]) => {
  const gizmoEntity = TransformGizmoControlComponent.useControlEntities(entities)
  const gizmoControlComponent = useOptionalComponent(gizmoEntity, TransformGizmoControlComponent)
  const editorHelperState = useMutableState(EditorHelperState)

  useImmediateEffect(() => {
    editorHelperState.transformGizmoEntity.set(gizmoEntity)
  }, [gizmoEntity])

  useImmediateEffect(() => {
    if (!gizmoControlComponent) return
    const mode = editorHelperState.transformMode.value
    gizmoControlComponent.mode.set(mode)
  }, [gizmoEntity, editorHelperState.transformMode])

  useImmediateEffect(() => {
    if (!gizmoControlComponent) return
    const space = editorHelperState.transformSpace.value
    gizmoControlComponent.space.set(space)
  }, [gizmoEntity, editorHelperState.transformSpace])

  useImmediateEffect(() => {
    if (!gizmoControlComponent) return
    gizmoControlComponent.transformPivot.set(editorHelperState.transformPivot.value)
  }, [gizmoEntity, editorHelperState.transformPivot])

  useEffect(() => {
    if (!gizmoControlComponent) return
    switch (editorHelperState.gridSnap.value) {
      case SnapMode.Disabled: // continous update
        gizmoControlComponent.translationSnap.set(0)
        gizmoControlComponent.rotationSnap.set(0)
        gizmoControlComponent.scaleSnap.set(0)
        break
      case SnapMode.Grid:
        gizmoControlComponent.translationSnap.set(editorHelperState.translationSnap.value)
        gizmoControlComponent.rotationSnap.set(MathUtils.degToRad(editorHelperState.rotationSnap.value))
        gizmoControlComponent.scaleSnap.set(editorHelperState.scaleSnap.value)
        break
    }
  }, [gizmoEntity, editorHelperState.gridSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    gizmoControlComponent.translationSnap.set(
      editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.translationSnap.value : 0
    )
  }, [gizmoEntity, editorHelperState.translationSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    gizmoControlComponent.rotationSnap.set(
      editorHelperState.gridSnap.value === SnapMode.Grid ? MathUtils.degToRad(editorHelperState.rotationSnap.value) : 0
    )
  }, [gizmoEntity, editorHelperState.rotationSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    gizmoControlComponent.scaleSnap.set(
      editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.scaleSnap.value : 0
    )
  }, [gizmoEntity, editorHelperState.scaleSnap])
}

const reactor = () => {
  useEffect(() => {
    InputHeuristicState.addHeuristic(1, editorInputHeuristic)
  }, [])

  const selectedEntities = SelectionState.useSelectedEntities()

  useTransformGizmoControl(selectedEntities)

  return null
}

export const TransformGizmoSystem = defineSystem({
  uuid: 'ee.editor.TransformGizmoSystem',
  insert: { with: InputSystemGroup },
  reactor
})
