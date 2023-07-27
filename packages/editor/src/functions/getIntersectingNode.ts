/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Camera, Intersection, Object3D, Raycaster, Vector2 } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID, getEntityNodeArrayFromEntities } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { GroupComponent, Object3DWithEntity } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { getState } from '@etherealengine/hyperflux'

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { SelectionState } from '../services/SelectionServices'

type RaycastIntersectionNode = Intersection<Object3DWithEntity> & {
  obj3d: Object3DWithEntity
  node?: EntityOrObjectUUID
}

function getParentEntity(obj: Object3DWithEntity): Object3DWithEntity {
  let curObj = obj

  while (curObj) {
    if (curObj.entity) break
    curObj = curObj.parent! as Object3DWithEntity
  }

  return curObj
}

export function getIntersectingNode(results: Intersection<Object3DWithEntity>[]): RaycastIntersectionNode | undefined {
  if (results.length <= 0) return
  const selectionState = getState(SelectionState)
  const selected = new Set<string | Entity>(selectionState.selectedEntities)
  for (const result of results as RaycastIntersectionNode[]) {
    const obj = result.object //getParentEntity(result.object)
    const parentNode = getParentEntity(obj)
    if (!parentNode) continue //skip obj3ds that are not children of EntityNodes
    if (!obj.entity && parentNode && !selected.has(parentNode.entity)) {
      result.node = getEntityNodeArrayFromEntities([parentNode.entity])[0]
      result.obj3d = getComponent(parentNode.entity, GroupComponent)[0] as Object3DWithEntity
      return result
    }

    if (obj && (obj as Object3D) !== Engine.instance.scene) {
      result.obj3d = obj
      result.node = obj.entity ?? obj.uuid
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
  recursive: boolean = true
): RaycastIntersectionNode | undefined => {
  raycaster.setFromCamera(coord, camera)
  raycaster.layers.enable(ObjectLayers.NodeHelper)
  raycaster.intersectObject<Object3DWithEntity>(
    object ?? Engine.instance.scene,
    recursive,
    target as Intersection<Object3DWithEntity>[]
  )
  raycaster.layers.disable(ObjectLayers.NodeHelper)
  return getIntersectingNode(target as Intersection<Object3DWithEntity>[])
}
