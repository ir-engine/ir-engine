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
import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { VALID_HEIRARCHY_SEARCH_REGEX } from '@ir-engine/common/src/regex'
import { Entity, entityExists, getComponent, UndefinedEntity, useOptionalComponent } from '@ir-engine/ecs'
import { GLTFSnapshotState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getMutableState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { traverseEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react'
import { gltfHierarchyTreeWalker, HierarchyTreeNodeType } from '../../components/hierarchy/HierarchyTreeWalker'
import { EditorState } from '../../services/EditorServices'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { SelectionState } from '../../services/SelectionServices'

const didHierarchyChange = (prev: HierarchyTreeNodeType[], curr: HierarchyTreeNodeType[]) => {
  if (prev.length !== curr.length) return true

  for (let i = 0; i < prev.length; i++) {
    const prevNode = prev[i]
    const currNode = curr[i]
    for (const key in prevNode) {
      if (prevNode[key] !== currNode[key]) return true
    }
  }

  return false
}

const HierarchyTreeContext = createContext({
  nodes: [] as readonly HierarchyTreeNodeType[],
  renamingNode: { entity: null as Entity | null, clear: () => {}, set: (_entity: Entity) => {} },
  contextMenu: {
    entity: UndefinedEntity as Entity,
    anchorEvent: undefined as React.MouseEvent | undefined,
    setMenu: (_event?: React.MouseEvent, _entity?: Entity) => {}
  }
})

export const HierarchyPanelProvider = ({ children }: { children?: ReactNode }) => {
  const rootEntity = useHookstate(getMutableState(EditorState).rootEntity).value
  const sourceId = useOptionalComponent(rootEntity, SourceComponent)!.value
  const gltfState = useMutableState(GLTFSnapshotState)
  const selectionState = useMutableState(SelectionState)
  const hierarchyNodes = useHookstate<HierarchyTreeNodeType[]>([])
  const hierarchyTreeState = useMutableState(HierarchyTreeState)
  const [showModelChildren] = useFeatureFlags([FeatureFlags.Studio.UI.Hierarchy.ShowModelChildren])
  const renamingEntity = useHookstate<Entity | null>(null)
  const contextMenu = useHookstate({ entity: UndefinedEntity, anchorEvent: undefined as React.MouseEvent | undefined })
  const { expandedNodes, firstSelectedEntity } = useMutableState(HierarchyTreeState)

  const snapshotIndex = GLTFSnapshotState.useSnapshotIndex(sourceId)
  if (snapshotIndex === undefined) return null

  const gltfSnapshot = gltfState[sourceId].snapshots[snapshotIndex.value]
  const displayedNodes = useMemo(() => {
    if (hierarchyTreeState.search.query.value.length > 0) {
      let searchedNodes: HierarchyTreeNodeType[] = []
      const adjustedSearchValue = hierarchyTreeState.search.query.value.replace(VALID_HEIRARCHY_SEARCH_REGEX, '\\$&')
      const condition = new RegExp(adjustedSearchValue, 'i')
      hierarchyNodes.value.forEach((node) => {
        if (node.entity && condition.test(getComponent(node.entity, NameComponent)?.toLowerCase() ?? ''))
          searchedNodes.push(node)
      })
      return searchedNodes
    }
    return hierarchyNodes.value
  }, [hierarchyTreeState.search, hierarchyNodes])

  useEffect(() => {
    if (!expandedNodes.value[sourceId]) {
      expandedNodes.set({ [sourceId]: { [rootEntity]: true } })
    }
  }, [])

  useEffect(() => {
    const nodes = gltfHierarchyTreeWalker(rootEntity, gltfSnapshot.nodes.value as GLTF.INode[], showModelChildren)
    if (didHierarchyChange(hierarchyNodes.value as HierarchyTreeNodeType[], nodes)) {
      hierarchyNodes.set(nodes.filter((node) => entityExists(node.entity)))
    }
  }, [
    hierarchyTreeState.expandedNodes,
    snapshotIndex,
    gltfSnapshot,
    gltfState,
    selectionState.selectedEntities,
    showModelChildren,
    expandedNodes // extra dep for expanding node when already selected
  ])
  // TODO: remove gltfState from deps because it might not be needed and also expanded nodes

  useEffect(() => {
    if (!selectionState.selectedEntities.value.length) {
      firstSelectedEntity.set(null)
    }
  }, [selectionState.selectedEntities])

  return (
    <HierarchyTreeContext.Provider
      value={{
        nodes: displayedNodes,
        renamingNode: {
          entity: renamingEntity.value,
          clear: () => renamingEntity.set(null),
          set: (entity: Entity) => renamingEntity.set(entity)
        },
        contextMenu: {
          entity: contextMenu.entity.value,
          anchorEvent: contextMenu.anchorEvent.value as React.MouseEvent | undefined,
          setMenu: (event?: React.MouseEvent, entity: Entity = UndefinedEntity) =>
            contextMenu.set({ entity, anchorEvent: event })
        }
      }}
    >
      {children}
    </HierarchyTreeContext.Provider>
  )
}

export const useHierarchyNodes = () => useContext(HierarchyTreeContext).nodes
export const useRenamingNode = () => useContext(HierarchyTreeContext).renamingNode
export const useHierarchyTreeContextMenu = () => useContext(HierarchyTreeContext).contextMenu

export const useNodeCollapseExpand = () => {
  const rootEntity = useMutableState(EditorState).rootEntity.value
  const expandedNodes = useMutableState(HierarchyTreeState).expandedNodes
  const sourceID = useOptionalComponent(rootEntity, SourceComponent)!.value

  const expandNode = (entity: Entity) => {
    expandedNodes[sourceID][entity].set(true)
  }

  const collapseNode = (entity: Entity) => {
    expandedNodes[sourceID][entity].set(none)
  }

  const expandChildren = (entity: Entity) => {
    traverseEntityNode(entity, (child) => {
      expandedNodes[sourceID][child].set(true)
    })
  }

  const collapseChildren = (entity: Entity) => {
    traverseEntityNode(entity, (child) => {
      expandedNodes[sourceID][child].set(none)
    })
  }

  return { expandNode, collapseNode, expandChildren, collapseChildren }
}

// TODO
export const useHierarchyTreeDragDrop = () => {}
