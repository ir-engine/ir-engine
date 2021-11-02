import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import React, { useEffect, useCallback } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import styled from 'styled-components'
import { CaretRight } from '@styled-icons/fa-solid/CaretRight'
import { CaretDown } from '@styled-icons/fa-solid/CaretDown'
import { ContextMenuTrigger } from '../layout/ContextMenu'
import { AssetTypes, isAsset, ItemTypes } from '../../constants/AssetTypes'
import EditorCommands from '../../constants/EditorCommands'
import { CommandManager } from '../../managers/CommandManager'
import { addAssetOnDrop } from '../dnd'
import traverseEarlyOut from '../../functions/traverseEarlyOut'
import NodeIssuesIcon from './NodeIssuesIcon'
import { TreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'


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
 * isAncestor used to check if object contains leaf nodes or not.
 *
 * @author Robert Long
 * @param  {object}  object
 * @param  {object}  otherObject
 * @return {Boolean}
 */
export function isAncestor(object, otherObject) {
  return !traverseEarlyOut(object, (child) => child !== otherObject)
}

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
 * TreeNodeLeafSpacer used to create space between leaf node.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeNodeLeafSpacer = (styled as any).div`
 width: 20px;
`

/**
 * getNodeElId function provides id for node.
 *
 * @author Robert Long
 * @param  {object} node
 * @return {string}
 */
export function getNodeElId(node) {
  return 'hierarchy-node-' + node.id
}

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
 }`

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
export function HierarchyTreeNode({
  index,
  data: { nodes, renamingNode, onToggle, onKeyDown, onMouseDown, onClick, onChangeName, onRenameSubmit, onUpload },
  style
}) {
  //initializing node from nodes array at specific index
  const node = nodes[index]

  //initializing variables using node.
  const { isLeaf, object, depth, selected, active, iconComponent, isCollapsed, childIndex, lastChild } = node

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
    (e) => onClick(e, node),
    [node, onClick]
  )

  /**
   * onMouseDownNode callback function used to handle mouse down event on node.
   *
   * @author Robert Long
   * @type {function}
   */
  const onMouseDownNode = useCallback(
    (e) => onMouseDown(e, node),
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

  const drop = useCallback((parent: TreeNode, before?: TreeNode) => {
    return (item: any): void => {
      if (item.files) {
        // if files exists then upload files and add as media to the editor
        onUpload(item.files).then((assets) => {
          if (!assets) return

          for (const asset of assets) {
            CommandManager.instance.addMedia({ url: asset.url }, parent, before)
          }
        })
        return
      }

      //check if addAssetOnDrop returns true then return
      if (addAssetOnDrop(item, parent, before)) return

      CommandManager.instance.executeCommandWithHistory(EditorCommands.REPARENT, item.value, {
        parents: parent,
        befores: before
      })
    }
  }, [object])

  const canDrop = useCallback((parent?: TreeNode, isBeforeOrAfter?: boolean) => {
    return (item, monitor) => {
      //used to check item that item is dropable or not

      //check if monitor is over or object is not parent element
      if (!monitor.isOver() || (isBeforeOrAfter && !parent)) return false

      //check item is asset
      if (isAsset(item)) return true

      //check if item type is equals to node
      if (item.type === ItemTypes.Node) {
        return (
          (!isBeforeOrAfter || parent) &&
          !(item.multiple
            ? item.value.some((otherObject) => isAncestor(otherObject, object))
            : isAncestor(item.value, object))
        )
      }

      return true
    }
  }, [object])

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
      return !CommandManager.instance.selected.some((selectedObj) => !selectedObj.parentNode)
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  //calling preview function with change in property
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const [{ canDropBefore, isOverBefore }, beforeDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop: drop(object.parentNode, object),
    canDrop: canDrop(object.parentNode, true),
    collect: (monitor) => ({
      canDropBefore: monitor.canDrop(),
      isOverBefore: monitor.isOver()
    })
  })

  const [{ canDropAfter, isOverAfter }, afterDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop: drop(object.parentNode, lastChild ? undefined : object.parentNode.children[childIndex + 1]),
    canDrop: canDrop(object.parentNode, true),
    collect: (monitor) => ({
      canDropAfter: monitor.canDrop(),
      isOverAfter: monitor.isOver()
    })
  })

  const [{ canDropOn, isOverOn }, onDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop: drop(object),
    canDrop: canDrop(),
    collect: (monitor) => ({
      canDropOn: monitor.canDrop(),
      isOverOn: monitor.isOver()
    })
  })

  const collectNodeMenuProps = useCallback(() => {
    return node
  }, [node])

  const nameComponent = getComponent(object.eid, NameComponent)

  //returning tree view for hierarchy panel
  return (
    <li style={style}>
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
                {isCollapsed ? <CaretRight size={12} /> : <CaretDown size={12} />}
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
    </li>
  )
}