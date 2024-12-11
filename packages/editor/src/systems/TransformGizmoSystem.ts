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

import { useEffect } from 'react'

import { getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'

import { getMutableState, getState } from '@ir-engine/hyperflux'
import { Object3DUtils } from '@ir-engine/spatial'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputHeuristicState, IntersectionData } from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Object3D, Raycaster, Vector3 } from 'three'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { TransformGizmoControlledComponent } from '../classes/gizmo/transform/TransformGizmoControlledComponent'
import { controlUpdate, gizmoUpdate, planeUpdate } from '../functions/transformGizmoHelper'
import { SelectionState } from '../services/SelectionServices'

const sourceQuery = defineQuery([SourceComponent, TransformGizmoControlledComponent])
export const transformGizmoControllerQuery = defineQuery([TransformGizmoControlComponent])
export const transformGizmoControlledQuery = defineQuery([TransformGizmoControlledComponent])

const execute = () => {
  for (const gizmoEntity of transformGizmoControllerQuery()) {
    const gizmoControlComponent = getComponent(gizmoEntity, TransformGizmoControlComponent)
    if (!gizmoControlComponent.enabled) return

    if (!gizmoControlComponent.visualEntity) return
    gizmoUpdate(gizmoEntity)
    if (!gizmoControlComponent.planeEntity) return
    planeUpdate(gizmoEntity)
    controlUpdate(gizmoEntity)
  }
}

/**Editor InputComponent raycast query */
const inputObjectsQuery = defineQuery([InputComponent, VisibleComponent, GroupComponent])
const gizmoPickerObjectsQuery = defineQuery([
  InputComponent,
  GroupComponent,
  VisibleComponent,
  TransformGizmoTagComponent
])

//prevent query from detecting CameraGizmoVisualEntity which has no GroupComponent but has CameraGizmoTagComponent
const cameraGizmoQuery = defineQuery([CameraGizmoTagComponent, InputComponent, VisibleComponent, GroupComponent])

const raycaster = new Raycaster()
raycaster.layers.enable(ObjectLayers.Gizmos)

export function editorInputHeuristic(intersectionData: Set<IntersectionData>, position: Vector3, direction: Vector3) {
  const isEditing = getState(EngineState).isEditing
  if (!isEditing) return

  raycaster.set(position, direction)

  const [...pickerObj] = gizmoPickerObjectsQuery() // gizmo heuristic
  const [...cameraGizmo] = cameraGizmoQuery() //camera gizmo heuristic

  //concatenating cameraGizmo to both pickerObjects(transformGizmo) and inputObjects
  const allGizmos = cameraGizmo.concat(pickerObj)
  const inputObj = [...inputObjectsQuery()].concat(cameraGizmo)

  const objects = (pickerObj.length > 0 ? allGizmos : inputObj) // gizmo heuristic
    .map((eid) => getComponent(eid, GroupComponent))
    .flat()

  //camera gizmos layer should always be active here, since it doesn't disable based on transformGizmo existing
  pickerObj.length > 0
    ? raycaster.layers.enable(ObjectLayers.TransformGizmo)
    : raycaster.layers.disable(ObjectLayers.TransformGizmo)

  const hits = raycaster.intersectObjects<Object3D>(objects, true)
  for (const hit of hits) {
    const parentObject = Object3DUtils.findAncestor(hit.object, (obj) => !obj.parent)
    if (parentObject?.entity) {
      intersectionData.add({ entity: parentObject.entity, distance: hit.distance })
    }
  }
}

const reactor = () => {
  useEffect(() => {
    getMutableState(InputHeuristicState).merge([
      {
        order: 1,
        heuristic: editorInputHeuristic
      }
    ])
  }, [])

  const selectedEntities = SelectionState.useSelectedEntities()

  for (const entity of sourceQuery()) removeComponent(entity, TransformGizmoControlledComponent)

  useEffect(() => {
    if (!selectedEntities) return
    const lastSelection = selectedEntities[selectedEntities.length - 1]
    if (!lastSelection) return
    setComponent(lastSelection, TransformGizmoControlledComponent)
  }, [selectedEntities])

  return null
}

export const TransformGizmoSystem = defineSystem({
  uuid: 'ee.editor.TransformGizmoSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor
})
