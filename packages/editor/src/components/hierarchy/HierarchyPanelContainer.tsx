import React, { useState, useEffect, useCallback, memo, useContext } from 'react'
import { ContextMenu, MenuItem } from '../layout/ContextMenu'
import { useDrop } from 'react-dnd'
import { FixedSizeList, areEqual } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { addItem } from '../dnd'
import useUpload from '../assets/useUpload'
import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { useTranslation } from 'react-i18next'
import { cmdOrCtrlString } from '../../functions/utils'
import EditorEvents from '../../constants/EditorEvents'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { AssetTypes, isAsset, ItemTypes } from '../../constants/AssetTypes'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import Hotkeys from 'react-hot-keys'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorCameraComponent } from '../../classes/EditorCameraComponent'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { getNodeElId, HierarchyTreeNode, HierarchyTreeNodeData, RenameNodeData } from './HierarchyTreeNode'
import { HeirarchyTreeCollapsedNodeType, HeirarchyTreeNodeType, heirarchyTreeWalker } from './HeirarchyTreeWalker'
import { isAncestor } from '../../functions/getDetachedObjectsRoots'
import { AppContext } from '../Search/context'
import styles from './styles.module.scss'

/**
 * uploadOption initializing object containing Properties multiple, accepts.
 *
 * @author Robert Long
 * @type {Object}
 */
const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

/**
 * getNodeKey function used to get object id at given index.
 *
 * @author Robert Long
 * @param  {number} index [index of the node to get object id]
 * @param  {object} data
 * @return {string}
 */
function getNodeKey(index: number, data: HierarchyTreeNodeData) {
  return data.nodes[index].entityNode.entity
}

/**
 * initializing MemoTreeNode.
 *
 * @author Robert Long
 */
const MemoTreeNode = memo(HierarchyTreeNode, areEqual)

/**
 * HierarchyPanel function component provides view for hierarchy tree.
 *
 * @author Robert Long
 * @constructor
 */
export default function HierarchyPanel() {
  const { t } = useTranslation()
  const onUpload = useUpload(uploadOptions)
  const [renamingNode, setRenamingNode] = useState<RenameNodeData | null>(null)
  const [collapsedNodes, setCollapsedNodes] = useState<HeirarchyTreeCollapsedNodeType>({})
  const [nodes, setNodes] = useState<HeirarchyTreeNodeType[]>([])
  let nodeSearch: HeirarchyTreeNodeType[] = []
  const [selectedNode, setSelectedNode] = useState<HeirarchyTreeNodeType | null>(null)
  const { searchHie } = useContext(AppContext)

  if (searchHie.length > 0) {
    const condition = new RegExp(searchHie.toLowerCase())
    nodeSearch = nodes.filter((node) =>
      condition.test(getComponent(node.entityNode.entity, NameComponent).name.toLowerCase())
    )
  }

  const updateNodeHierarchy = useCallback(
    (world = useWorld()) => {
      if (!world.entityTree) return
      setNodes(Array.from(heirarchyTreeWalker(world.entityTree.rootNode, collapsedNodes)))
    },
    [collapsedNodes]
  )

  useEffect(() => updateNodeHierarchy(collapsedNodes), [collapsedNodes])

  /* Expand & Collapse Functions */
  const expandNode = useCallback(
    (node: HeirarchyTreeNodeType) => setCollapsedNodes({ ...collapsedNodes, [node.entityNode.entity]: false }),
    [collapsedNodes]
  )

  const collapseNode = useCallback(
    (node: HeirarchyTreeNodeType) => setCollapsedNodes({ ...collapsedNodes, [node.entityNode.entity]: true }),
    [collapsedNodes]
  )

  const expandChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      node.entityNode.traverse((child) => (collapsedNodes[child.entity] = false))
      setCollapsedNodes({ ...collapsedNodes })
    },
    [collapsedNodes]
  )

  const collapseChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      node.entityNode.traverse((child) => (collapsedNodes[child.entity] = true))
      setCollapsedNodes({ ...collapsedNodes })
    },
    [collapsedNodes]
  )

  const onExpandAllNodes = useCallback(() => setCollapsedNodes({}), [setCollapsedNodes])

  const onCollapseAllNodes = useCallback(() => {
    const newCollapsedNodes = {}
    useWorld().entityTree.traverse((child: any) => (newCollapsedNodes[child.id] = true))
    setCollapsedNodes(newCollapsedNodes)
  }, [])
  /* Expand & Collapse Functions */

  const onObjectChanged = useCallback(
    (_, propertyName) => {
      if (propertyName === 'name' || !propertyName) updateNodeHierarchy(collapsedNodes)
    },
    [collapsedNodes]
  )

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.SCENE_GRAPH_CHANGED.toString(), updateNodeHierarchy)
    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), updateNodeHierarchy)
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), onObjectChanged)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.SCENE_GRAPH_CHANGED.toString(), updateNodeHierarchy)
      CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), updateNodeHierarchy)
      CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), onObjectChanged)
    }
  }, [])

  /* Event handlers */
  const onMouseDown = useCallback((e: MouseEvent, node: HeirarchyTreeNodeType) => {
    if (e.detail === 1) {
      if (e.shiftKey) {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.TOGGLE_SELECTION, node.entityNode)
        setSelectedNode(null)
      } else if (!node.selected) {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, node.entityNode)
        setSelectedNode(node)
      }
    }
  }, [])

  const onClick = useCallback((e: MouseEvent, node: HeirarchyTreeNodeType) => {
    if (e.detail === 2) {
      const cameraComponent = getComponent(Engine.activeCameraEntity, EditorCameraComponent)
      cameraComponent.focusedObjects = [node.entityNode]
      cameraComponent.dirty = true
    }
  }, [])

  const onToggle = useCallback(
    (_, node: HeirarchyTreeNodeType) => {
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
            CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_TO_SELECTION, nextNode.entityNode)
          }

          const nextNodeEl = document.getElementById(getNodeElId(nextNode))
          if (nextNodeEl) nextNodeEl.focus()
          break

        case 'ArrowUp':
          e.preventDefault()

          const prevNode = nodeIndex !== -1 && nodes[nodeIndex - 1]
          if (!prevNode) return

          if (e.shiftKey) {
            CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_TO_SELECTION, prevNode.entityNode)
          }

          const prevNodeEl = document.getElementById(getNodeElId(prevNode))
          if (prevNodeEl) prevNodeEl.focus()
          break

        case 'ArrowLeft':
          if (!node.entityNode.children || node.entityNode.children.length === 0) return

          if (e.shiftKey) collapseChildren(node)
          else collapseNode(node)
          break

        case 'ArrowRight':
          if (!node.entityNode.children || node.entityNode.children.length === 0) return

          if (e.shiftKey) expandChildren(node)
          else expandNode(node)
          break

        case 'Enter':
          if (e.shiftKey) {
            CommandManager.instance.executeCommandWithHistory(EditorCommands.TOGGLE_SELECTION, node.entityNode)
            setSelectedNode(null)
          } else {
            CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, node.entityNode)
            setSelectedNode(node)
          }
          break

        case 'Delete':
        case 'Backspace':
          selectedNode && onDeleteNode(e, selectedNode)
          break
      }
    },
    [nodes, expandNode, collapseNode, expandChildren, collapseChildren]
  )

  const onDeleteNode = useCallback((_, node: HeirarchyTreeNodeType) => {
    let objs = node.selected ? CommandManager.instance.selected : node.entityNode
    CommandManager.instance.executeCommandWithHistory(EditorCommands.REMOVE_OBJECTS, objs, { deselectObject: true })
  }, [])

  const onDuplicateNode = useCallback((_, node: HeirarchyTreeNodeType) => {
    let objs = node.selected ? CommandManager.instance.selected : node.entityNode
    CommandManager.instance.executeCommandWithHistory(EditorCommands.DUPLICATE_OBJECTS, objs)
  }, [])

  const onGroupNodes = useCallback((_, node: HeirarchyTreeNodeType) => {
    const objs = node.selected ? CommandManager.instance.selected : node.entityNode
    CommandManager.instance.executeCommandWithHistory(EditorCommands.GROUP, objs)
  }, [])
  /* Event handlers */

  /* Rename functions */
  const onRenameNode = useCallback((_, node: HeirarchyTreeNodeType) => {
    const entity = node.entityNode.entity
    setRenamingNode({ entity, name: getComponent(entity, NameComponent).name })
  }, [])

  const onChangeName = useCallback(
    (node: HeirarchyTreeNodeType, name: string) => setRenamingNode({ entity: node.entityNode.entity, name }),
    []
  )

  const onRenameSubmit = useCallback((node: HeirarchyTreeNodeType, name: string) => {
    if (name) {
      CommandManager.instance.setPropertyOnEntityNode(node.entityNode, {
        component: NameComponent,
        properties: { name }
      })
    }

    setRenamingNode(null)
  }, [])
  /* Rename functions */

  const [, treeContainerDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop(item: any, monitor) {
      if (monitor.didDrop()) return

      // check if item contains files
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding to editor media
        onUpload(entries).then((assets) => {
          if (!assets) return
          for (const asset of assets) CommandManager.instance.addMedia({ url: asset.url })
        })

        return
      }

      if (addItem(item)) return

      CommandManager.instance.executeCommandWithHistory(EditorCommands.REPARENT, item.value, {
        parents: useWorld().entityTree.rootNode
      })
    },
    canDrop(item: any, monitor) {
      if (!monitor.isOver({ shallow: true })) return false

      if (isAsset(item)) return true

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

  return (
    <>
      <div className={styles.panelContainer}>
        {Engine.scene && (
          <AutoSizer>
            {({ height, width }) => (
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
            )}
          </AutoSizer>
        )}
      </div>
      <ContextMenu id="hierarchy-node-menu">
        <MenuItem onClick={onRenameNode}>{t('editor:hierarchy.lbl-rename')}</MenuItem>
        <Hotkeys
          keyName={cmdOrCtrlString + '+d'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onDuplicateNode(e, selectedNode)
          }}
        >
          <MenuItem onClick={onDuplicateNode}>
            {t('editor:hierarchy.lbl-duplicate')}
            <div>{cmdOrCtrlString + ' + d'}</div>
          </MenuItem>
        </Hotkeys>
        <Hotkeys
          keyName={cmdOrCtrlString + '+g'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onGroupNodes(e, selectedNode)
          }}
        >
          <MenuItem onClick={onGroupNodes}>
            {t('editor:hierarchy.lbl-group')}
            <div>{cmdOrCtrlString + ' + g'}</div>
          </MenuItem>
        </Hotkeys>
        <MenuItem onClick={onDeleteNode}>{t('editor:hierarchy.lbl-delete')}</MenuItem>
        <MenuItem onClick={onExpandAllNodes}>{t('editor:hierarchy.lbl-expandAll')}</MenuItem>
        <MenuItem onClick={onCollapseAllNodes}>{t('editor:hierarchy.lbl-collapseAll')}</MenuItem>
      </ContextMenu>
    </>
  )
}
