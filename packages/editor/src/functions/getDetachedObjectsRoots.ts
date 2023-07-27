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

import { Object3D } from 'three'

import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { getOptionalComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  EntityOrObjectUUID,
  EntityTreeComponent,
  findIndexOfEntityNode
} from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { Object3DWithEntity } from '@etherealengine/engine/src/scene/components/GroupComponent'
import obj3dFromUuid from '@etherealengine/engine/src/scene/util/obj3dFromUuid'
import { getState } from '@etherealengine/hyperflux'

import traverseEarlyOut from './traverseEarlyOut'

// Returns an array of objects that are not ancestors of any other objects in the array.
export function getDetachedObjectsRoots(
  objects: EntityOrObjectUUID[],
  target: EntityOrObjectUUID[] = []
): EntityOrObjectUUID[] {
  // Initially all objects are candidates
  for (let i = 0; i < objects.length; i++) target.push(objects[i])

  // For each object check if it is an ancestor of any of the other objects.
  // If so reject that object and remove it from the candidate array.
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i]
    let validCandidate = true

    for (let j = 0; j < target.length; j++) {
      if (isAncestor(target[j], object)) {
        validCandidate = false
        break
      }
    }

    if (!validCandidate) {
      const index = findIndexOfEntityNode(target, object)
      if (index === -1) throw new Error('Object not found')

      target.splice(index, 1)
    }
  }

  return target
}

export const isAncestor = (parent: EntityOrObjectUUID, potentialChild: EntityOrObjectUUID): boolean => {
  if (!potentialChild) return false
  if (parent === potentialChild) return false
  let parentNode: EntityOrObjectUUID
  let childNode: EntityOrObjectUUID
  if (typeof parent === 'string' && typeof potentialChild === 'string') {
    parentNode = getEntityNode(parent)
    childNode = getEntityNode(potentialChild)
    if (parentNode !== childNode) return isAncestor(parentNode, childNode)
    //iterate to root for child node, checking for parent
    let walker: Object3D | null = obj3dFromUuid(potentialChild)
    let target = obj3dFromUuid(parent)
    while (walker) {
      if (walker === target) return true
      walker = walker.parent
    }
    return false
  } else if (typeof parent === 'string') {
    //child is implicitly an EntityTree entity
    parentNode = getEntityNode(parent)
    return isAncestor(parentNode, potentialChild)
  } else if (typeof potentialChild === 'string') {
    //parent is implicitly an EntityTree entity
    childNode = getEntityNode(potentialChild)
    return isAncestor(parent, childNode)
  }
  if (parent === potentialChild) return false
  return traverseEarlyOut(parent, (child) => child === potentialChild)
}

const getEntityNode = (uuid: string) => {
  const sceneEntity = getState(SceneState).sceneEntity
  let obj3d = obj3dFromUuid(uuid) as Object3DWithEntity
  while (obj3d) {
    if (
      obj3d.entity !== undefined &&
      getOptionalComponent(obj3d.entity, EntityTreeComponent)?.rootEntity === sceneEntity
    )
      return obj3d.entity
    obj3d = obj3d.parent as Object3DWithEntity
  }
  throw new Error('no Entity Node found')
}
