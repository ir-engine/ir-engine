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
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService.tsx'
import { VALID_HEIRARCHY_SEARCH_REGEX } from '@ir-engine/common/src/regex'
import {
  Entity,
  entityExists,
  EntityTreeComponent,
  getAncestorWithComponents,
  getChildrenWithComponents,
  getComponent,
  hasComponent,
  isAncestor,
  Layers,
  QuerySubReactor,
  traverseEntityNode,
  UndefinedEntity,
  useComponent,
  useQuery
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getMutableState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent.tsx'
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { DropTargetMonitor, useDrop } from 'react-dnd'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import useUpload from '../../components/assets/useUpload'
import { DnDFileType, FileDataType, ItemTypes, SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { cmdOrCtrlString, isEntityGlb } from '../../functions/utils'
import { EditorHelperState } from '../../services/EditorHelperState.ts'
import { EditorHistoryFunctions } from '../../services/EditorHistoryState'
import { EditorState } from '../../services/EditorServices'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { SelectionState } from '../../services/SelectionServices'
import {
  copyNodes,
  duplicateNode,
  ecsHierarchyTreeWalker,
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

function containsRigidbodyInChildren(entity: Entity): boolean {
  return getChildrenWithComponents(entity, [RigidBodyComponent]).length > 0 || hasComponent(entity, RigidBodyComponent)
}
function containsRigidbodyInParent(entity: Entity): boolean {
  return getAncestorWithComponents(entity, [RigidBodyComponent], true, true) !== UndefinedEntity
}
function bothContainsRigidbody(dragEntity: Entity | Entity[], targetEntity: Entity): boolean {
  const targetHasRb = containsRigidbodyInParent(targetEntity)

  //early out false for comparing against self target
  if (
    !targetHasRb ||
    (!Array.isArray(dragEntity) && targetEntity === dragEntity) ||
    (Array.isArray(dragEntity) && dragEntity.some((dragListEntity) => dragListEntity === targetEntity))
  )
    return false

  return Array.isArray(dragEntity)
    ? //if it is an array, check for any that violate this
      targetHasRb && dragEntity.some((dragListEntity) => containsRigidbodyInChildren(dragListEntity))
    : //otherwise only check single entity
      targetHasRb && containsRigidbodyInChildren(dragEntity)
}

function isGlbIssue(entity: Entity): boolean {
  //@todo update this when we support adding children to GLB based prefabs
  return isEntityGlb(entity) //&& !getMutableState(EditorHelperState).showGlbChildren.value
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

const HierarchySnapshotReactor = (props: { children?: ReactNode; rootEntity: Entity; sourceID: string }) => {
  const { children, rootEntity, sourceID } = props
  const selectionState = useMutableState(SelectionState)
  const hierarchyTreeState = useMutableState(HierarchyTreeState)
  const renamingEntity = useHookstate<Entity | null>(null)
  const contextMenu = useHookstate({ entity: UndefinedEntity, anchorEvent: undefined as React.MouseEvent | undefined })
  const entities = useQuery([SourceComponent], Layers.Authoring)
  const showGlbChildren = useMutableState(EditorHelperState).showGlbChildren

  const childEntities = useQuery([EntityTreeComponent], Layers.Authoring)
  const reparentRefresh = useHookstate(0)

  const ChildEntityReactor = (props: { entity: Entity }) => {
    const entity = props.entity
    const entityTreeComponent = useComponent(entity, EntityTreeComponent)
    const [parentEntity, setParentEntity] = useState(entityTreeComponent.value.parentEntity)

    useEffect(() => {
      if (entityTreeComponent.value.parentEntity !== parentEntity) {
        setParentEntity(entityTreeComponent.value.parentEntity)
        reparentRefresh.set((reparentRefresh.value + 1) % 1000)
      }
    }, [entityTreeComponent.parentEntity.value])

    return null
  }

  const hierarchyNodes = useMemo(
    () => ecsHierarchyTreeWalker(rootEntity, !showGlbChildren.value),
    [
      hierarchyTreeState.expandedNodes[sourceID],
      selectionState.selectedEntities,
      showGlbChildren,
      entities,
      childEntities,
      reparentRefresh
    ]
  )

  const displayedNodes = useMemo(() => {
    if (hierarchyTreeState.search.query.value.length > 0) {
      const searchedNodes: HierarchyTreeNodeType[] = []
      const adjustedSearchValue = hierarchyTreeState.search.query.value.replace(VALID_HEIRARCHY_SEARCH_REGEX, '\\$&')
      const condition = new RegExp(adjustedSearchValue, 'i')
      hierarchyNodes.forEach((node) => {
        if (node.entity && condition.test(getComponent(node.entity, NameComponent)?.toLowerCase() ?? ''))
          searchedNodes.push(node)
      })
      return searchedNodes
    }
    return hierarchyNodes.filter((node) => node.isRendered)
  }, [hierarchyTreeState.search.query, hierarchyNodes, entities])

  useEffect(() => {
    hierarchyTreeState.expandedNodes.set({ [sourceID]: { [rootEntity]: true } })
  }, [sourceID])

  useEffect(() => {
    if (!selectionState.selectedEntities.value.length) {
      hierarchyTreeState.firstSelectedEntity.set(null)
    }
  }, [selectionState.selectedEntities])

  return (
    <>
      {childEntities.map((childEntity) => (
        <QuerySubReactor key={childEntity} entity={childEntity} ChildEntityReactor={ChildEntityReactor} />
      ))}
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
    </>
  )
}

export const HierarchyPanelProvider = ({ children }: { children?: ReactNode }) => {
  const rootEntity = useHookstate(getMutableState(EditorState).rootEntity).value
  const sourceID = GLTFComponent.useInstanceID(rootEntity)
  if (!sourceID) return null
  return <HierarchySnapshotReactor children={children} rootEntity={rootEntity} sourceID={sourceID} />
}

export const useHierarchyNodes = () => useContext(HierarchyTreeContext).nodes
export const useRenamingNode = () => useContext(HierarchyTreeContext).renamingNode
export const useHierarchyTreeContextMenu = () => useContext(HierarchyTreeContext).contextMenu

export const useNodeCollapseExpand = () => {
  const rootEntity = useMutableState(EditorState).rootEntity.value
  const expandedNodes = useMutableState(HierarchyTreeState).expandedNodes
  const sourceID = GLTFComponent.useInstanceID(rootEntity)

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
  const { t } = useTranslation()
  const [rigidbodyParentingWarning, setRigidbodyParentingWarning] = useState(false)
  const [lastTargetNode, setTargetNode] = useState(UndefinedEntity)

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

        if (place === 'On') {
          const updateRigidbodyCheck = node.entity !== lastTargetNode
          setTargetNode(node.entity)

          if (isGlbIssue(node.entity)) return true
          // Check rigidbody condition and update state
          const hasRigidbodyWarning =
            (!updateRigidbodyCheck && rigidbodyParentingWarning) ||
            (updateRigidbodyCheck && bothContainsRigidbody(item.value, node.entity))

          setRigidbodyParentingWarning(hasRigidbodyWarning)
          if (hasRigidbodyWarning) return true
        }
        if (place === 'On' || !!entityTreeComponent.parentEntity) return true
      } else {
        setTargetNode(UndefinedEntity)
      }

      const entity = node?.entity || rootEntity

      return !(item.multiple
        ? (item.value as Entity[]).some((otherObject) => isAncestor(otherObject, entity))
        : isAncestor(item.value as Entity, entity))
    }
    return true
  }

  const dropItem = (item: FileDataType | DnDFileType | DragItemType, monitor: DropTargetMonitor): void => {
    if (node?.entity) {
      //check for glb issue (adding child to glb prefab)
      if (isGlbIssue(node.entity)) {
        NotificationService.dispatchNotify(t('editor:warnings.addChildToGlbError'), { variant: 'warning' })
        return
      }
      // Check if this is a rigidbody drop case that needs special handling
      if ('type' in item && item.type === ItemTypes.Node && place === 'On') {
        // If this is a rigidbody drop onto another rigidbody hierarchy, show warning and exit early
        if (bothContainsRigidbody((item as DragItemType).value, node.entity)) {
          NotificationService.dispatchNotify(t('editor:warnings.rigidbodyDropWarning'), { variant: 'warning' })
          return // Exit early, don't process the drop
        }
      }
    }

    let parentNode: Entity | undefined
    let beforeNode: Entity = UndefinedEntity
    let afterNode: Entity = UndefinedEntity

    if (node) {
      const entityTreeComponent = getComponent(node.entity, EntityTreeComponent)
      parentNode = entityTreeComponent.parentEntity
      const parentTreeComponent = getComponent(entityTreeComponent.parentEntity, EntityTreeComponent)

      switch (place) {
        case 'Before': // we want to place before this node
          beforeNode = node.entity
          if (0 > node.childIndex - 1) break // nothing to place after it, as node index is the first child
          afterNode = UndefinedEntity
          break
        case 'After': // we want to place after this node
          afterNode = node.entity
          if (node.lastChild) break // if it is last child, nothing to place before it
          if (parentTreeComponent.children.length < node.childIndex + 1) break //node index is last child
          beforeNode = UndefinedEntity
          break
        default: //case 'on'
          parentNode = node.entity
      }
    }

    // if (!parentNode) {
    //   console.warn('parent is not defined')
    //   return
    // }

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
      EditorHistoryFunctions.snapshot()
      return
    }

    if (!parentNode) return

    EditorControlFunctions.reparentObject(
      Array.isArray((item as DragItemType).value)
        ? ((item as DragItemType).value as Entity[])
        : [(item as DragItemType).value as Entity],
      beforeNode,
      afterNode,
      parentNode
    )
    EditorHistoryFunctions.snapshot()
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

  return { canDrop, isOver, dropTarget, rigidbodyParentingWarning }
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
