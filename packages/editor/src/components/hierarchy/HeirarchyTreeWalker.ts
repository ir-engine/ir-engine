import { Object3D } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent, hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID, EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'

export type HeirarchyTreeNodeType = {
  depth: number
  entityNode: EntityOrObjectUUID
  childIndex: number
  lastChild: boolean
  /**
   * @param obj3d is used for exploding models, it will eventually be replaced when
   *   the scene graph is implemented on the ECS instead of threejs
   */
  obj3d?: Object3D
  isLeaf?: boolean
  isCollapsed?: boolean
  selected?: boolean
  active?: boolean
}

export type HeirarchyTreeCollapsedNodeType = { [key: number]: boolean }

/**
 * treeWalker function used to handle tree.
 *
 * @param  {entityNode}    collapsedNodes
 */
export function* heirarchyTreeWalker(
  treeNode: EntityOrObjectUUID,
  selectedEntities: (Entity | string)[],
  collapsedNodes: HeirarchyTreeCollapsedNodeType
): Generator<HeirarchyTreeNodeType> {
  if (!treeNode) return

  const stack = [] as HeirarchyTreeNodeType[]

  stack.push({ depth: 0, entityNode: treeNode, childIndex: 0, lastChild: true })

  while (stack.length !== 0) {
    const { depth, entityNode, childIndex, lastChild } = stack.pop() as HeirarchyTreeNodeType
    const isCollapsed = collapsedNodes[entityNode]

    const entityTreeComponent = getComponent(entityNode as Entity, EntityTreeComponent)

    yield {
      isLeaf: entityTreeComponent.children.length === 0,
      isCollapsed,
      depth,
      entityNode,
      selected: selectedEntities.includes(entityNode),
      active: selectedEntities.length > 0 && entityNode === selectedEntities[selectedEntities.length - 1],
      childIndex,
      lastChild
    }

    if (entityTreeComponent.children.length !== 0 && !isCollapsed) {
      for (let i = entityTreeComponent.children.length - 1; i >= 0; i--) {
        const node = hasComponent(entityTreeComponent.children[i], EntityTreeComponent)

        if (node) {
          stack.push({
            depth: depth + 1,
            entityNode: entityTreeComponent.children[i],
            childIndex: i,
            lastChild: i === 0
          })
        }
      }
    }
  }
}
