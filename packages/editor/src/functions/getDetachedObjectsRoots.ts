import { Object3D } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  EntityOrObjectUUID,
  EntityTreeComponent,
  findIndexOfEntityNode
} from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { Object3DWithEntity } from '@etherealengine/engine/src/scene/components/GroupComponent'
import obj3dFromUuid from '@etherealengine/engine/src/scene/util/obj3dFromUuid'

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
  const world = Engine.instance.currentScene
  let obj3d = obj3dFromUuid(uuid) as Object3DWithEntity
  while (obj3d) {
    if (
      obj3d.entity !== undefined &&
      getOptionalComponent(obj3d.entity, EntityTreeComponent)?.rootEntity === world.sceneEntity
    )
      return obj3d.entity
    obj3d = obj3d.parent as Object3DWithEntity
  }
  throw new Error('no Entity Node found')
}
