/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Object3D } from 'three'

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
