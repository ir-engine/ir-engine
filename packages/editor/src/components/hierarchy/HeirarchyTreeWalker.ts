import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { CommandManager } from '../../managers/CommandManager'

export type HeirarchyTreeNodeType = {
  depth: number
  entityNode: EntityTreeNode
  childIndex: number
  lastChild: boolean
  isLeaf?: boolean
  isCollapsed?: boolean
  selected?: boolean
  active?: boolean
}

export type HeirarchyTreeCollapsedNodeType = { [key: number]: boolean }

/**
 * treeWalker function used to handle tree.
 *
 * @author Robert Long
 * @param  {entityNode}    collapsedNodes
 */
export function* heirarchyTreeWalker(
  treeNode: EntityTreeNode,
  collapsedNodes: HeirarchyTreeCollapsedNodeType
): Generator<HeirarchyTreeNodeType> {
  if (!treeNode) return

  const stack = [] as HeirarchyTreeNodeType[]
  const selected = CommandManager.instance.selected

  stack.push({ depth: 0, entityNode: treeNode, childIndex: 0, lastChild: true })

  while (stack.length !== 0) {
    const { depth, entityNode, childIndex, lastChild } = stack.pop() as HeirarchyTreeNodeType
    const isCollapsed = collapsedNodes[entityNode.entity]

    yield {
      isLeaf: !entityNode.children || entityNode.children.length === 0,
      isCollapsed,
      depth,
      entityNode: entityNode,
      selected: selected.indexOf(entityNode) !== -1,
      active: selected.length > 0 && entityNode === selected[selected.length - 1],
      childIndex,
      lastChild
    }

    if (entityNode.children && entityNode.children.length !== 0 && !isCollapsed) {
      for (let i = entityNode.children.length - 1; i >= 0; i--) {
        stack.push({
          depth: depth + 1,
          entityNode: entityNode.children[i],
          childIndex: i,
          lastChild: i === 0
        })
      }
    }
  }
}
