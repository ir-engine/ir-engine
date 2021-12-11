import React, { useState, useEffect, useCallback, memo, Fragment } from 'react'
import styled from 'styled-components'
import { ContextMenu, MenuItem, ContextMenuTrigger } from '../layout/ContextMenu'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { FixedSizeList, areEqual } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { addAssetOnDrop } from '../dnd'
import useUpload from '../assets/useUpload'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import NodeIssuesIcon from './NodeIssuesIcon'
import { useTranslation } from 'react-i18next'
import { cmdOrCtrlString } from '../../functions/utils'
import traverseEarlyOut from '../../functions/traverseEarlyOut'
import EditorEvents from '../../constants/EditorEvents'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { EntityNodeEditor } from '../../managers/NodeManager'
import { AssetTypes, isAsset, ItemTypes } from '../../constants/AssetTypes'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import Hotkeys from 'react-hot-keys'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorCameraComponent } from '../../classes/EditorCameraComponent'
import { SceneManager } from '../../managers/SceneManager'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'

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
 * PanelContainer used as wrapper element for   penal content.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const PanelContainer = (styled as any).div`
  outline: none;
  user-select: none;
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  color: ${(props) => props.theme.text2};
`

/**
 * TreeDepthContainer used to provide the styles for hierarchy tree.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeDepthContainer = (styled as any).li``

/**
 * treeNodeBackgroundColor function used to provide background color for tree nodes.
 *
 * @author Robert Long
 * @param  {boolean} root
 * @param  {boolean} selected
 * @param  {boolean} active
 * @param  {object} theme
 * @return {string}
 */
function treeNodeBackgroundColor({ root, selected, active, theme }) {
  if (selected) {
    if (active) {
      return theme.bluePressed
    } else {
      return theme.selected
    }
  } else {
    if (root) {
      return theme.panel2
    } else {
      return theme.panel
    }
  }
}

/**
 * getNodeKey function used to get object id at given index.
 *
 * @author Robert Long
 * @param  {number} index [index of the node to get object id]
 * @param  {object} data
 * @return {string}
 */
function getNodeKey(index, data) {
  return data.nodes[index].object.entity
}

/**
 * getNodeElId function provides id for node.
 *
 * @author Robert Long
 * @param  {object} node
 * @return {string}
 */
function getNodeElId(node) {
  return 'hierarchy-node-' + node.id
}

/**
 * TreeNodeContainer used to provide styles to node tree.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  outline: none;
  overflow: hidden;

  background-color: ${treeNodeBackgroundColor};
  border-bottom: ${(props) => (props.root ? props.theme.borderStyle : 'none')};

  color: ${(props) => (props.selected || props.focused ? props.theme.text : props.theme.text2)};

  :hover,
  :focus {
    background-color: ${(props) => (props.selected ? props.theme.blueHover : props.theme.hover)};
    color: ${(props) => props.theme.text};
  }

  :active {
    background-color: ${(props) => props.theme.bluePressed};
    color: ${(props) => props.theme.text};
  }
`

/**
 * TreeNodeSelectTarget used to provide styles for node inside hierarchy container.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeSelectTarget = (styled as any).div`
  display: flex;
  flex: 1;
  padding: 2px 4px 2px 0;
`

/**
 * TreeNodeLabelContainer used to provide styles for label text on hierarchy node.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeLabelContainer = (styled as any).div`
  display: flex;
  flex: 1;
`

/**
 * TreeNodeContent used to provide styles for container element of TreeNodeIcon TreeNodeLabel.
 *
 * @author Robert Long
 * @type {Styled Component}
 */
const TreeNodeContent = (styled as any).div`
  outline: none;
  display: flex;
  padding-right: 8px;
  padding-left: ${(props) => props.depth * 8 + 2 + 'px'};
`

/**
 * TreeNodeToggle creates element used to toggle node.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeToggle = (styled as any).div`
  padding: 2px 4px;
  margin: 0 4px;

  :hover {
    color: ${(props) => props.theme.text};
    background-color: ${(props) => props.theme.hover2};
    border-radius: 3px;
  }
`

/**
 * TreeNodeLeafSpacer used to create space between leaf node.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeLeafSpacer = (styled as any).div`
  width: 20px;
`

/**
 * TreeNodeIcon used provide style for icon inside tree node.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeIcon = (styled as any).div`
  width: 12px;
  height: 12px;
  margin: 2px 4px;
`

/**
 * TreeNodeLabel used to provide styles for label content of tree node.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeLabel = (styled as any).div`
  background-color: ${(props) => (props.isOver && props.canDrop ? 'rgba(255, 255, 255, 0.3)' : 'transparent')};
  color: ${(props) => (props.isOver && props.canDrop ? props.theme.text : 'inherit')};
  border-radius: 4px;
  padding: 0 2px;
`

/**
 * borderStyle function used to provide styles for border.
 *
 * @author Robert Long
 * @param  {Boolean} isOver
 * @param  {Boolean}  canDrop
 * @param  {string}  position
 * @return {string}
 */
function borderStyle({ isOver, canDrop, position }) {
  if (isOver && canDrop) {
    return `border-${position === 'before' ? 'top' : 'bottom'}: 2px solid rgba(255, 255, 255, 0.3)`
  } else {
    return ''
  }
}

/**
 * TreeNodeDropTarget used to provide styles to drop target node.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeDropTarget = (styled as any).div`
  height: 4px;
  box-sizing: content-box;
  ${borderStyle};
  margin-left: ${(props) => (props.depth > 0 ? props.depth * 8 + 20 : 0)}px;
`

/**
 * TreeNodeRenameInput used to provides styles for rename input of node.
 *
 * @author Robert Long
 * @type {Styled Component}
 */
const TreeNodeRenameInput = (styled as any).input`
  position: absolute;
  top: -3px;
  background-color: ${(props) => props.theme.inputBackground};
  color: ${(props) => props.theme.text};
  border: ${(props) => props.theme.borderStyle};
  padding: 2px 4px;
`

/**
 * TreeNodeRenameInputContainer used to provide styles for rename input container of tree node.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeRenameInputContainer = (styled as any).div`
  position: relative;
  height: 15px;
`

/**
 * isAncestor used to check if object contains leaf nodes or not.
 *
 * @author Robert Long
 * @param  {object}  object
 * @param  {object}  otherObject
 * @return {Boolean}
 */
function isAncestor(object, otherObject) {
  return !traverseEarlyOut(object, (child) => child !== otherObject)
}

/**
 * TreeNode function provides tree node hierarchy view.
 *
 * @author Robert Long
 * @param       {number} index
 * @param       {object} data
 * @param       {object} renamingNode
 * @param       {function} onToggle
 * @param       {function} onKeyDown
 * @param       {function} onMouseDown
 * @param       {function} onClick
 * @param       {function} onChangeName
 * @param       {function} onRenameSubmit
 * @param       {function} onUpload
 * @param       {object} style
 * @constructor
 */
function TreeNode({
  index,
  data: { nodes, renamingNode, onToggle, onKeyDown, onMouseDown, onClick, onChangeName, onRenameSubmit, onUpload },
  style
}) {
  //initializing node from nodes array at specific index
  const node = nodes[index]

  //initializing variables using node.
  const { isLeaf, object, depth, selected, active, isCollapsed, childIndex, lastChild } = node

  //callback function to handle click on node of hierarchy panel
  const onClickToggle = useCallback(
    (e) => {
      e.stopPropagation()

      if (onToggle) {
        onToggle(e, node)
      }
    },
    [onToggle, node]
  )

  //callback function used to handle KeyDown event on node
  const onNodeKeyDown = useCallback(
    (e) => {
      e.stopPropagation()

      if (onKeyDown) {
        onKeyDown(e, node)
      }
    },
    [onKeyDown, node]
  )

  /**
   * onKeyDownNameInput callback function to handle key down event on name input.
   *
   * @author Robert Long
   * @type {function}
   */
  const onKeyDownNameInput = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onRenameSubmit(node, null)
      } else if (e.key === 'Enter') {
        onRenameSubmit(node, e.target.value)
      }
    },
    [onRenameSubmit, node]
  )

  /**
   * onClickNode callback function used to hanlde click node inside hierarchy panel.
   *
   * @author Robert Long
   * @type {function}
   */
  const onClickNode = useCallback(
    (e) => {
      onClick(e, node)
    },
    [node, onClick]
  )

  /**
   * onMouseDownNode callback function used to handle mouse down event on node.
   *
   * @author Robert Long
   * @type {function}
   */
  const onMouseDownNode = useCallback(
    (e) => {
      onMouseDown(e, node)
    },
    [node, onMouseDown]
  )

  /**
   * onChangeNodeName callback function used to handle change in name of node.
   *
   * @author Robert Long
   * @type {function}
   */
  const onChangeNodeName = useCallback(
    (e) => {
      onChangeName(node, e.target.value)
    },
    [node, onChangeName]
  )

  /**
   * onSubmitNodeName callback function to handle submit or rename nade input.
   *
   * @author Robert Long
   * @type {function}
   */
  const onSubmitNodeName = useCallback(
    (e) => {
      onRenameSubmit(node, e.target.value)
    },
    [onRenameSubmit, node]
  )

  /**
   * initializing renaming setting renaming true if renamingNode id equals node id.
   *
   * @author Robert Long
   * @type {boolean}
   */
  const renaming = renamingNode && renamingNode.id === node.id

  //initializing _dragProps, drag, preview
  const [_dragProps, drag, preview] = useDrag({
    type: ItemTypes.Node,
    item() {
      const multiple = CommandManager.instance.selected.length > 1
      return {
        type: ItemTypes.Node,
        multiple,
        value: multiple ? CommandManager.instance.selected : CommandManager.instance.selected[0]
      }
    },
    canDrag() {
      return !CommandManager.instance.selected.some((selectedObj) => !selectedObj.parent)
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  //calling preview function with change in property
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  //initializing canDropBefore and isOverBefore
  const [{ canDropBefore, isOverBefore }, beforeDropTarget] = useDrop({
    //initializing accept type with array containing node itemTypes, file ItemTypes and asset types
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],

    //function used to drop items
    drop(item: any, monitor) {
      //check if item contain files
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding as media to the editor
        onUpload(entries).then((assets) => {
          if (assets) {
            for (const asset of assets) {
              CommandManager.instance.addMedia({ url: asset.url }, object.parent, object)
            }
          }
        })
        return
      }

      //check if addAssetOnDrop returns true then return
      if (addAssetOnDrop(item, object.parent, object)) {
        return
      } else {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.REPARENT, item.value, {
          parents: object.parent,
          befores: object
        })
      }
    },
    canDrop(item, monitor) {
      //used to check item that item is dropable or not

      //check if monitor is over or object is not parent element
      if (!monitor.isOver() || !object.parent) {
        return false
      }

      //check item is asset
      if (isAsset(item)) {
        return true
      }

      //check if item type is equals to node
      if (item.type === ItemTypes.Node) {
        return (
          object.parent &&
          !(item.multiple
            ? item.value.some((otherObject) => isAncestor(otherObject, object))
            : isAncestor(item.value, object))
        )
      }

      return true
    },
    collect: (monitor) => ({
      canDropBefore: monitor.canDrop(),
      isOverBefore: monitor.isOver()
    })
  })

  /**
   * initializing variable using useDrop.
   *
   * @author Robert Long
   */
  const [{ canDropAfter, isOverAfter }, afterDropTarget] = useDrop({
    // initializing accept with array containing types
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop(item: any, monitor) {
      // initializing next and is true if not last child and object parent contains children property and contain childIndex
      const next = !lastChild && object.parent.children[childIndex + 1]

      //check if item contains files
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding assets to editor media
        onUpload(entries).then((assets) => {
          if (assets) {
            for (const asset of assets) {
              CommandManager.instance.addMedia({ url: asset.url }, object.parent, next)
            }
          }
        })
        return
      }

      if (addAssetOnDrop(item, object.parent, next)) {
        return
      } else {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.REPARENT, item.value, {
          parents: object.parent,
          befores: next
        })
      }
    },

    /**
     * canDrop used to check item is dropable or not.
     *
     * @author Robert Long
     * @param  {object} item
     * @param  {object} monitor
     * @return {boolean}
     */
    canDrop(item, monitor) {
      if (!monitor.isOver() || !object.parent) {
        return false
      }

      // check if item is asset
      if (isAsset(item)) {
        return true
      }

      //check if item is of node type
      if (item.type === ItemTypes.Node) {
        return (
          object.parent &&
          !(item.multiple
            ? item.value.some((otherObject) => isAncestor(otherObject, object))
            : isAncestor(item.value, object))
        )
      }

      return true
    },
    collect: (monitor) => ({
      canDropAfter: monitor.canDrop(),
      isOverAfter: monitor.isOver()
    })
  })

  const [{ canDropOn, isOverOn }, onDropTarget] = useDrop({
    //initializing accept with array containing types
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop(item: any, monitor) {
      // check if item contain files
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding assets to editor media
        onUpload(entries).then((assets) => {
          if (assets) {
            for (const asset of assets) {
              CommandManager.instance.addMedia({ url: asset.url }, object)
            }
          }
        })
        return
      }

      if (addAssetOnDrop(item, object)) {
        return
      } else {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.REPARENT, item.value, { parents: object })
      }
    },
    canDrop(item, monitor) {
      // check if monitor is not over
      if (!monitor.isOver()) {
        return false
      }

      //check item is asset
      if (isAsset(item)) {
        return true
      }

      // check if item is of node type
      if (item.type === ItemTypes.Node) {
        return !(item.multiple
          ? item.value.some((otherObject) => isAncestor(otherObject, object))
          : isAncestor(item.value, object))
      }

      return true
    },
    collect: (monitor) => ({
      canDropOn: monitor.canDrop(),
      isOverOn: monitor.isOver()
    })
  })

  const collectNodeMenuProps = useCallback(() => {
    return node
  }, [node])

  const nameComponent = getComponent(object.entity, NameComponent)
  const entityNodeComponent = getComponent(object.entity, EntityNodeComponent)

  const iconComponent =
    entityNodeComponent && EntityNodeEditor[entityNodeComponent.type]
      ? EntityNodeEditor[entityNodeComponent.type].iconComponent
      : null

  //returning tree view for hierarchy panel
  return (
    <TreeDepthContainer style={style}>
      <ContextMenuTrigger holdToDisplay={-1} id="hierarchy-node-menu" collect={collectNodeMenuProps}>
        <TreeNodeContainer
          ref={drag}
          id={getNodeElId(node)}
          onMouseDown={onMouseDownNode}
          onClick={onClickNode}
          tabIndex="0"
          onKeyDown={onNodeKeyDown}
          root={depth === 0}
          selected={selected}
          active={active}
        >
          <TreeNodeDropTarget
            ref={beforeDropTarget}
            depth={depth}
            position="before"
            canDrop={canDropBefore}
            isOver={isOverBefore}
          />
          <TreeNodeContent depth={depth} ref={onDropTarget}>
            {isLeaf ? (
              <TreeNodeLeafSpacer />
            ) : (
              <TreeNodeToggle collapsed={isCollapsed} onClick={onClickToggle}>
                {isCollapsed ? <ArrowRightIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />}
              </TreeNodeToggle>
            )}

            <TreeNodeSelectTarget>
              <TreeNodeIcon as={iconComponent} />
              <TreeNodeLabelContainer>
                {renaming ? (
                  <TreeNodeRenameInputContainer>
                    <TreeNodeRenameInput
                      type="text"
                      onChange={onChangeNodeName}
                      onKeyDown={onKeyDownNameInput}
                      onBlur={onSubmitNodeName}
                      value={renamingNode.name}
                      autoFocus
                    />
                  </TreeNodeRenameInputContainer>
                ) : (
                  <TreeNodeLabel canDrop={canDropOn} isOver={isOverOn}>
                    {nameComponent.name}
                  </TreeNodeLabel>
                )}
              </TreeNodeLabelContainer>
              {node.object.issues && node.object.issues.length > 0 && <NodeIssuesIcon node={node.object} />}
            </TreeNodeSelectTarget>
          </TreeNodeContent>

          <TreeNodeDropTarget
            depth={depth}
            ref={afterDropTarget}
            position="after"
            canDrop={canDropAfter}
            isOver={isOverAfter}
          />
        </TreeNodeContainer>
      </ContextMenuTrigger>
    </TreeDepthContainer>
  )
}

/**
 * initializing MemoTreeNode.
 *
 * @author Robert Long
 */
const MemoTreeNode = memo(TreeNode, areEqual)

type TreeNodeType = {
  depth: number
  object: any
  childIndex: number
  lastChild: boolean
}

/**
 * treeWalker function used to handle tree.
 *
 * @author Robert Long
 * @param  {object}    collapsedNodes
 */
function* treeWalker(collapsedNodes, treeObject) {
  const stack = [] as TreeNodeType[]

  if (!treeObject) return

  stack.push({
    depth: 0,
    object: treeObject,
    childIndex: 0,
    lastChild: true
  })

  while (stack.length !== 0) {
    const { depth, object, childIndex, lastChild } = stack.pop() as TreeNodeType
    const isCollapsed = collapsedNodes[object.id]

    yield {
      isLeaf: !object.children || object.children.length === 0,
      isCollapsed,
      depth,
      object,
      selected: CommandManager.instance.selected.indexOf(object) !== -1,
      active:
        CommandManager.instance.selected.length > 0 &&
        object === CommandManager.instance.selected[CommandManager.instance.selected.length - 1],
      childIndex,
      lastChild
    }

    if (object.children && object.children.length !== 0 && !isCollapsed) {
      for (let i = object.children.length - 1; i >= 0; i--) {
        const child = object.children[i]

        stack.push({
          depth: depth + 1,
          object: child,
          childIndex: i,
          lastChild: i === 0
        })
      }
    }
  }
}

/**
 * HierarchyPanel function component provides view for hierarchy tree.
 *
 * @author Robert Long
 * @constructor
 */
export default function HierarchyPanel() {
  const onUpload = useUpload(uploadOptions)
  const [renamingNode, setRenamingNode] = useState(null)
  const [collapsedNodes, setCollapsedNodes] = useState({})
  const [nodes, setNodes] = useState<any[]>([])
  const [selectedNode, setSelectedNode] = useState(null)
  const updateNodeHierarchy = useCallback(() => {
    const world = useWorld()

    if (!world.entityTree) return

    const nodes = Array.from(treeWalker(collapsedNodes, world.entityTree.rootNode))
    setNodes(nodes)
  }, [collapsedNodes])
  const { t } = useTranslation()

  /**
   * expandNode callback function used to expand node.
   *
   * @author Robert Long
   * @type {function}
   */
  const expandNode = useCallback(
    (node) => {
      delete collapsedNodes[node.id]
      setCollapsedNodes({ ...collapsedNodes })
    },
    [collapsedNodes]
  )

  /**
   * collapseNode function used to collapse node.
   *
   * @author Robert Long
   * @type {function}
   */
  const collapseNode = useCallback(
    (node) => {
      setCollapsedNodes({ ...collapsedNodes, [node.id]: true })
    },
    [setCollapsedNodes, collapsedNodes]
  )

  /**
   * expandChildren function used to expand children.
   *
   * @author Robert Long
   * @type {function}
   */
  const expandChildren = useCallback(
    (node) => {
      node.object.traverse((child) => {
        if (child.isNode) {
          delete collapsedNodes[child.id]
        }
      })
      setCollapsedNodes({ ...collapsedNodes })
    },
    [setCollapsedNodes, collapsedNodes]
  )

  /**
   * collapseChildren function used to collapse children.
   *
   * @author Robert Long
   * @type {function}
   */
  const collapseChildren = useCallback(
    (node) => {
      node.object.traverse((child) => {
        if (child.isNode) {
          collapsedNodes[child.id] = true
        }
      })
      setCollapsedNodes({ ...collapsedNodes })
    },
    [setCollapsedNodes, collapsedNodes]
  )

  /**
   * function used to expand all node.
   *
   * @author Robert Long
   * @type {function}
   */
  const onExpandAllNodes = useCallback(() => {
    setCollapsedNodes({})
  }, [setCollapsedNodes])

  /**
   * function used to collapse all nodes.
   *
   * @author Robert Long
   * @type {function}
   */
  const onCollapseAllNodes = useCallback(() => {
    const newCollapsedNodes = {}
    Engine.scene.traverse((child: any) => {
      if (child.isNode) {
        newCollapsedNodes[child.id] = true
      }
    })
    setCollapsedNodes(newCollapsedNodes)
  }, [setCollapsedNodes])

  /**
   * onObjectChanged callback function used to handle changes on object.
   *
   * @author Robert Long
   * @type {function}
   */
  const onObjectChanged = useCallback(
    (objects, propertyName) => {
      if (propertyName === 'name' || !propertyName) {
        updateNodeHierarchy()
      }
    },
    [updateNodeHierarchy]
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
  }, [updateNodeHierarchy, onObjectChanged])

  /**
   * onMouseDown callback function used to handle mouse down event.
   *
   * @author Robert Long
   * @type {function}
   */
  const onMouseDown = useCallback((e, node) => {
    if (e.detail === 1) {
      if (e.shiftKey) {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.TOGGLE_SELECTION, node.object)
        setSelectedNode(null)
      } else if (!node.selected) {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, node.object)
        setSelectedNode(node)
      }
    }
  }, [])

  /**
   * onClick callback function for handling onClick event on hierarchy penal item.
   *
   * @author Robert Long
   * @type {function}
   */
  const onClick = useCallback((e, node) => {
    if (e.detail === 2) {
      const cameraComponent = getComponent(SceneManager.instance.cameraEntity, EditorCameraComponent)
      cameraComponent.focusedObjects = [node.object]
      cameraComponent.dirty = true
    }
  }, [])

  /**
   * onToggle function used to handle toggle on hierarchy penal item.
   *
   * @author Robert Long
   * @type {function}
   */
  const onToggle = useCallback(
    (_e, node) => {
      if (collapsedNodes[node.id]) {
        expandNode(node)
      } else {
        collapseNode(node)
      }
    },
    [collapsedNodes, expandNode, collapseNode]
  )

  /**
   * onKeyDown callback function to handle onKeyDown event on hierarchy penal item.
   *
   * @author Robert Long
   * @type {function}
   */
  const onKeyDown = useCallback(
    (e, node) => {
      // check if key equals to ArrowDown
      if (e.key === 'ArrowDown') {
        e.preventDefault()

        // initializing nodeIndex using nodes array
        const nodeIndex = nodes.indexOf(node)

        // initializing nextNode using nodes array
        const nextNode = nodeIndex !== -1 && nodes[nodeIndex + 1]

        // check if nextNode is not Empty
        if (nextNode) {
          if (e.shiftKey) {
            CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_TO_SELECTION, nextNode.object)
          }
          // initializing nextNodeEl using nextNode element id
          const nextNodeEl = document.getElementById(getNodeElId(nextNode))

          //check if nextNodeEl is not empty
          if (nextNodeEl) {
            nextNodeEl.focus()
          }
        }

        //check if pressed key equals to ArrowUp
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()

        // initializing nodeIndex  using nodes array
        const nodeIndex = nodes.indexOf(node)

        // initializing prevNode using nodes array current nodeIndex -1
        const prevNode = nodeIndex !== -1 && nodes[nodeIndex - 1]

        // if prevNode is not empty
        if (prevNode) {
          if (e.shiftKey) {
            CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_TO_SELECTION, prevNode.object)
          }

          // initializing prevNodeEl using prevNode Id
          const prevNodeEl = document.getElementById(getNodeElId(prevNode))

          //check if prevNodeEl is not empty
          if (prevNodeEl) {
            prevNodeEl.focus()
          }
        }
        // check if pressed key equals to left arrow and node object children node length is greator then 0
      } else if (e.key === 'ArrowLeft' && node.object.children.filter((o) => o.isNode).length > 0) {
        if (e.shiftKey) {
          collapseChildren(node)
        } else {
          collapseNode(node)
        }

        //check if pressed key equals to arrow right
        //and node property object children node length ius greator then zero.
      } else if (e.key === 'ArrowRight' && node.object.children.filter((o) => o.isNode).length > 0) {
        if (e.shiftKey) {
          expandChildren(node)
        } else if (node.object.children.filter((o) => o.isNode).length > 0) {
          expandNode(node)
        }

        //check if pressed key equals to enter
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          CommandManager.instance.executeCommandWithHistory(EditorCommands.TOGGLE_SELECTION, node.object)
          setSelectedNode(null)
        } else {
          CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, node.object)
          setSelectedNode(node)
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedNode && onDeleteNode(e, selectedNode)
      }
    },
    [nodes, expandNode, collapseNode, expandChildren, collapseChildren]
  )

  /**
   * onDeleteNode callback function used to handle delete on node.
   *
   * @author Robert Long
   * @type {function}
   */
  const onDeleteNode = useCallback((e, node) => {
    let objs = node.selected ? CommandManager.instance.selected : node.object
    CommandManager.instance.executeCommandWithHistory(EditorCommands.REMOVE_OBJECTS, objs)
  }, [])

  /**
   * onDuplicateNode callback function to handle Duplication of node.
   *
   * @author Robert Long
   * @type {function}
   */
  const onDuplicateNode = useCallback((e, node) => {
    let objs = node.selected ? CommandManager.instance.selected : node.object
    CommandManager.instance.executeCommandWithHistory(EditorCommands.DUPLICATE_OBJECTS, objs)
  }, [])

  /**
   * onGroupNodes callback function used to handle grouping of nodes.
   *
   * @author Robert Long
   * @type {function}
   */
  const onGroupNodes = useCallback((e, node) => {
    const objs = node.selected ? CommandManager.instance.selected : node.object
    CommandManager.instance.executeCommandWithHistory(EditorCommands.GROUP, objs)
  }, [])

  /**
   * onRenameNode callback function to handle rename node.
   *
   * @author Robert Long
   * @type {function}
   */
  const onRenameNode = useCallback(
    (e, node) => {
      setRenamingNode({ id: node.id, name: node.object.name })
    },
    [setRenamingNode]
  )

  /**
   * onChangeName callback  function used to handle changes in name.
   *
   * @author Robert Long
   * @type {function}
   */
  const onChangeName = useCallback(
    (node, name) => {
      setRenamingNode({ id: node.id, name })
    },
    [setRenamingNode]
  )

  /**
   * onRenameSubmit callback function used to handle rename input submit.
   *
   * @author Robert Long
   * @type {function}
   */
  const onRenameSubmit = useCallback((node, name) => {
    if (name !== null) {
      CommandManager.instance.executeCommand(EditorCommands.MODIFY_PROPERTY, node.object, { properties: { name } })
    }
    setRenamingNode(null)
  }, [])

  /**
   * initializing treeContainerDropTarget.
   *
   * @author Robert Long
   * @type {Array}
   */
  const [, treeContainerDropTarget] = useDrop({
    // initializing accept using array of  types
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop(item: any, monitor) {
      if (monitor.didDrop()) {
        return
      }

      // check if item contains files
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding to editor media
        onUpload(entries).then((assets) => {
          if (assets) {
            for (const asset of assets) {
              CommandManager.instance.addMedia({ url: asset.url })
            }
          }
        })
        return
      }

      if (addAssetOnDrop(item)) {
        return
      }

      CommandManager.instance.executeCommandWithHistory(EditorCommands.REPARENT, item.value, { parents: Engine.scene })
    },
    canDrop(item, monitor) {
      if (!monitor.isOver({ shallow: true })) {
        return false
      }
      // check if item is asset
      if (isAsset(item)) {
        return true
      }
      // check if item is of node type
      if (item.type === ItemTypes.Node) {
        return !(item.multiple
          ? item.value.some((otherObject) => isAncestor(otherObject, Engine.scene))
          : isAncestor(item.value, Engine.scene))
      }

      return true
    }
  })

  useEffect(() => {
    updateNodeHierarchy()
  }, [collapsedNodes, updateNodeHierarchy])

  //returning hierarchy penal view
  return (
    <Fragment>
      <PanelContainer>
        {Engine.scene && (
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                height={height}
                width={width}
                itemSize={32}
                itemCount={nodes.length}
                itemData={{
                  renamingNode,
                  nodes,
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
      </PanelContainer>
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
    </Fragment>
  )
}
