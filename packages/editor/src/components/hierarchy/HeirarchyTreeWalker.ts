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

import { getComponent, hasComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { entityExists } from '@etherealengine/ecs/src/EntityFunctions'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { getState } from '@etherealengine/hyperflux'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { EditorState } from '../../services/EditorServices'

export type HeirarchyTreeNodeType = {
  depth: number
  entity: Entity
  childIndex: number
  lastChild: boolean
  isLeaf?: boolean
  isCollapsed?: boolean
}

export type HeirarchyTreeCollapsedNodeType = { [key: number]: boolean }

export function gltfSnapshotTreeWalker(snapshot): HeirarchyTreeNodeType[] {
  const tree = []

  for (let i = 0; i < snapshot.nodes.length; i++) {
    const node = snapshot.nodes[i]
    console.log(node)
  }

  return []
}

/**
 * treeWalker function used to handle tree.
 *
 * @param  {entityNode}    expandedNodes
 */

export function* heirarchyTreeWalker(sceneID: string, treeNode: Entity): Generator<HeirarchyTreeNodeType> {
  if (!treeNode) return

  const stack = [] as HeirarchyTreeNodeType[]

  stack.push({ depth: 0, entity: treeNode, childIndex: 0, lastChild: true })

  while (stack.length !== 0) {
    const { depth, entity: entityNode, childIndex, lastChild } = stack.pop() as HeirarchyTreeNodeType

    if (!entityExists(entityNode)) continue
    if (!hasComponent(entityNode, SourceComponent)) continue

    const expandedNodes = getState(EditorState).expandedNodes

    const isCollapsed = !expandedNodes[sceneID]?.[entityNode]

    const entityTreeComponent = getComponent(entityNode as Entity, EntityTreeComponent)

    // treat entites with all helper children as leaf nodes
    const allhelperChildren = entityTreeComponent.children.every((child) => !hasComponent(child, SourceComponent))

    yield {
      isLeaf: entityTreeComponent.children.length === 0 || allhelperChildren,
      isCollapsed,
      depth,
      entity: entityNode,
      childIndex,
      lastChild
    }

    if (entityTreeComponent.children.length !== 0 && !isCollapsed) {
      for (let i = entityTreeComponent.children.length - 1; i >= 0; i--) {
        const childEntity = entityTreeComponent.children[i]
        if (hasComponent(childEntity, SourceComponent)) {
          stack.push({
            depth: depth + 1,
            entity: childEntity,
            childIndex: i,
            lastChild: i === 0
          })
        }
      }
    }
  }
}
