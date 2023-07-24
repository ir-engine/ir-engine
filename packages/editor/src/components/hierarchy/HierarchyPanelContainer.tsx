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

import React, { memo, useCallback, useContext, useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import Hotkeys from 'react-hot-keys'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'
import { Object3D } from 'three'

import { AllFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  EntityTreeComponent,
  getEntityNodeArrayFromEntities,
  traverseEntityNode
} from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { Checkbox } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import { PopoverPosition } from '@mui/material/Popover'

import { EditorCameraState } from '../../classes/EditorCameraState'
import { ItemTypes, SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { isAncestor } from '../../functions/getDetachedObjectsRoots'
import { cmdOrCtrlString } from '../../functions/utils'
import { EditorAction, EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'
import useUpload from '../assets/useUpload'
import { addSceneComponentElement } from '../element/ElementList'
import { ContextMenu } from '../layout/ContextMenu'
import { updateProperties } from '../properties/Util'
import { AppContext } from '../Search/context'
import Search from '../Search/Search'
import { HeirarchyTreeCollapsedNodeType, HeirarchyTreeNodeType, heirarchyTreeWalker } from './HeirarchyTreeWalker'
import {
  getNodeElId,
  HierarchyTreeNode,
  HierarchyTreeNodeData,
  HierarchyTreeNodeProps,
  RenameNodeData
} from './HierarchyTreeNode'
import styles from './styles.module.scss'

/**
 * uploadOption initializing object containing Properties multiple, accepts.
 *
 * @type {Object}
 */
const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

/**
 * getNodeKey function used to get object id at given index.
 *
 * @param  {number} index [index of the node to get object id]
 * @param  {object} data
 * @return {string}
 */
function getNodeKey(index: number, data: HierarchyTreeNodeData) {
  return index //data.nodes[index].entityNode ? data.nodes[index].entityNode.entity : data.nodes[index].toString()
}

function traverseWithDepth(obj3d: Object3D, depth: number, cb: Function) {
  cb(obj3d, depth)
  for (const obj of obj3d.children) {
    traverseWithDepth(obj, depth + 1, cb)
  }
}

function getModelNodesFromTreeWalker(
  inputNodes: HeirarchyTreeNodeType[],
  collapsedNodes: HeirarchyTreeCollapsedNodeType,
  showObject3Ds: boolean
): HeirarchyTreeNodeType[] {
  const outputNodes = [] as HeirarchyTreeNodeType[]
  const selected = new Set(
    getState(SelectionState).selectedEntities.filter((ent) => typeof ent === 'string') as string[]
  )
  for (const node of inputNodes) {
    outputNodes.push(node)
    const isCollapsed = collapsedNodes[node.entityNode]
    if (showObject3Ds && hasComponent(node.entityNode as Entity, ModelComponent)) {
      const group = getOptionalComponent(node.entityNode as Entity, GroupComponent)
      if (!group?.length) continue
      node.isLeaf = false
      if (isCollapsed) continue
      let childIndex = node.childIndex
      for (const obj3d of group)
        traverseWithDepth(obj3d, node.depth, (obj, depth) => {
          if (group.includes(obj)) return
          outputNodes.push({
            depth,
            obj3d: obj,
            entityNode: null!,
            childIndex: childIndex++,
            lastChild: false,
            isLeaf: true, //!obj.children.length, // todo, store collapsed state on obj3d
            isCollapsed: node.isCollapsed,
            selected: selected.has(obj.uuid),
            active: false
          })
        })
    }
  }
  return outputNodes
}

/**
 * HierarchyPanel function component provides view for hierarchy tree.
 *
 * @constructor
 */
export default function HierarchyPanel({
  setSearchElement,
  setSearchHierarchy
}: {
  setSearchElement: (_: string) => void
  setSearchHierarchy: (_: string) => void
}) {
  const { t } = useTranslation()
  const [contextSelectedItem, setContextSelectedItem] = React.useState<undefined | HeirarchyTreeNodeType>(undefined)
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const onUpload = useUpload(uploadOptions)
  const selectionState = useHookstate(getMutableState(SelectionState))
  const [renamingNode, setRenamingNode] = useState<RenameNodeData | null>(null)
  const [collapsedNodes, setCollapsedNodes] = useState<HeirarchyTreeCollapsedNodeType>({})
  const [nodes, setNodes] = useState<HeirarchyTreeNodeType[]>([])
  const nodeSearch: HeirarchyTreeNodeType[] = []
  const [selectedNode, _setSelectedNode] = useState<HeirarchyTreeNodeType | null>(null)
  const editorState = useHookstate(getMutableState(EditorState))
  const { searchHierarchy } = useContext(AppContext)
  const showObject3DInHierarchy = editorState.showObject3DInHierarchy

  const MemoTreeNode = memo(
    (props: HierarchyTreeNodeProps) => <HierarchyTreeNode {...props} onContextMenu={onContextMenu} />,
    areEqual
  )

  if (searchHierarchy.length > 0) {
    const condition = new RegExp(searchHierarchy.toLowerCase())
    nodes.forEach((node) => {
      if (
        (node.entityNode &&
          condition.test(getComponent(node.entityNode as Entity, NameComponent)?.toLowerCase() ?? '')) ||
        (node.obj3d && condition.test(node.obj3d.name?.toLowerCase() ?? ''))
      )
        nodeSearch.push(node)
    })
  }

  const updateNodeHierarchy = useCallback(() => {
    setNodes(
      getModelNodesFromTreeWalker(
        Array.from(
          heirarchyTreeWalker(getState(SceneState).sceneEntity, selectionState.selectedEntities.value, collapsedNodes)
        ),
        collapsedNodes,
        showObject3DInHierarchy.value
      )
    )
  }, [collapsedNodes])

  useEffect(updateNodeHierarchy, [collapsedNodes])
  useEffect(updateNodeHierarchy, [
    showObject3DInHierarchy,
    selectionState.selectedEntities,
    selectionState.sceneGraphChangeCounter
  ])

  const setSelectedNode = (selection) => !editorState.lockPropertiesPanel.value && _setSelectedNode(selection)

  /* Expand & Collapse Functions */
  const expandNode = useCallback(
    (node: HeirarchyTreeNodeType) => {
      if (node.obj3d) return // todo
      setCollapsedNodes({ ...collapsedNodes, [node.entityNode]: false })
    },
    [collapsedNodes]
  )

  const collapseNode = useCallback(
    (node: HeirarchyTreeNodeType) => {
      if (node.obj3d) return // todo
      setCollapsedNodes({ ...collapsedNodes, [node.entityNode]: true })
    },
    [collapsedNodes]
  )

  const expandChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      handleClose()

      if (node.obj3d) return // todo
      traverseEntityNode(node.entityNode as Entity, (child) => (collapsedNodes[child] = false))
      setCollapsedNodes({ ...collapsedNodes })
    },
    [collapsedNodes]
  )

  const collapseChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      handleClose()

      if (node.obj3d) return // todo
      traverseEntityNode(node.entityNode as Entity, (child) => (collapsedNodes[child] = true))
      setCollapsedNodes({ ...collapsedNodes })
    },
    [collapsedNodes]
  )
  /* Expand & Collapse Functions */

  const onObjectChanged = useCallback(
    (propertyName) => {
      if (propertyName === 'name' || !propertyName) updateNodeHierarchy()
    },
    [collapsedNodes]
  )

  useEffect(() => {
    onObjectChanged(selectionState.propertyName.value)
  }, [selectionState.objectChangeCounter])

  /* Event handlers */
  const onMouseDown = useCallback((e: MouseEvent, node: HeirarchyTreeNodeType) => {
    if (e.detail === 1) {
      if (e.shiftKey) {
        EditorControlFunctions.toggleSelection([node.entityNode ?? node.obj3d!.uuid])
        setSelectedNode(null)
      } else if (!node.selected) {
        EditorControlFunctions.replaceSelection([node.entityNode ?? node.obj3d!.uuid])
        setSelectedNode(node)
      }
    }
  }, [])

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>, item: HeirarchyTreeNodeType) => {
    event.preventDefault()
    event.stopPropagation()

    setContextSelectedItem(item)
    setAnchorEl(event.currentTarget)
    setAnchorPosition({
      left: event.clientX + 2,
      top: event.clientY - 6
    })
  }

  const handleClose = () => {
    setContextSelectedItem(undefined)
    setAnchorEl(null)
    setAnchorPosition(undefined)
  }

  const onClick = useCallback((e: MouseEvent, node: HeirarchyTreeNodeType) => {
    if (node.obj3d) return // todo
    if (e.detail === 2) {
      const editorCameraState = getMutableState(EditorCameraState)
      editorCameraState.focusedObjects.set([node.entityNode])
      editorCameraState.refocus.set(true)
    }
  }, [])

  const onToggle = useCallback(
    (_, node: HeirarchyTreeNodeType) => {
      if (node.obj3d) return // todo
      if (collapsedNodes[node.entityNode as Entity]) expandNode(node)
      else collapseNode(node)
    },
    [collapsedNodes, expandNode, collapseNode]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent, node: HeirarchyTreeNodeType) => {
      const nodeIndex = nodes.indexOf(node)
      const entityTree = getComponent(node.entityNode as Entity, EntityTreeComponent)

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()

          const nextNode = nodeIndex !== -1 && nodes[nodeIndex + 1]
          if (!nextNode) return

          if (e.shiftKey) {
            EditorControlFunctions.addToSelection([nextNode.entityNode ?? nextNode.obj3d!.uuid])
          }

          const nextNodeEl = document.getElementById(getNodeElId(nextNode))
          if (nextNodeEl) nextNodeEl.focus()
          break

        case 'ArrowUp':
          e.preventDefault()

          const prevNode = nodeIndex !== -1 && nodes[nodeIndex - 1]
          if (!prevNode) return

          if (e.shiftKey) {
            EditorControlFunctions.addToSelection([prevNode.entityNode ?? prevNode.obj3d!.uuid])
          }

          const prevNodeEl = document.getElementById(getNodeElId(prevNode))
          if (prevNodeEl) prevNodeEl.focus()
          break

        case 'ArrowLeft':
          if (entityTree && (!entityTree.children || entityTree.children.length === 0)) return
          if (node.obj3d && (!node.obj3d.children || node.obj3d.children.length === 0)) return

          if (e.shiftKey) collapseChildren(node)
          else collapseNode(node)
          break

        case 'ArrowRight':
          if (entityTree && (!entityTree.children || entityTree.children.length === 0)) return
          if (node.obj3d && (!node.obj3d.children || node.obj3d.children.length === 0)) return

          if (e.shiftKey) expandChildren(node)
          else expandNode(node)
          break

        case 'Enter':
          if (e.shiftKey) {
            EditorControlFunctions.toggleSelection([node.entityNode ?? node.obj3d!.uuid])
            setSelectedNode(null)
          } else {
            EditorControlFunctions.replaceSelection([node.entityNode ?? node.obj3d!.uuid])
            setSelectedNode(node)
          }
          break

        case 'Delete':
        case 'Backspace':
          if (selectedNode && !renamingNode) onDeleteNode(selectedNode!)
          break
      }
    },
    [nodes, expandNode, collapseNode, expandChildren, collapseChildren, renamingNode, selectedNode]
  )

  const onDeleteNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    let objs = node.selected
      ? getEntityNodeArrayFromEntities(selectionState.selectedEntities.value)
      : [node.entityNode ?? node.obj3d!.uuid]
    EditorControlFunctions.removeObject(objs)
  }, [])

  const onDuplicateNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    let objs = node.selected
      ? getEntityNodeArrayFromEntities(selectionState.selectedEntities.value)
      : [node.entityNode ?? node.obj3d!.uuid]
    EditorControlFunctions.duplicateObject(objs)
  }, [])

  const onGroupNodes = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    const objs = node.selected
      ? getEntityNodeArrayFromEntities(selectionState.selectedEntities.value)
      : [node.entityNode ?? node.obj3d!.uuid]

    EditorControlFunctions.groupObjects(objs, [], [])
  }, [])
  /* Event handlers */

  /* Rename functions */
  const onRenameNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    if (node.entityNode) {
      const entity = node.entityNode as Entity
      setRenamingNode({ entity, name: getComponent(entity, NameComponent) })
    } else {
      // todo
    }
  }, [])

  const onChangeName = useCallback(
    (node: HeirarchyTreeNodeType, name: string) => setRenamingNode({ entity: node.entityNode as Entity, name }),
    []
  )

  const onRenameSubmit = useCallback((node: HeirarchyTreeNodeType, name: string) => {
    if (name) {
      if (!node.obj3d) updateProperties(NameComponent, name, [node.entityNode])
      const groups = getOptionalComponent(node.entityNode as Entity, GroupComponent)
      if (groups) for (const obj of groups) if (obj) obj.name = name
    }

    setRenamingNode(null)
  }, [])
  /* Rename functions */

  const [, treeContainerDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ItemTypes.Prefab, ...SupportedFileTypes],
    drop(item: any, monitor) {
      if (monitor.didDrop()) return

      // check if item contains files
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding to editor media
        onUpload(entries).then((assets) => {
          if (!assets) return
          for (const asset of assets) addMediaNode(asset)
        })

        return
      }

      if (item.url) {
        addMediaNode(item.url)
        return
      }

      if (item.type === ItemTypes.Prefab) {
        addSceneComponentElement(item) // TODO: need to test this
        return
      }

      EditorControlFunctions.reparentObject(Array.isArray(item.value) ? item.value : [item.value])
    },
    canDrop(item: any, monitor) {
      if (!monitor.isOver({ shallow: true })) return false

      // check if item is of node type
      if (item.type === ItemTypes.Node) {
        const sceneEntity = getState(SceneState).sceneEntity
        return !(item.multiple
          ? item.value.some((otherObject) => isAncestor(otherObject, sceneEntity))
          : isAncestor(item.value, sceneEntity))
      }

      return true
    }
  })

  const HierarchyList = ({ height, width }) => (
    <FixedSizeList
      height={height}
      width={width}
      itemSize={32}
      itemCount={nodeSearch?.length > 0 ? nodeSearch.length : nodes.length}
      itemData={{
        renamingNode,
        nodes: nodeSearch?.length > 0 ? nodeSearch : nodes,
        onKeyDown,
        onChangeName,
        onRenameSubmit,
        onMouseDown,
        onClick,
        onToggle,
        onUpload
      }}
      itemKey={getNodeKey}
      outerRef={treeContainerDropTarget}
      innerElementType="ul"
    >
      {MemoTreeNode}
    </FixedSizeList>
  )

  return (
    <>
      <div className={styles.panelContainer}>
        <div className={styles.dockableTabButtons}>
          {editorState.advancedMode.value && (
            <div style={{ flex: 1 }}>
              {t('editor:hierarchy.lbl-explode')}
              <Checkbox
                className={styles.checkbox}
                classes={{ checked: styles.checkboxChecked }}
                value={editorState.showObject3DInHierarchy.value}
                sx={{ marginLeft: '5px' }}
                onChange={(e, value) =>
                  dispatchAction(EditorAction.showObject3DInHierarchy({ showObject3DInHierarchy: value }))
                }
              />
            </div>
          )}
          <Search elementsName="hierarchy" handleInputChange={setSearchHierarchy} />
        </div>
        {Engine.instance.scene && (
          <div style={{ height: '100%' }}>
            <AutoSizer onResize={HierarchyList}>{HierarchyList}</AutoSizer>
          </div>
        )}
      </div>
      <ContextMenu open={open} anchorEl={anchorEl} anchorPosition={anchorPosition} onClose={handleClose}>
        <MenuItem onClick={() => onRenameNode(contextSelectedItem!)}>{t('editor:hierarchy.lbl-rename')}</MenuItem>
        <Hotkeys
          keyName={cmdOrCtrlString + '+d'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onDuplicateNode(selectedNode!)
          }}
        >
          <MenuItem onClick={() => onDuplicateNode(contextSelectedItem!)}>
            {t('editor:hierarchy.lbl-duplicate')}
            <div>{cmdOrCtrlString + ' + d'}</div>
          </MenuItem>
        </Hotkeys>
        <Hotkeys
          keyName={cmdOrCtrlString + '+g'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onGroupNodes(selectedNode!!)
          }}
        >
          <MenuItem onClick={() => onGroupNodes(contextSelectedItem!)}>
            {t('editor:hierarchy.lbl-group')}
            <div>{cmdOrCtrlString + ' + g'}</div>
          </MenuItem>
        </Hotkeys>
        <MenuItem onClick={() => onDeleteNode(contextSelectedItem!)}>{t('editor:hierarchy.lbl-delete')}</MenuItem>
        <MenuItem onClick={() => expandChildren(contextSelectedItem!)}>{t('editor:hierarchy.lbl-expandAll')}</MenuItem>
        <MenuItem onClick={() => collapseChildren(contextSelectedItem!)}>
          {t('editor:hierarchy.lbl-collapseAll')}
        </MenuItem>
      </ContextMenu>
    </>
  )
}
