import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getOptionalComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'

const namePattern = new RegExp('(.*) \\d+$')

function getNameWithoutIndex(name) {
  let cacheName = name
  const match = namePattern.exec(name)
  if (match) {
    cacheName = match[1]
  }
  return cacheName
}

export function getUniqueName(node: Entity, templateName = 'New Object') {
  const nodeNameComp = getOptionalComponent(node, NameComponent) ?? templateName
  const nameWithoutIndex = getNameWithoutIndex(nodeNameComp)

  let empty = false
  let counter = 0

  while (!empty) {
    const name = nameWithoutIndex + (counter > 0 ? ' ' + (counter + 1) : '')
    if (!NameComponent.entitiesByName.value[name]?.length) {
      empty = true
      break
    }
    counter++
  }

  return nameWithoutIndex + (counter > 0 ? ' ' + (counter + 1) : '')
}
