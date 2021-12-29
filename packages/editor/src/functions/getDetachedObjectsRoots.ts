import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import traverseEarlyOut from './traverseEarlyOut'

export function getDetachedObjectsRoots(objects: EntityTreeNode[], target: EntityTreeNode[] = []): EntityTreeNode[] {
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
      const index = target.indexOf(object)
      if (index === -1) throw new Error('Object not found')

      target.splice(index, 1)
    }
  }

  return target
}

export const isAncestor = (parent: EntityTreeNode, potentialChild: EntityTreeNode): boolean => {
  if (parent === potentialChild) return false
  return traverseEarlyOut(parent, (child) => child === potentialChild)
}
