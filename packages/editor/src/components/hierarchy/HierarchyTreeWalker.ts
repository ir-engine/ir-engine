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

import { ComponentType, getComponent, hasComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { entityExists } from '@etherealengine/ecs/src/EntityFunctions'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { getState } from '@etherealengine/hyperflux'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { FeatureFlags } from '@etherealengine/common/src/constants/FeatureFlags'
import { UUIDComponent } from '@etherealengine/ecs'
import { FeatureFlagsState } from '@etherealengine/engine'
import { GLTFSnapshotState } from '@etherealengine/engine/src/gltf/GLTFState'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { getModelSceneID } from '@etherealengine/engine/src/scene/functions/loaders/ModelFunctions'
import { GLTF } from '@gltf-transform/core'
import { EditorState } from '../../services/EditorServices'

export type HierarchyTreeNodeType = {
  depth: number
  entity: Entity
  childIndex: number
  lastChild: boolean
  isLeaf?: boolean
  isCollapsed?: boolean
}

export type HierarchyTreeCollapsedNodeType = { [key: number]: boolean }

type NestedHierarchyTreeNode = HierarchyTreeNodeType & { children: NestedHierarchyTreeNode[] }

function isChild(index: number, nodes: GLTF.INode[]) {
  for (const node of nodes) {
    if (node.children && node.children.includes(index)) return true
  }

  return false
}

function buildHierarchyTree(
  depth: number,
  childIndex: number,
  node: GLTF.INode,
  nodes: GLTF.INode[],
  array: NestedHierarchyTreeNode[],
  lastChild: boolean,
  sceneID: string
) {
  const uuid = node.extensions && (node.extensions[UUIDComponent.jsonID] as ComponentType<typeof UUIDComponent>)
  const entity = UUIDComponent.getEntityByUUID(uuid!)

  const item = {
    depth,
    childIndex,
    entity: entity,
    isCollapsed: !getState(EditorState).expandedNodes[sceneID]?.[entity],
    children: [],
    isLeaf: !(node.children && node.children.length > 0),
    lastChild: lastChild
  }
  array.push(item)

  if (
    hasComponent(entity, ModelComponent) &&
    FeatureFlagsState.enabled(FeatureFlags.Studio.UI.Hierarchy.ShowModelChildren)
  ) {
    const modelSceneID = getModelSceneID(entity)
    const snapshotState = getState(GLTFSnapshotState)
    const snapshots = snapshotState[modelSceneID]
    if (snapshots) {
      const snapshotNodes = snapshots.snapshots[snapshots.index].nodes
      if (snapshotNodes && snapshotNodes.length > 0) {
        item.isLeaf = false
        if (!item.isCollapsed) buildHierarchyTreeForNodes(depth + 1, snapshotNodes, item.children, sceneID)
      }
    }
  }

  if (node.children && !item.isCollapsed) {
    for (let i = 0; i < node.children.length; i++) {
      const childIndex = node.children[i]
      buildHierarchyTree(depth + 1, i, nodes[childIndex], nodes, item.children, i === node.children.length - 1, sceneID)
    }
  }
}

function buildHierarchyTreeForNodes(depth: number, nodes: GLTF.INode[], outArray: NestedHierarchyTreeNode[], sceneID) {
  for (let i = 0; i < nodes.length; i++) {
    if (isChild(i, nodes)) continue
    buildHierarchyTree(depth, i, nodes[i], nodes, outArray, false, sceneID)
  }
  outArray[outArray.length - 1].lastChild = true
}

function flattenTree(array: NestedHierarchyTreeNode[], outArray: HierarchyTreeNodeType[]) {
  for (const item of array) {
    outArray.push({
      depth: item.depth,
      entity: item.entity,
      childIndex: item.childIndex,
      lastChild: item.lastChild,
      isLeaf: item.isLeaf,
      isCollapsed: item.isCollapsed
    })
    flattenTree(item.children, outArray)
  }
}

export function gltfHierarchyTreeWalker(rootEntity: Entity, nodes: GLTF.INode[]): HierarchyTreeNodeType[] {
  const outArray = [] as NestedHierarchyTreeNode[]

  const sceneID = getComponent(rootEntity, SourceComponent)
  const rootNode = {
    depth: 0,
    entity: rootEntity,
    childIndex: 0,
    lastChild: true,
    isCollapsed: !getState(EditorState).expandedNodes[sceneID]?.[rootEntity]
  }
  const tree = [rootNode] as HierarchyTreeNodeType[]

  if (!rootNode.isCollapsed) {
    buildHierarchyTreeForNodes(1, nodes, outArray, sceneID)
    flattenTree(outArray, tree)
  }

  return tree
}

/**
 * treeWalker function used to handle tree.
 *
 * @param  {entityNode}    expandedNodes
 */

export function* hierarchyTreeWalker(sceneID: string, treeNode: Entity): Generator<HierarchyTreeNodeType> {
  if (!treeNode) return

  const stack = [] as HierarchyTreeNodeType[]

  stack.push({ depth: 0, entity: treeNode, childIndex: 0, lastChild: true })

  while (stack.length !== 0) {
    const { depth, entity: entityNode, childIndex, lastChild } = stack.pop() as HierarchyTreeNodeType

    if (!entityExists(entityNode) || !hasComponent(entityNode, SourceComponent)) continue

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
