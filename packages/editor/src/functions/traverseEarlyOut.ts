import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID, EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'

export default function traverseEarlyOut(node: EntityOrObjectUUID, cb: (node: EntityOrObjectUUID) => boolean): boolean {
  let stopTravel = cb(node)

  if (stopTravel) return stopTravel

  const entityTreeComponent = getComponent(node as Entity, EntityTreeComponent)

  const children = entityTreeComponent.children
  if (!children) return stopTravel

  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    if (child) {
      stopTravel = traverseEarlyOut(child, cb)
      if (stopTravel) break
    }
  }

  return stopTravel
}
