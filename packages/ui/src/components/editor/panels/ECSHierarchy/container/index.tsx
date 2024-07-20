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

import { getComponent, getMutableComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { AllFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { getMutableState, getState, none, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { EntityTreeComponent, traverseEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  defineQuery,
  entityExists
} from '@etherealengine/ecs'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'

import useUpload from '@etherealengine/editor/src/components/assets/useUpload'
import { HierarchyTreeNodeType } from '@etherealengine/editor/src/components/hierarchy/HierarchyTreeWalker'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { EditorHelperState, PlacementMode } from '@etherealengine/editor/src/services/EditorHelperState'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { GLTFSnapshotState } from '@etherealengine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import Input from '../../../../../primitives/tailwind/Input'
import HierarchyTreeNode, { HierarchyTreeNodeProps } from '../../Hierarchy/node'

const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

export type ECSHierarchyTreeNodeType = {
  depth: number
  entity: Entity
  childIndex: number
  lastChild: boolean
  isLeaf?: boolean
  isCollapsed?: boolean
}

export type ECSHierarchyTreeCollapsedNodeType = { [key: number]: boolean }

type ECSNestedHierarchyTreeNode = ECSHierarchyTreeNodeType & { children: ECSNestedHierarchyTreeNode[] }

function buildHierarchyTree(
  depth: number,
  childIndex: number,
  entity: Entity,
  array: ECSNestedHierarchyTreeNode[],
  lastChild: boolean
) {
  const entityTree = getComponent(entity, EntityTreeComponent)

  const item = {
    depth,
    childIndex,
    entity: entity,
    isCollapsed: false, //todo
    children: [],
    isLeaf: !(entityTree.children && entityTree.children.length > 0),
    lastChild: lastChild
  }
  array.push(item)

  if (entityTree.children && !item.isCollapsed) {
    for (let i = 0; i < entityTree.children.length; i++) {
      const childEntity = entityTree.children[i]
      buildHierarchyTree(depth + 1, i, childEntity, item.children, i === entityTree.children.length - 1)
    }
  }
}

function buildHierarchyTreeForNodes(depth: number, rootEntity: Entity, outArray: ECSNestedHierarchyTreeNode[]) {
  const entityTree = getComponent(rootEntity, EntityTreeComponent)
  for (let i = 0; i < entityTree.children.length; i++) {
    const entity = entityTree.children[i]
    buildHierarchyTree(depth, i, entity, outArray, i === entityTree.children.length - 1)
  }
  if (outArray.length) outArray[outArray.length - 1].lastChild = true
}

function flattenTree(array: ECSNestedHierarchyTreeNode[], outArray: HierarchyTreeNodeType[]) {
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

const entityTreeQuery = defineQuery([EntityTreeComponent])

export function ecsHierarchyTreeWalker(): HierarchyTreeNodeType[] {
  const outArray = [] as ECSNestedHierarchyTreeNode[]

  const treeRoots = entityTreeQuery().filter(
    (entity) => getComponent(entity, EntityTreeComponent).parentEntity === UndefinedEntity
  )

  const tree = [] as HierarchyTreeNodeType[]

  for (let i = 0; i < treeRoots.length; i++) {
    const rootEntity = treeRoots[i]
    const entityTree = getComponent(rootEntity, EntityTreeComponent)
    const item = {
      depth: 0,
      entity: rootEntity,
      childIndex: i,
      lastChild: i === treeRoots.length - 1,
      children: [],
      isLeaf: !(entityTree.children && entityTree.children.length > 0),
      isCollapsed: false
    }
    outArray.push(item)
    buildHierarchyTreeForNodes(1, rootEntity, item.children)
  }
  flattenTree(outArray, tree)

  return tree
}

/**
 * HierarchyPanel function component provides view for hierarchy tree.
 */
function HierarchyPanelContents(props: { sceneURL: string; rootEntityUUID: EntityUUID; index: number }) {
  const { sceneURL, index } = props
  const { t } = useTranslation()

  const [prevClickedNode, setPrevClickedNode] = useState<Entity | null>(null)
  const onUpload = useUpload(uploadOptions)
  const expandedNodes = useHookstate(getMutableState(EditorState).expandedNodes)
  const entityHierarchy = useHookstate<HierarchyTreeNodeType[]>([])
  const [selectedNodes, setSelectedNode] = useState<Entity[] | null>(null)
  const searchHierarchy = useHookstate('')
  const selectionState = useMutableState(SelectionState)

  useEffect(() => {
    const entities: Entity[] = []
    for (const selectedUUID of selectionState.selectedEntities.value) {
      const entity = UUIDComponent.getEntityByUUID(selectedUUID)
      if (entity) entities.push(entity)
    }
    setSelectedNode(entities)
  }, [selectionState.selectedEntities])

  const MemoTreeNode = useCallback(
    (props: HierarchyTreeNodeProps) => (
      <HierarchyTreeNode
        {...props}
        key={props.data.nodes[props.index].depth + ' ' + props.index + ' ' + props.data.nodes[props.index].entity}
      />
    ),
    [entityHierarchy]
  )

  const searchedNodes: HierarchyTreeNodeType[] = []
  if (searchHierarchy.value.length > 0) {
    const condition = new RegExp(searchHierarchy.value.toLowerCase())
    entityHierarchy.value.forEach((node) => {
      if (node.entity && condition.test(getComponent(node.entity, NameComponent)?.toLowerCase() ?? ''))
        searchedNodes.push(node)
    })
  }

  useEffect(() => {
    entityHierarchy.set(ecsHierarchyTreeWalker())
  }, [expandedNodes, index, selectionState.selectedEntities])

  /* Expand & Collapse Functions */
  const expandNode = useCallback(
    (entity: Entity) => {
      expandedNodes[sceneURL][entity].set(true)
    },
    [expandedNodes]
  )

  const collapseNode = useCallback(
    (entity: Entity) => {
      expandedNodes[sceneURL][entity].set(none)
    },
    [expandedNodes]
  )

  const expandChildren = useCallback(
    (entity: Entity) => {
      traverseEntityNode(entity, (child) => {
        expandedNodes[sceneURL][child].set(true)
      })
    },
    [expandedNodes]
  )

  const collapseChildren = useCallback(
    (entity: Entity) => {
      traverseEntityNode(entity, (child) => {
        expandedNodes[sceneURL][child].set(none)
      })
    },
    [expandedNodes]
  )

  const onClick = useCallback(
    (e: MouseEvent, entity: Entity) => {
      if (e.detail === 1) {
        // Exit click placement mode when anything in the hierarchy is selected
        getMutableState(EditorHelperState).placementMode.set(PlacementMode.DRAG)
        if (e.ctrlKey) {
          EditorControlFunctions.toggleSelection([getComponent(entity, UUIDComponent)])
        } else if (e.shiftKey && prevClickedNode) {
          const startIndex = entityHierarchy.value.findIndex((n) => n.entity === prevClickedNode)
          const endIndex = entityHierarchy.value.findIndex((n) => n.entity === entity)
          const range = entityHierarchy.value.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
          const entityUuids = range.filter((n) => n.entity).map((n) => getComponent(n.entity!, UUIDComponent))
          EditorControlFunctions.replaceSelection(entityUuids)
        } else {
          const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
          if (!selected) {
            EditorControlFunctions.replaceSelection([getComponent(entity, UUIDComponent)])
          }
        }
        setPrevClickedNode(entity)
      } else if (e.detail === 2) {
        const editorCameraState = getMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
        editorCameraState.focusedEntities.set([entity])
        editorCameraState.refocus.set(true)
      }
    },
    [prevClickedNode, entityHierarchy]
  )

  const onToggle = useCallback(
    (_, entity: Entity) => {
      if (expandedNodes.value[sceneURL][entity]) collapseNode(entity)
      else expandNode(entity)
    },
    [expandedNodes, expandNode, collapseNode]
  )

  let validNodes = searchHierarchy.value.length > 0 ? searchedNodes : entityHierarchy.value
  validNodes = validNodes.filter((node) => entityExists(node.entity))

  const HierarchyList = ({ height, width }) => (
    <FixedSizeList
      height={height}
      width={width}
      itemSize={32}
      itemCount={validNodes.length}
      itemData={{
        nodes: validNodes,
        onClick,
        onToggle,
        onUpload
      }}
      itemKey={(index) => index}
      innerElementType="ul"
    >
      {MemoTreeNode}
    </FixedSizeList>
  )

  return (
    <>
      <div className="flex items-center gap-2 bg-theme-surface-main">
        <Input
          placeholder={t('common:components.search')}
          value={searchHierarchy.value}
          onChange={(event) => {
            searchHierarchy.set(event.target.value)
          }}
          className="m-1 rounded bg-theme-primary text-[#A3A3A3]"
          startComponent={<HiMagnifyingGlass className="text-white" />}
        />
      </div>
      <div id="heirarchy-panel" className="h-5/6 overflow-hidden">
        <AutoSizer onResize={HierarchyList}>{HierarchyList}</AutoSizer>
      </div>
    </>
  )
}

export default function HierarchyPanel() {
  const sceneID = useHookstate(getMutableState(EditorState).scenePath).value
  const gltfEntity = useMutableState(EditorState).rootEntity.value
  if (!sceneID || !gltfEntity) return null

  const GLTFHierarchySub = () => {
    const rootEntityUUID = getComponent(gltfEntity, UUIDComponent)
    const sourceID = getComponent(gltfEntity, SourceComponent)
    const index = GLTFSnapshotState.useSnapshotIndex(sourceID)

    if (index === undefined) return null
    return (
      <HierarchyPanelContents
        key={`${sourceID}-${index.value}`}
        rootEntityUUID={rootEntityUUID}
        sceneURL={sourceID}
        index={index.value}
      />
    )
  }

  return <GLTFHierarchySub />
}
