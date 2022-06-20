import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { ComponentConstructor, ComponentType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { iterateEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'

import { setPropertyOnSelectionEntities } from '../../classes/History'

export type EditorPropType = {
  node: EntityTreeNode
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

export const updateProperty = <C extends ComponentConstructor<any, any>, K extends keyof ComponentType<C>>(
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
