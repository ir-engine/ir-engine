import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { Component, ComponentType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { iterateEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'

import { setPropertyOnSelectionEntities } from '../../classes/History'

export type EditorPropType = {
  node: EntityTreeNode
  component?: Component
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

export const updateProperty = <C extends Component, K extends keyof ComponentType<C>>(
  component: C,
  propName: K,
  ...args: any
) => {
  return (value: ComponentType<C>[K]) => {
    setPropertyOnSelectionEntities({
      component,
      properties: [{ [propName]: value, ...args }]
    })
  }
}

export function traverseScene<T>(
  callback: (node: EntityTreeNode) => T,
  predicate: (node: EntityTreeNode) => boolean = () => true,
  snubChildren: boolean = false,
  world: World = Engine.instance.currentWorld
): T[] {
  const result: T[] = []
  iterateEntityNode(
    world.entityTree.rootNode,
    (node) => result.push(callback(node)),
    predicate,
    world.entityTree,
    snubChildren
  )
  return result
}
