import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

export default function traverseEarlyOut(node: EntityTreeNode, cb: (node: EntityTreeNode) => boolean): boolean {
  let stopTravel = cb(node)

  if (stopTravel) return stopTravel

  const children = node.children
  if (!children) return stopTravel

  for (let i = 0; i < children.length; i++) {
    stopTravel = traverseEarlyOut(children[i], cb)
    if (stopTravel) break
  }

  return stopTravel
}
