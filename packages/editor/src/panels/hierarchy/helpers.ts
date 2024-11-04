/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { GLTF } from '@gltf-transform/core'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { Entity, entityExists, EntityUUID, getComponent, hasComponent, UUIDComponent } from '@ir-engine/ecs'
import { AllFileTypes } from '@ir-engine/engine/src/assets/constants/fileTypes'
import { GLTFSnapshotState } from '@ir-engine/engine/src/gltf/GLTFState'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getModelSceneID } from '@ir-engine/engine/src/scene/functions/loaders/ModelFunctions'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { t } from 'i18next'
import { CopyPasteFunctions } from '../../functions/CopyPasteFunctions'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { SelectionState } from '../../services/SelectionServices'

export type HierarchyTreeNodeType = {
  depth: number
  entity: Entity
  childIndex: number
  lastChild: boolean
  isLeaf?: boolean
  isCollapsed?: boolean
}

type NestedHierarchyTreeNode = HierarchyTreeNodeType & { children: NestedHierarchyTreeNode[] }

/* COMMON */

export const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

/** UTILITIES **/

/* NODE FUNCTIONALITIES */

const getSelectedEntities = (entity?: Entity) => {
  const selected = entity
    ? getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    : true
  const selectedEntities = selected ? SelectionState.getSelectedEntities() : [entity!]
  return selectedEntities
}

export const deleteNode = (entity: Entity) => {
  EditorControlFunctions.removeObject(getSelectedEntities(entity))
}

export const duplicateNode = (entity?: Entity) => {
  EditorControlFunctions.duplicateObject(getSelectedEntities(entity))
}

export const groupNodes = (entity?: Entity) => {
  EditorControlFunctions.groupObjects(getSelectedEntities(entity))
}

export const copyNodes = (entity?: Entity) => {
  CopyPasteFunctions.copyEntities(getSelectedEntities(entity))
}

export const pasteNodes = (entity?: Entity) => {
  if (!entity) {
    const selectedEntities = getMutableState(SelectionState).selectedEntities.value.slice(0)
    if (selectedEntities.length > 0) {
      entity = UUIDComponent.getEntityByUUID(selectedEntities[0])
    }
  }

  CopyPasteFunctions.getPastedEntities()
    .then((nodeComponentJSONs) => {
      nodeComponentJSONs.forEach((componentJSONs) => {
        EditorControlFunctions.createObjectFromSceneElement(componentJSONs, entity, getSelectedEntities(entity)[0])
      })
    })
    .catch(() => {
      NotificationService.dispatchNotify(t('editor:hierarchy.copy-paste.no-hierarchy-nodes') as string, {
        variant: 'error'
      })
    })
}

/* HIERARCHY TREE WALKER */

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
  sceneID: string,
  showModelChildren: boolean
) {
  const uuid = node.extensions && (node.extensions[UUIDComponent.jsonID] as EntityUUID)
  const entity = UUIDComponent.getEntityByUUID(uuid!)
  if (!entity || !entityExists(entity)) return

  const item = {
    depth,
    childIndex,
    entity: entity,
    isCollapsed: !getState(HierarchyTreeState).expandedNodes[sceneID]?.[entity],
    children: [],
    isLeaf: !(node.children && node.children.length > 0),
    lastChild: lastChild
  }
  array.push(item)

  if (hasComponent(entity, ModelComponent) && showModelChildren) {
    const modelSceneID = getModelSceneID(entity)
    const snapshotState = getState(GLTFSnapshotState)
    const snapshots = snapshotState[modelSceneID]
    if (snapshots) {
      const snapshotNodes = snapshots.snapshots[snapshots.index].nodes
      if (snapshotNodes && snapshotNodes.length > 0) {
        item.isLeaf = false
        if (!item.isCollapsed)
          buildHierarchyTreeForNodes(depth + 1, snapshotNodes, item.children, sceneID, showModelChildren)
      }
    }
  }

  if (node.children && !item.isCollapsed) {
    for (let i = 0; i < node.children.length; i++) {
      const childIndex = node.children[i]
      buildHierarchyTree(
        depth + 1,
        i,
        nodes[childIndex],
        nodes,
        item.children,
        i === node.children.length - 1,
        sceneID,
        showModelChildren
      )
    }
  }
}

function buildHierarchyTreeForNodes(
  depth: number,
  nodes: GLTF.INode[],
  outArray: NestedHierarchyTreeNode[],
  sceneID: string,
  showModelChildren: boolean
) {
  for (let i = 0; i < nodes.length; i++) {
    if (isChild(i, nodes)) continue
    buildHierarchyTree(depth, i, nodes[i], nodes, outArray, false, sceneID, showModelChildren)
  }
  if (!outArray.length) return
  outArray[outArray.length - 1].lastChild = true
}

function flattenTree(array: NestedHierarchyTreeNode[], outArray: HierarchyTreeNodeType[]) {
  for (const item of array) {
    if (!item.entity) continue
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

export function gltfHierarchyTreeWalker(
  rootEntity: Entity,
  nodes: GLTF.INode[],
  showModelChildren: boolean
): HierarchyTreeNodeType[] {
  const outArray = [] as NestedHierarchyTreeNode[]

  const sceneID = getComponent(rootEntity, SourceComponent)
  const rootNode = {
    depth: 0,
    entity: rootEntity,
    childIndex: 0,
    lastChild: true,
    isCollapsed: !getState(HierarchyTreeState).expandedNodes[sceneID]?.[rootEntity]
  }
  const tree = [rootNode] as HierarchyTreeNodeType[]

  if (!rootNode.isCollapsed) {
    buildHierarchyTreeForNodes(1, nodes, outArray, sceneID, showModelChildren)
    flattenTree(outArray, tree)
  }

  return tree
}
