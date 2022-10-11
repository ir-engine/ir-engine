import React, { memo, useCallback, useContext, useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import Hotkeys from 'react-hot-keys'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'
import { Object3D } from 'three'

import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities, traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { dispatchAction, useHookEffect } from '@xrengine/hyperflux'

import { Checkbox } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import { PopoverPosition } from '@mui/material/Popover'

import { EditorCameraComponent } from '../../classes/EditorCameraComponent'
import { executeCommandWithHistory, setPropertyOnEntityNode } from '../../classes/History'
import { ItemTypes, SupportedFileTypes } from '../../constants/AssetTypes'
import EditorCommands from '../../constants/EditorCommands'
import { addMediaNode } from '../../functions/addMediaNode'
import { isAncestor } from '../../functions/getDetachedObjectsRoots'
import { cmdOrCtrlString } from '../../functions/utils'
import { EditorAction, useEditorState } from '../../services/EditorServices'
import { accessSelectionState, useSelectionState } from '../../services/SelectionServices'
import useUpload from '../assets/useUpload'
import { addPrefabElement } from '../element/ElementList'
import { ContextMenu } from '../layout/ContextMenu'
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
    accessSelectionState().value.selectedEntities.filter((ent) => typeof ent === 'string') as string[]
  )
  for (const node of inputNodes) {
    outputNodes.push(node)
    const isCollapsed = collapsedNodes[node.entityNode.entity]
    if (showObject3Ds && hasComponent(node.entityNode.entity, ModelComponent)) {
      const obj3d = getComponent(node.entityNode.entity, Object3DComponent)?.value
      if (!obj3d) continue
      node.isLeaf = false
      if (isCollapsed) continue
      let childIndex = node.childIndex
      traverseWithDepth(obj3d, node.depth, (obj, depth) => {
        if (obj === obj3d) return
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
  const selectionState = useSelectionState()
  const [renamingNode, setRenamingNode] = useState<RenameNodeData | null>(null)
  const [collapsedNodes, setCollapsedNodes] = useState<HeirarchyTreeCollapsedNodeType>({})
  const [nodes, setNodes] = useState<HeirarchyTreeNodeType[]>([])
  const nodeSearch: HeirarchyTreeNodeType[] = []
  const [selectedNode, _setSelectedNode] = useState<HeirarchyTreeNodeType | null>(null)
  const editorState = useEditorState()
  const { searchHierarchy } = useContext(AppContext)
  const showObject3DInHierarchy = useEditorState().showObject3DInHierarchy

  const MemoTreeNode = memo(
    (props: HierarchyTreeNodeProps) => <HierarchyTreeNode {...props} onContextMenu={onContextMenu} />,
    areEqual
  )

  if (searchHierarchy.length > 0) {
    const condition = new RegExp(searchHierarchy.toLowerCase())
    nodes.forEach((node) => {
      if (
        (node.entityNode &&
          condition.test(getComponent(node.entityNode.entity, NameComponent)?.name?.toLowerCase() ?? '')) ||
        (node.obj3d && condition.test(node.obj3d.name?.toLowerCase() ?? ''))
      )
        nodeSearch.push(node)
    })
  }

  const updateNodeHierarchy = useCallback(
    (world = Engine.instance.currentWorld) => {
      if (!world.entityTree) return
      setNodes(
        getModelNodesFromTreeWalker(
          Array.from(
            heirarchyTreeWalker(
              world.entityTree.rootNode,
              selectionState.selectedEntities.value,
              collapsedNodes,
              world.entityTree
            )
          ),
          collapsedNodes,
          showObject3DInHierarchy.value
        )
      )
    },
    [collapsedNodes]
  )

  useEffect(updateNodeHierarchy, [collapsedNodes])
  useHookEffect(updateNodeHierarchy, [
    showObject3DInHierarchy,
    selectionState.selectedEntities,
    selectionState.sceneGraphChangeCounter
  ])

  const setSelectedNode = (selection) => !editorState.lockPropertiesPanel.value && _setSelectedNode(selection)

  /* Expand & Collapse Functions */
  const expandNode = useCallback(
    (node: HeirarchyTreeNodeType) => {
      if (node.obj3d) return // todo
      setCollapsedNodes({ ...collapsedNodes, [node.entityNode.entity]: false })
    },
    [collapsedNodes]
  )

  const collapseNode = useCallback(
    (node: HeirarchyTreeNodeType) => {
      if (node.obj3d) return // todo
      setCollapsedNodes({ ...collapsedNodes, [node.entityNode.entity]: true })
    },
    [collapsedNodes]
  )

  const expandChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      handleClose()

      if (node.obj3d) return // todo
      traverseEntityNode(node.entityNode, (child) => (collapsedNodes[child.entity] = false))
      setCollapsedNodes({ ...collapsedNodes })
    },
    [collapsedNodes]
  )

  const collapseChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      handleClose()

      if (node.obj3d) return // todo
      traverseEntityNode(node.entityNode, (child) => (collapsedNodes[child.entity] = true))
      setCollapsedNodes({ ...collapsedNodes })
    },
    [collapsedNodes]
  )
  /* Expand & Collapse Functions */

  const onObjectChanged = useCallback(
    (_, propertyName) => {
      if (propertyName === 'name' || !propertyName) updateNodeHierarchy()
    },
    [collapsedNodes]
  )

  useEffect(() => {
    onObjectChanged(selectionState.affectedObjects.value, selectionState.propertyName.value)
  }, [selectionState.objectChangeCounter])

  /* Event handlers */
  const onMouseDown = useCallback((e: MouseEvent, node: HeirarchyTreeNodeType) => {
    if (e.detail === 1) {
      if (e.shiftKey) {
        executeCommandWithHistory({
          type: EditorCommands.TOGGLE_SELECTION,
          affectedNodes: [node.entityNode ?? node.obj3d!.uuid]
        })
        setSelectedNode(null)
      } else if (!node.selected) {
        executeCommandWithHistory({
          type: EditorCommands.REPLACE_SELECTION,
          affectedNodes: [node.entityNode ?? node.obj3d!.uuid]
        })
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
      const cameraComponent = getComponent(Engine.instance.currentWorld.cameraEntity, EditorCameraComponent)
      cameraComponent.focusedObjects = [node.entityNode]
      cameraComponent.refocus = true
    }
  }, [])

  const onToggle = useCallback(
    (_, node: HeirarchyTreeNodeType) => {
      if (node.obj3d) return // todo
      if (collapsedNodes[node.entityNode.entity]) expandNode(node)
      else collapseNode(node)
    },
    [collapsedNodes, expandNode, collapseNode]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent, node: HeirarchyTreeNodeType) => {
      const nodeIndex = nodes.indexOf(node)

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()

          const nextNode = nodeIndex !== -1 && nodes[nodeIndex + 1]
          if (!nextNode) return

          if (e.shiftKey) {
            executeCommandWithHistory({
              type: EditorCommands.ADD_TO_SELECTION,
              affectedNodes: [nextNode.entityNode ?? nextNode.obj3d!.uuid]
            })
          }

          const nextNodeEl = document.getElementById(getNodeElId(nextNode))
          if (nextNodeEl) nextNodeEl.focus()
          break

        case 'ArrowUp':
          e.preventDefault()

          const prevNode = nodeIndex !== -1 && nodes[nodeIndex - 1]
          if (!prevNode) return

          if (e.shiftKey) {
            executeCommandWithHistory({
              type: EditorCommands.ADD_TO_SELECTION,
              affectedNodes: [prevNode.entityNode ?? prevNode.obj3d!.uuid]
            })
          }

          const prevNodeEl = document.getElementById(getNodeElId(prevNode))
          if (prevNodeEl) prevNodeEl.focus()
          break

        case 'ArrowLeft':
          if (node.entityNode && (!node.entityNode.children || node.entityNode.children.length === 0)) return
          if (node.obj3d && (!node.obj3d.children || node.obj3d.children.length === 0)) return

          if (e.shiftKey) collapseChildren(node)
          else collapseNode(node)
          break

        case 'ArrowRight':
          if (node.entityNode && (!node.entityNode.children || node.entityNode.children.length === 0)) return
          if (node.obj3d && (!node.obj3d.children || node.obj3d.children.length === 0)) return

          if (e.shiftKey) expandChildren(node)
          else expandNode(node)
          break

        case 'Enter':
          if (e.shiftKey) {
            executeCommandWithHistory({
              type: EditorCommands.TOGGLE_SELECTION,
              affectedNodes: [node.entityNode ?? node.obj3d!.uuid]
            })
            setSelectedNode(null)
          } else {
            executeCommandWithHistory({
              type: EditorCommands.REPLACE_SELECTION,
              affectedNodes: [node.entityNode ?? node.obj3d!.uuid]
            })
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
    executeCommandWithHistory({ type: EditorCommands.REMOVE_OBJECTS, affectedNodes: objs })
  }, [])

  const onDuplicateNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    let objs = node.selected
      ? getEntityNodeArrayFromEntities(selectionState.selectedEntities.value)
      : [node.entityNode ?? node.obj3d!.uuid]
    executeCommandWithHistory({ type: EditorCommands.DUPLICATE_OBJECTS, affectedNodes: objs })
  }, [])

  const onGroupNodes = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    const objs = node.selected
      ? getEntityNodeArrayFromEntities(selectionState.selectedEntities.value)
      : [node.entityNode ?? node.obj3d!.uuid]
    executeCommandWithHistory({ type: EditorCommands.GROUP, affectedNodes: objs })
  }, [])
  /* Event handlers */

  /* Rename functions */
  const onRenameNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    if (node.entityNode) {
      const entity = node.entityNode.entity
      setRenamingNode({ entity, name: getComponent(entity, NameComponent).name })
    } else {
      // todo
    }
  }, [])

  const onChangeName = useCallback(
    (node: HeirarchyTreeNodeType, name: string) => setRenamingNode({ entity: node.entityNode.entity, name }),
    []
  )

  const onRenameSubmit = useCallback((node: HeirarchyTreeNodeType, name: string) => {
    if (name) {
      setPropertyOnEntityNode({
        affectedNodes: [node.entityNode ?? node.obj3d],
        component: NameComponent,
        properties: [{ name }]
      })

      const obj3d = getComponent(node.entityNode.entity, Object3DComponent)?.value
      if (obj3d) obj3d.name = name
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
        addPrefabElement(item)
        return
      }

      executeCommandWithHistory({
        type: EditorCommands.REPARENT,
        affectedNodes: [item.value],
        parents: [Engine.instance.currentWorld.entityTree.rootNode]
      })
    },
    canDrop(item: any, monitor) {
      if (!monitor.isOver({ shallow: true })) return false

      // check if item is of node type
      if (item.type === ItemTypes.Node) {
        const world = useWorld()
        return !(item.multiple
          ? item.value.some((otherObject) => isAncestor(otherObject, world.entityTree.rootNode))
          : isAncestor(item.value, world.entityTree.rootNode))
      }

      return true
    }
  })

  const HierarchyList = //useCallback(
    ({ height, width }) => (
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
    ) //,
  //[editorState.advancedMode, editorState.projectLoaded, collapsedNodes, showObject3DInHierarchy, selectedNode, updateNodeHierarchy]
  //)

  return (
    <>
      <div className={styles.panelContainer}>
        <div className={styles.dockableTabButtons}>
          <Search elementsName="hierarchy" handleInputChange={setSearchHierarchy} />
          {editorState.advancedMode.value && (
            <>
              {t('editor:hierarchy.lbl-explode')}
              <Checkbox
                style={{ padding: '0px' }}
                value={editorState.showObject3DInHierarchy.value}
                onChange={(e, value) =>
                  dispatchAction(EditorAction.showObject3DInHierarchy({ showObject3DInHierarchy: value }))
                }
              />
            </>
          )}
        </div>
        {Engine.instance.currentWorld.scene && (
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
