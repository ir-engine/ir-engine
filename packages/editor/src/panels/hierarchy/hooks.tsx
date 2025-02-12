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
import {
  Entity,
  entityExists,
  getComponent,
  getOptionalComponent,
  UndefinedEntity,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import { GLTFModifiedState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { GLTFAssetState, GLTFSnapshotState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getMutableState, getState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  EntityTreeComponent,
  isAncestor,
  traverseEntityNode
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react'
import { DropTargetMonitor, useDrop } from 'react-dnd'
import { useHotkeys } from 'react-hotkeys-hook'
import useUpload from '../../components/assets/useUpload'
import { DnDFileType, FileDataType, ItemTypes, SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { cmdOrCtrlString } from '../../functions/utils'
import { EditorState } from '../../services/EditorServices'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { SelectionState } from '../../services/SelectionServices'
import {
  copyNodes,
  duplicateNode,
  gltfHierarchyTreeWalker,
  groupNodes,
  HierarchyTreeNodeType,
  pasteNodes,
  uploadOptions
} from './helpers'

type DragItemType = {
  type: (typeof ItemTypes)[keyof typeof ItemTypes]
  value: Entity | Entity[]
  multiple: boolean
}

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

const HierarchySnapshotReactor = (props: {
  children?: ReactNode
  rootEntity: Entity
  sourceId: string
  snapshotIndex: number
}) => {
  const { children, rootEntity, sourceId, snapshotIndex } = props
  const gltfState = useMutableState(GLTFSnapshotState)
  const selectionState = useMutableState(SelectionState)
  const hierarchyNodes = useHookstate<HierarchyTreeNodeType[]>([])
  const hierarchyTreeState = useMutableState(HierarchyTreeState)
  const [showModelChildren] = useFeatureFlags([FeatureFlags.Studio.UI.Hierarchy.ShowModelChildren])
  const renamingEntity = useHookstate<Entity | null>(null)
  const contextMenu = useHookstate({ entity: UndefinedEntity, anchorEvent: undefined as React.MouseEvent | undefined })
  const modifiedState = useMutableState(GLTFModifiedState)
  const gltfSnapshot = gltfState[sourceId].snapshots[snapshotIndex]

  const displayedNodes = useMemo(() => {
    if (hierarchyTreeState.search.query.value.length > 0) {
      const searchedNodes: HierarchyTreeNodeType[] = []
      const adjustedSearchValue = hierarchyTreeState.search.query.value.replace(VALID_HEIRARCHY_SEARCH_REGEX, '\\$&')
      const condition = new RegExp(adjustedSearchValue, 'i')
      hierarchyNodes.value.forEach((node) => {
        if (node.entity && condition.test(getComponent(node.entity, NameComponent)?.toLowerCase() ?? ''))
          searchedNodes.push(node)
      })
      return searchedNodes
    }
    return hierarchyNodes.value.filter((node) => node.isRendered)
  }, [hierarchyTreeState.search.query, hierarchyNodes])

  useEffect(() => {
    if (!hierarchyTreeState.expandedNodes.value[sourceId]) {
      hierarchyTreeState.expandedNodes.set({ [sourceId]: { [rootEntity]: true } })
    }
  }, [sourceId])

  const sourceQuery = useQuery([SourceComponent])
  useEffect(() => {
    const nodes = gltfHierarchyTreeWalker(rootEntity, gltfSnapshot.nodes.value as GLTF.INode[], showModelChildren)
    if (didHierarchyChange(hierarchyNodes.value as HierarchyTreeNodeType[], nodes)) {
      hierarchyNodes.set(nodes.filter((node) => entityExists(node.entity)))
    }
  }, [
    hierarchyTreeState.expandedNodes.value[sourceId], // extra dep for rebuilding tree for expanded/collapsed nodes
    snapshotIndex,
    gltfState,
    gltfSnapshot,
    selectionState.selectedEntities,
    showModelChildren,
    modifiedState.keys,
    sourceQuery
  ])

  useEffect(() => {
    if (!selectionState.selectedEntities.value.length) {
      hierarchyTreeState.firstSelectedEntity.set(null)
    }
  }, [selectionState.selectedEntities])

  return (
    <HierarchyTreeContext.Provider
      value={{
        nodes: displayedNodes.filter((node) => entityExists(node.entity)),
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

export const HierarchyPanelProvider = ({ children }: { children?: ReactNode }) => {
  const rootEntity = useHookstate(getMutableState(EditorState).rootEntity).value
  const sourceId = useOptionalComponent(rootEntity, SourceComponent)!.value
  const snapshotIndex = GLTFSnapshotState.useSnapshotIndex(sourceId)

  return snapshotIndex !== undefined ? (
    <HierarchySnapshotReactor
      children={children}
      rootEntity={rootEntity}
      sourceId={sourceId}
      snapshotIndex={snapshotIndex.value}
    />
  ) : null
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

export const useHierarchyTreeDrop = (node?: HierarchyTreeNodeType, place?: 'On' | 'Before' | 'After') => {
  const onUpload = useUpload(uploadOptions)
  const rootEntity = useMutableState(EditorState).rootEntity.value
  const sourceId = useOptionalComponent(rootEntity, SourceComponent)!.value

  const canDropItem = (item: DragItemType, monitor: DropTargetMonitor): boolean => {
    if (!monitor.isOver({ shallow: true })) {
      return false
    }

    if (node?.entity && place !== 'On') {
      const entityTreeComponent = getComponent(node.entity, EntityTreeComponent)
      if (!entityTreeComponent) {
        return false
      }
    }
    if (item.type === ItemTypes.Node) {
      if (node?.entity) {
        const entityTreeComponent = getComponent(node.entity, EntityTreeComponent)
        if (place === 'On' || !!entityTreeComponent.parentEntity) return true
      }

      const entity = node?.entity || getState(GLTFAssetState)[sourceId]

      return !(item.multiple
        ? (item.value as Entity[]).some((otherObject) => isAncestor(otherObject, entity))
        : isAncestor(item.value as Entity, entity))
    }
    return true
  }

  const dropItem = (item: FileDataType | DnDFileType | DragItemType, monitor: DropTargetMonitor): void => {
    let parentNode: Entity | undefined
    let beforeNode: Entity = UndefinedEntity
    let afterNode: Entity = UndefinedEntity

    if (node) {
      const entityTreeComponent = getOptionalComponent(node.entity, EntityTreeComponent)
      parentNode = entityTreeComponent?.parentEntity
      const parentTreeComponent = getOptionalComponent(entityTreeComponent?.parentEntity!, EntityTreeComponent)

      switch (place) {
        case 'Before': // we want to place before this node
          beforeNode = node.entity
          if (!parentTreeComponent || !parentNode) break
          if (0 > node.childIndex - 1) break // nothing to place after it, as node index is the first child
          afterNode = UndefinedEntity
          break
        case 'After': // we want to place after this node
          afterNode = node.entity
          if (!parentTreeComponent || !parentNode) break
          if (node.lastChild) break // if it is last child, nothing to place before it
          if (parentTreeComponent?.children.length < node.childIndex + 1) break //node index is last child
          beforeNode = UndefinedEntity
          break
        default: //case 'on'
          parentNode = node.entity
      }
    }

    if (!parentNode) {
      console.warn('parent is not defined')
      return
    }

    if ('files' in item) {
      const dndItem: any = monitor.getItem()
      const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

      //uploading files then adding as media to the editor
      onUpload(entries).then((assets) => {
        if (!assets) return
        for (const asset of assets) {
          addMediaNode(asset, parentNode, beforeNode)
        }
      })
      return
    }

    if ('url' in item) {
      addMediaNode(item.url, parentNode, beforeNode)
      return
    }

    if ('type' in item && item.type === ItemTypes.Component) {
      EditorControlFunctions.createObjectFromSceneElement(
        [{ name: (item as any).componentJsonID }],
        parentNode,
        beforeNode
      )
      return
    }

    EditorControlFunctions.reparentObject(
      Array.isArray((item as DragItemType).value)
        ? ((item as DragItemType).value as Entity[])
        : [(item as DragItemType).value as Entity],
      beforeNode,
      afterNode,
      parentNode === null ? undefined : parentNode
    )
  }

  const [{ canDrop, isOver }, dropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ItemTypes.Component, ...SupportedFileTypes],
    drop: dropItem,
    canDrop: canDropItem,
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  return { canDrop, isOver, dropTarget }
}

const useSimplifiedHotkey = (key: string, onAction: () => void) => {
  return useHotkeys(`${cmdOrCtrlString}+${key}`, (e) => {
    e.preventDefault()
    onAction()
  })
}

export const useHierarchyTreeHotkeys = () => {
  const renamingNode = useRenamingNode()
  useSimplifiedHotkey('d', duplicateNode)
  useSimplifiedHotkey('g', groupNodes)
  useSimplifiedHotkey('c', copyNodes)
  useSimplifiedHotkey('v', pasteNodes)
  useSimplifiedHotkey('r', () => {
    const selectedEntities = SelectionState.getSelectedEntities()
    for (const entity of selectedEntities) {
      renamingNode.set(entity)
    }
  })
}
