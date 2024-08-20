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

import { Camera, Intersection, Mesh, Object3D, Raycaster, Vector2 } from 'three'

import { defineQuery } from '@ir-engine/ecs'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'

import { SelectionState } from '../services/SelectionServices'

type RaycastIntersectionNode = Intersection<Object3D> & {
  obj3d: Object3D
  node?: Entity
}

function getParentEntity(obj: Object3D): Object3D {
  let curObj = obj

  while (curObj) {
    if (curObj.entity) break
    curObj = curObj.parent! as Object3D
  }

  return curObj
}

export function getIntersectingNode(results: Intersection<Object3D>[]): RaycastIntersectionNode | undefined {
  if (results.length <= 0) return
  const selectionState = getState(SelectionState)
  const selected = new Set<string | Entity>(selectionState.selectedEntities)
  for (const result of results as RaycastIntersectionNode[]) {
    const obj = result.object //getParentEntity(result.object)
    const parentNode = getParentEntity(obj)
    if (!parentNode) continue //skip obj3ds that are not children of EntityNodes
    if (!obj.entity && parentNode && !selected.has(parentNode.entity)) {
      result.node = parentNode.entity
      result.obj3d = getComponent(parentNode.entity, GroupComponent)[0] as Object3D
      return result
    }

    if (obj) {
      result.obj3d = obj
      result.node = obj.entity
      //if(result.node && hasComponent(result.node.entity, GroupComponent))
      //result.obj3d = result.object
      //result.node = result.object.uuid
      return result
    }
  }
}

export const getIntersectingNodeOnScreen = (
  raycaster: Raycaster,
  coord: Vector2,
  target: Intersection<Object3D>[] = [],
  camera: Camera = getComponent(Engine.instance.cameraEntity, CameraComponent),
  object?: Object3D,
  recursive = true
): RaycastIntersectionNode | undefined => {
  raycaster.setFromCamera(coord, camera)
  raycaster.layers.enable(ObjectLayers.NodeHelper)
  raycaster.intersectObjects(
    object ? ([object] as Mesh[]) : (allMeshes().map((e) => getComponent(e, MeshComponent)) as Mesh[]),
    recursive,
    target as Intersection<Object3D>[]
  )
  raycaster.layers.disable(ObjectLayers.NodeHelper)
  return getIntersectingNode(target as Intersection<Object3D>[])
}

const allMeshes = defineQuery([MeshComponent])
