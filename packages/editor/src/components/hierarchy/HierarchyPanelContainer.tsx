import React, { useState, useEffect, useCallback, memo, Fragment } from 'react'
import styled from 'styled-components'
import { ContextMenu, MenuItem } from '../layout/ContextMenu'
import { useDrop } from 'react-dnd'
import { FixedSizeList, areEqual } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { addAssetOnDrop } from '../dnd'
import useUpload from '../assets/useUpload'
import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { useTranslation } from 'react-i18next'
import { cmdOrCtrlString } from '../../functions/utils'
import EditorEvents from '../../constants/EditorEvents'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'
import { ControlManager } from '../../managers/ControlManager'
import { AssetTypes, isAsset, ItemTypes } from '../../constants/AssetTypes'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { getComponentIcon } from '../../managers/NodeManager'
import { getNodeElId, isAncestor, HierarchyTreeNode } from './TreeNode'

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
 * getNodeKey function used to get object id at given index.
 *
 * @author Robert Long
 * @param  {number} index [index of the node to get object id]
 * @param  {object} data
 * @return {string}
 */
function getNodeKey(index, data) {
  return data.nodes[index].object.id
}


/**
 * initializing MemoTreeNode.
 *
 * @author Robert Long
 */
const MemoTreeNode = memo(HierarchyTreeNode, areEqual)

/**
 * treeWalker function used to handle tree.
 *
 * @author Robert Long
 * @param  {object}    collapsedNodes
 */
function* treeWalker(collapsedNodes, treeObject) {
  const stack = []

  if (!treeObject) return

  stack.push({
    depth: 0,
    object: treeObject,
    childIndex: 0,
    lastChild: true
  })

  while (stack.length !== 0) {
    const { depth, object, childIndex, lastChild } = stack.pop()

    // const NodeEditor = NodeManager.instance.getEditorFromNode(object) || DefaultNodeEditor
    // const iconComponent = NodeEditor.WrappedComponent
    //   ? NodeEditor.WrappedComponent.iconComponent
    //   : NodeEditor.iconComponent

    const isCollapsed = collapsedNodes[object.id]

    yield {
      id: object.id,
      isLeaf: !object.children || object.children.length === 0,
      isCollapsed,
      depth,
      object,
      iconComponent: getComponentIcon(object.eid),
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

        // if (child.isNode) {
          stack.push({
            depth: depth + 1,
            object: child,
            childIndex: i,
            lastChild: i === object.children.length - 1
          })
        // }
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
  const [nodes, setNodes] = useState([])
  const updateNodeHierarchy = useCallback(() => {
    const world = useWorld()

    if (!world.entityTree) return

    // Heirarchy tree will be generated from the entities of the world rather than from scene node.
    let nodes = Array.from(treeWalker(collapsedNodes, world.entityTree.rootNode))
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
    SceneManager.instance.scene.traverse((child) => {
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
      } else if (!node.selected) {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, node.object)
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
      ControlManager.instance.editorControls.focus([node.object])
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
        } else {
          CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, node.object)
        }
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
  const onDeleteNode = useCallback((_, node) => {
    let objs = node.selected ? CommandManager.instance.selected : node.object
    CommandManager.instance.executeCommandWithHistory(EditorCommands.REMOVE_OBJECTS, objs)
  }, [])

  /**
   * onDuplicateNode callback function to handle Duplication of node.
   *
   * @author Robert Long
   * @type {function}
   */
  const onDuplicateNode = useCallback((_, node) => {
    let objs = node.selected ? CommandManager.instance.selected : node.object
    CommandManager.instance.executeCommandWithHistory(EditorCommands.DUPLICATE_OBJECTS, objs)
  }, [])

  /**
   * onGroupNodes callback function used to handle grouping of nodes.
   *
   * @author Robert Long
   * @type {function}
   */
  const onGroupNodes = useCallback((_, node) => {
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
    (_, node) => {
      setRenamingNode({ id: node.id, name: node.object.name })
    },
    []
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
    []
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
        //uploading files then adding to editor media
        onUpload(item.files).then((assets) => {
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

      const world = useWorld()
      CommandManager.instance.executeCommandWithHistory(EditorCommands.REPARENT, item.value, {
        parents: world.entityTree.rootNode
      })
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
          ? item.value.some((otherObject) => isAncestor(otherObject, SceneManager.instance.scene))
          : isAncestor(item.value, SceneManager.instance.scene))
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
        {(SceneManager.instance.scene) && (
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
                // itemKey={getNodeKey}
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
        <MenuItem onClick={onDuplicateNode}>
          {t('editor:hierarchy.lbl-duplicate')}
          <div>{cmdOrCtrlString + '+ D'}</div>
        </MenuItem>
        <MenuItem onClick={onGroupNodes}>
          {t('editor:hierarchy.lbl-group')}
          <div>{cmdOrCtrlString + '+ G'}</div>
        </MenuItem>
        <MenuItem onClick={onDeleteNode}>{t('editor:hierarchy.lbl-delete')}</MenuItem>
        <MenuItem onClick={onExpandAllNodes}>{t('editor:hierarchy.lbl-expandAll')}</MenuItem>
        <MenuItem onClick={onCollapseAllNodes}>{t('editor:hierarchy.lbl-collapseAll')}</MenuItem>
      </ContextMenu>
    </Fragment>
  )
}
