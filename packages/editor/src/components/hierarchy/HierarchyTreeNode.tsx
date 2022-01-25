import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import React, { KeyboardEvent, StyleHTMLAttributes, useCallback, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { ContextMenuTrigger } from '../layout/ContextMenu'
import { AssetTypes, isAsset, ItemTypes } from '../../constants/AssetTypes'
import EditorCommands from '../../constants/EditorCommands'
import { CommandManager } from '../../managers/CommandManager'
import { getNodeEditorsForEntity } from '../../functions/PrefabEditors'
import { addItem } from '../dnd'
import NodeIssuesIcon from './NodeIssuesIcon'
import styles from './styles.module.scss'
import { HeirarchyTreeNodeType } from './HeirarchyTreeWalker'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { isAncestor } from '../../functions/getDetachedObjectsRoots'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

/**
 * getNodeElId function provides id for node.
 *
 * @author Robert Long
 * @param  {object} node
 * @return {string}
 */
export const getNodeElId = (node: HeirarchyTreeNodeType) => {
  return 'hierarchy-node-' + node.entityNode.entity
}

export type RenameNodeData = {
  entity: Entity
  name: string
}

export type HierarchyTreeNodeData = {
  nodes: HeirarchyTreeNodeType[]
  renamingNode: RenameNodeData
  onToggle: (e: Event, node: HeirarchyTreeNodeType) => void
  onKeyDown: (e: Event, node: HeirarchyTreeNodeType) => void
  onMouseDown: (e: MouseEvent, node: HeirarchyTreeNodeType) => void
  onClick: (e: MouseEvent, node: HeirarchyTreeNodeType) => void
  onChangeName: (node: HeirarchyTreeNodeType, name: string) => void
  onRenameSubmit: (node: HeirarchyTreeNodeType, name: string) => void
  onUpload: (entries: FileSystemEntry[]) => Promise<{ url: string }[] | null>
}

export type HierarchyTreeNodeProps = {
  index: number
  data: HierarchyTreeNodeData
  style: StyleHTMLAttributes<HTMLLIElement>
}

export const HierarchyTreeNode = (props: HierarchyTreeNodeProps) => {
  const node = props.data.nodes[props.index]
  const data = props.data

  const nameComponent = getComponent(node.entityNode.entity, NameComponent)
  if (!nameComponent) return null

  const onClickToggle = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      if (data.onToggle) data.onToggle(e, node)
    },
    [data.onToggle, node]
  )

  const onNodeKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation()
      if (data.onKeyDown) data.onKeyDown(e as any, node)
    },
    [data.onKeyDown, node]
  )

  const onKeyDownNameInput = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') data.onRenameSubmit(node, null!)
      else if (e.key === 'Enter') data.onRenameSubmit(node, (e.target as any).value)
    },
    [data.onRenameSubmit, node]
  )

  const onClickNode = useCallback((e) => data.onClick(e, node), [node, data.onClick])
  const onMouseDownNode = useCallback((e) => data.onMouseDown(e, node), [node, data.onMouseDown])

  const onChangeNodeName = useCallback((e) => data.onChangeName(node, e.target.value), [node, data.onChangeName])
  const onSubmitNodeName = useCallback((e) => data.onRenameSubmit(node, e.target.value), [data.onRenameSubmit, node])

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

  const dropItem = (parent: EntityTreeNode, before?: EntityTreeNode) => {
    return (item: any, monitor): void => {
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding as media to the editor
        data.onUpload(entries).then((assets) => {
          if (!assets) return
          for (const asset of assets) {
            CommandManager.instance.addMedia({ url: asset.url }, parent, before)
          }
        })

        return
      }

      if (addItem(item, parent, before)) return

      CommandManager.instance.executeCommandWithHistory(EditorCommands.REPARENT, item.value, {
        parents: parent,
        befores: before
      })
    }
  }

  const canDropItem = (entityNode: EntityTreeNode, dropOn?: boolean) => {
    return (item, monitor): boolean => {
      //check if monitor is over or object is not parent element
      if (!monitor.isOver() || (!dropOn && !entityNode.parentNode)) return false

      if (isAsset(item)) return true

      if (item.type === ItemTypes.Node) {
        return (
          (dropOn || entityNode.parentNode) &&
          !(item.multiple
            ? item.value.some((otherObject) => isAncestor(otherObject, entityNode))
            : isAncestor(item.value, entityNode))
        )
      }

      return true
    }
  }

  const [{ canDropBefore, isOverBefore }, beforeDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop: dropItem(node.entityNode.parentNode, node.entityNode),
    canDrop: canDropItem(node.entityNode),
    collect: (monitor) => ({
      canDropBefore: monitor.canDrop(),
      isOverBefore: monitor.isOver()
    })
  })

  const [{ canDropAfter, isOverAfter }, afterDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop: dropItem(
      node.entityNode.parentNode,
      !node.lastChild && node.entityNode.parentNode.children
        ? node.entityNode.parentNode.children[node.childIndex + 1]
        : undefined
    ),
    canDrop: canDropItem(node.entityNode),
    collect: (monitor) => ({
      canDropAfter: monitor.canDrop(),
      isOverAfter: monitor.isOver()
    })
  })

  const [{ canDropOn, isOverOn }, onDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...AssetTypes],
    drop: dropItem(node.entityNode),
    canDrop: canDropItem(node.entityNode, true),
    collect: (monitor) => ({
      canDropOn: monitor.canDrop(),
      isOverOn: monitor.isOver()
    })
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const collectNodeMenuProps = useCallback(() => node, [node])
  const editors = getNodeEditorsForEntity(node.entityNode.entity)
  const IconComponent = editors.length && editors[editors.length - 1].iconComponent
  const renaming = data.renamingNode && data.renamingNode.entity === node.entityNode.entity
  const marginLeft = node.depth > 0 ? node.depth * 8 + 20 : 0

  return (
    <li style={props.style}>
      <ContextMenuTrigger holdToDisplay={-1} id="hierarchy-node-menu" collect={collectNodeMenuProps}>
        <div
          ref={drag}
          id={getNodeElId(node)}
          onMouseDown={onMouseDownNode}
          onClick={onClickNode}
          tabIndex={0}
          onKeyDown={onNodeKeyDown}
          className={
            styles.treeNodeContainer +
            (node.depth === 0 ? ' ' + styles.rootNode : '') +
            (node.selected ? ' ' + styles.selected : '') +
            (node.active ? ' ' + styles.active : '')
          }
        >
          <div
            className={styles.nodeDropTraget}
            style={{ marginLeft, borderTopWidth: isOverBefore && canDropBefore ? 2 : 0 }}
            ref={beforeDropTarget}
          />
          <div className={styles.nodeContent} style={{ paddingLeft: node.depth * 8 + 'px' }} ref={onDropTarget}>
            {node.isLeaf ? (
              <div className={styles.spacer} />
            ) : (
              <button type="button" className={styles.collapseButton} onClick={onClickToggle as any}>
                {node.isCollapsed ? <ArrowRightIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />}
              </button>
            )}

            <div className={styles.selectTarget}>
              {IconComponent ? <IconComponent className={styles.nodeIcon} /> : null}
              <div className={styles.labelContainer}>
                {renaming ? (
                  <div className={styles.renameInputContainer}>
                    <input
                      type="text"
                      className={styles.renameInput}
                      onChange={onChangeNodeName}
                      onKeyDown={onKeyDownNameInput}
                      onBlur={onSubmitNodeName}
                      value={data.renamingNode.name}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className={styles.nodelabel + (isOverOn && canDropOn ? ' ' + styles.dropTarget : '')}>
                    {nameComponent.name}
                  </div>
                )}
              </div>
              {/* {node.entitynode.issues && node.entitynode.issues.length > 0 && <NodeIssuesIcon node={node.entitynode} />} */}
            </div>
          </div>

          <div
            className={styles.nodeDropTraget}
            style={{ marginLeft, borderBottomWidth: isOverAfter && canDropAfter ? 2 : 0 }}
            ref={afterDropTarget}
          />
        </div>
      </ContextMenuTrigger>
    </li>
  )
}
