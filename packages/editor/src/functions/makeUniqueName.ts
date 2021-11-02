import EntityTree, { TreeNode } from "@xrengine/engine/src/ecs/classes/EntityTree"
import { getComponent } from "@xrengine/engine/src/ecs/functions/ComponentFunctions"
import { NameComponent } from "@xrengine/engine/src/scene/components/NameComponent"

const namePattern = new RegExp('(.*) \\d+$')

function getNameWithoutIndex(name) {
  let cacheName = name
  const match = namePattern.exec(name)
  if (match) {
    cacheName = match[1]
  }
  return cacheName
}

export default function makeUniqueName(object: TreeNode, entityTree: EntityTree) {
  let counter = 0
  const nameComponent = getComponent(object.eid, NameComponent)
  const nameWithoutIndex = getNameWithoutIndex(nameComponent.name)

  entityTree.traverse((child) => {
    if (child === object) return

    const nameComponent = getComponent(child.eid, NameComponent)
    if (!nameComponent.name.startsWith(nameWithoutIndex)) return

    const parts = nameComponent.name.split(nameWithoutIndex)

    if (parts[0]) return // if child's name starts with given object's name then first part will be empty string ('')

    // Second part of the name will be empty string ('') for first child which name does not have '1' suffix
    const num = parts[1] ? parseInt(parts[1]) : 1

    if (num > counter) {
      counter = num
    }
  })

  nameComponent.name = nameWithoutIndex + (counter > 0 ? ' ' + (counter + 1) : '')
}
