import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent, getOptionalComponent, setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

const namePattern = new RegExp('(.*) \\d+$')

function getNameWithoutIndex(name) {
  let cacheName = name
  const match = namePattern.exec(name)
  if (match) {
    cacheName = match[1]
  }
  return cacheName
}

export default function makeUniqueName(node: Entity) {
  let counter = 0

  const nodeNameComp = getComponent(node, NameComponent)
  const nameWithoutIndex = getNameWithoutIndex(nodeNameComp)

  const world = Engine.instance.currentWorld

  traverseEntityNode(world.sceneEntity, (child) => {
    if (child === node) return

    const nameComponent = getOptionalComponent(child, NameComponent)

    if (!nameComponent || !nameComponent?.startsWith(nameWithoutIndex)) return

    const parts = nameComponent.split(nameWithoutIndex)

    if (parts[0]) return // if child's name starts with given object's name then first part will be empty string ('')

    // Second part of the name will be empty string ('') for first child which name does not have '1' suffix
    const num = parts[1] ? parseInt(parts[1]) : 1

    if (num > counter) {
      counter = num
    }
  })

  setComponent(node, NameComponent, nameWithoutIndex + (counter > 0 ? ' ' + (counter + 1) : ''))
}
