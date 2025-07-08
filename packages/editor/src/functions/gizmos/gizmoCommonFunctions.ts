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

import { EngineState, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { IntersectionData } from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { Object3D, Raycaster, Vector3 } from 'three'
import { EditorHelperState } from '../../services/EditorHelperState'

export function intersectObjectWithRay(object: Object3D, raycaster: Raycaster, includeInvisible?: boolean) {
  const allIntersections = raycaster.intersectObject(object, true)

  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i]
    }
  }

  return false
}

// not used anywhere in the PR, template function for crating future gizmo heuristics
export function templateGizmoInputHeuristic(gizmoInputRaycast: Raycaster, gizmoObjectQuery: any) {
  const gizmoInputHeuristic = (intersectionData: Set<IntersectionData>, position: Vector3, direction: Vector3) => {
    const isEditing = getState(EngineState).isEditing
    if (!isEditing) return

    const gizmoEnabled = getState(EditorHelperState).gizmoEnabled
    if (!gizmoEnabled) return

    gizmoInputRaycast.set(position, direction)

    const objects = gizmoObjectQuery().map((eid) => getComponent(eid, ObjectComponent))

    const hits = gizmoInputRaycast.intersectObjects(objects, true)
    for (const hit of hits) {
      intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
    }
  }

  return gizmoInputHeuristic
}

export function getCameraFactor(
  position: Vector3,
  size,
  multiplier = 0.3,
  camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
) {
  if (!camera) return size * multiplier
  const factor = (camera as any).isOrthographicCamera
    ? ((camera as any).top - (camera as any).bottom) / camera.zoom
    : position.distanceTo(camera.position) * Math.min((1.9 * Math.tan((Math.PI * camera.fov) / 360)) / camera.zoom, 7)
  return factor * size * multiplier
}
