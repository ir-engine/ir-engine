import { Object3D } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'

export type HeirarchyTreeNodeType = {
  depth: number
  entityNode: EntityTreeNode
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
  treeNode: EntityTreeNode,
  selectedEntities: (Entity | string)[],
  collapsedNodes: HeirarchyTreeCollapsedNodeType,
  tree = Engine.instance.currentWorld.entityTree
): Generator<HeirarchyTreeNodeType> {
  if (!treeNode) return

  const stack = [] as HeirarchyTreeNodeType[]

  stack.push({ depth: 0, entityNode: treeNode, childIndex: 0, lastChild: true })

  while (stack.length !== 0) {
    const { depth, entityNode, childIndex, lastChild } = stack.pop() as HeirarchyTreeNodeType
    const isCollapsed = collapsedNodes[entityNode.entity]

    yield {
      isLeaf: !entityNode.children || entityNode.children.length === 0,
      isCollapsed,
      depth,
      entityNode: entityNode,
      selected: selectedEntities.includes(entityNode.entity),
      active: selectedEntities.length > 0 && entityNode.entity === selectedEntities[selectedEntities.length - 1],
      childIndex,
      lastChild
    }

    if (entityNode.children && entityNode.children.length !== 0 && !isCollapsed) {
      for (let i = entityNode.children.length - 1; i >= 0; i--) {
        const node = tree.entityNodeMap.get(entityNode.children[i])

        if (node) {
          stack.push({
            depth: depth + 1,
            entityNode: node,
            childIndex: i,
            lastChild: i === 0
          })
        }
      }
    }
  }
}
