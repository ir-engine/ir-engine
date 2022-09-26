import React, { KeyboardEvent, StyleHTMLAttributes, useCallback, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { Object3D } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getAllComponents, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { ErrorComponent, ErrorComponentType } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import { executeCommandWithHistory } from '../../classes/History'
import { ItemTypes, SupportedFileTypes } from '../../constants/AssetTypes'
import EditorCommands from '../../constants/EditorCommands'
import { addMediaNode } from '../../functions/addMediaNode'
import { isAncestor } from '../../functions/getDetachedObjectsRoots'
import { EntityNodeEditor } from '../../functions/PrefabEditors'
import { useSelectionState } from '../../services/SelectionServices'
import useUpload from '../assets/useUpload'
import { addPrefabElement } from '../element/ElementList'
import { HeirarchyTreeNodeType } from './HeirarchyTreeWalker'
import NodeIssuesIcon from './NodeIssuesIcon'
import styles from './styles.module.scss'

/**
 * getNodeElId function provides id for node.
 *
 * @param  {object} node
 * @return {string}
 */
export const getNodeElId = (node: HeirarchyTreeNodeType) => {
  return 'hierarchy-node-' + (node.obj3d ? node.obj3d.uuid : node.entityNode.entity)
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
  onUpload: ReturnType<typeof useUpload>
}

export type HierarchyTreeNodeProps = {
  index: number
  data: HierarchyTreeNodeData
  style: StyleHTMLAttributes<HTMLLIElement>
  onContextMenu: (event: React.MouseEvent<HTMLElement>, item: HeirarchyTreeNodeType) => void
}

export const HierarchyTreeNode = (props: HierarchyTreeNodeProps) => {
  const node = props.data.nodes[props.index]
  const data = props.data
  const engineState = useEngineState()
  const selectionState = useSelectionState()

  const nodeName = node.obj3d
    ? node.obj3d.name ?? node.obj3d.uuid
    : hasComponent(node.entityNode.entity, NameComponent)
    ? getComponent(node.entityNode.entity, NameComponent).name
    : ''
  const errorComponent: ErrorComponentType = node.entityNode && getComponent(node.entityNode.entity, ErrorComponent)

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

  const [_dragProps, drag, preview] = useDrag({
    type: ItemTypes.Node,
    item() {
      const selectedEntities = selectionState.selectedEntities.value
      const multiple = selectedEntities.length > 1
      const tree = Engine.instance.currentWorld.entityTree

      return {
        type: ItemTypes.Node,
        multiple,
        value: multiple
          ? getEntityNodeArrayFromEntities(selectedEntities)
          : typeof selectedEntities[0] === 'string'
          ? selectedEntities[0]
          : tree.entityNodeMap.get(selectedEntities[0] as Entity)
      }
    },
    canDrag() {
      const tree = Engine.instance.currentWorld.entityTree
      return !selectionState.selectedEntities.value.some(
        (entity) => !(typeof entity === 'string' || tree.entityNodeMap.get(entity)?.parentEntity)
      )
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  const dropItem = (node: HeirarchyTreeNodeType, place: 'On' | 'Before' | 'After') => {
    const tree = Engine.instance.currentWorld.entityTree

    const isObj3D = !node.entityNode && node.obj3d
    const obj3d = node.obj3d!
    let parentNode: EntityTreeNode | string | undefined = undefined
    let beforeNode: EntityTreeNode | string | undefined = undefined

    if (place === 'Before') {
      if (isObj3D) {
        parentNode = obj3d.parent?.uuid ?? undefined
        beforeNode = obj3d.uuid
      } else {
        parentNode = node.entityNode.parentEntity ? tree.entityNodeMap.get(node.entityNode.parentEntity) : undefined
        beforeNode = node.entityNode
      }
    } else if (place === 'After') {
      if (isObj3D) {
        const parent = obj3d.parent
        parentNode = parent?.uuid ?? undefined
        if (parent?.children && parent.children.indexOf(obj3d) < parent.children.length - 1) {
          beforeNode = parent.children[parent.children.indexOf(obj3d) + 1].uuid
        }
      } else {
        parentNode = node.entityNode.parentEntity ? tree.entityNodeMap.get(node.entityNode.parentEntity) : undefined
        if (!node.lastChild && parentNode && parentNode.children) {
          beforeNode = tree.entityNodeMap.get(parentNode.children[node.childIndex + 1])
        }
      }
    } else {
      parentNode = isObj3D ? node.obj3d!.uuid : node.entityNode
    }

    if (!parentNode)
      return () => {
        console.warn('parent is not defined')
      }

    return (item: any, monitor): void => {
      if (typeof parentNode !== 'string' && typeof beforeNode !== 'string') {
        if (item.files) {
          const dndItem: any = monitor.getItem()
          const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

          //uploading files then adding as media to the editor
          data.onUpload(entries).then((assets) => {
            if (!assets) return
            for (const asset of assets) {
              addMediaNode(asset, parentNode as EntityTreeNode | undefined, beforeNode as EntityTreeNode | undefined)
            }
          })
          return
        }

        if (item.url) {
          addMediaNode(item.url, parentNode, beforeNode)
          return
        }

        if (item.type === ItemTypes.Prefab) {
          addPrefabElement(item, parentNode, beforeNode)
          return
        }
      }
      if (parentNode) {
        executeCommandWithHistory({
          type: EditorCommands.REPARENT,
          affectedNodes: [item.value],
          parents: [parentNode],
          befores: beforeNode ? [beforeNode] : undefined
        })
      }
    }
  }

  const canDropItem = (entityNode: EntityTreeNode | Object3D, dropOn?: boolean) => {
    return (item, monitor): boolean => {
      //check if monitor is over or object is not parent element
      if (!monitor.isOver()) return false
      const isObject3D = (entityNode as Object3D).isObject3D
      const eNode = entityNode as EntityTreeNode
      const obj3d = entityNode as Object3D

      if (!dropOn && !isObject3D && !(entityNode as EntityTreeNode).parentEntity) return false
      if (dropOn && isObject3D && !obj3d.parent) return false
      if (item.type === ItemTypes.Node) {
        return (
          (dropOn || !!eNode.parentEntity) &&
          !(item.multiple
            ? item.value.some((otherObject) => isAncestor(otherObject, eNode))
            : isAncestor(item.value, eNode))
        )
      } else if (isObject3D) {
        return (
          (dropOn || !!obj3d.parent) &&
          !(item.multiple
            ? item.value.some((otherObject) => typeof otherObject !== 'string' || isAncestor(otherObject, obj3d.uuid))
            : isAncestor(item.value, obj3d.uuid))
        )
      }
      return true
    }
  }

  const [{ canDropBefore, isOverBefore }, beforeDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ItemTypes.Prefab, ...SupportedFileTypes],
    drop: dropItem(node, 'Before'),
    canDrop: canDropItem(node.entityNode ?? node.obj3d!),
    collect: (monitor) => ({
      canDropBefore: monitor.canDrop(),
      isOverBefore: monitor.isOver()
    })
  })

  const [{ canDropAfter, isOverAfter }, afterDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ItemTypes.Prefab, ...SupportedFileTypes],
    drop: dropItem(node, 'After'),
    canDrop: canDropItem(node.entityNode ?? node.obj3d!),
    collect: (monitor) => ({
      canDropAfter: monitor.canDrop(),
      isOverAfter: monitor.isOver()
    })
  })

  const [{ canDropOn, isOverOn }, onDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ItemTypes.Prefab, ...SupportedFileTypes],
    drop: dropItem(node, 'On'),
    canDrop: canDropItem(node.entityNode ?? node.obj3d!, true),
    collect: (monitor) => ({
      canDropOn: monitor.canDrop(),
      isOverOn: monitor.isOver()
    })
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const collectNodeMenuProps = useCallback(() => node, [node])
  const editors = node.entityNode
    ? getAllComponents(node.entityNode.entity)
        .map((c) => EntityNodeEditor.get(c)!)
        .filter((c) => !!c)
    : []
  const IconComponent = editors.length && editors[editors.length - 1].iconComponent
  const renaming = data.renamingNode && data.renamingNode.entity === node.entityNode.entity
  const marginLeft = node.depth > 0 ? node.depth * 8 + 20 : 0

  return (
    <li style={props.style}>
      <div
        ref={drag}
        id={getNodeElId(node)}
        tabIndex={0}
        onKeyDown={onNodeKeyDown}
        className={
          styles.treeNodeContainer +
          (node.obj3d ? ' ' + styles.obj3d : '') +
          (node.depth === 0 ? ' ' + styles.rootNode : '') +
          (node.selected ? ' ' + styles.selected : '') +
          (node.active ? ' ' + styles.active : '')
        }
        onMouseDown={onMouseDownNode}
        onClick={onClickNode}
        onContextMenu={(event) => props.onContextMenu(event, node)}
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
            <button
              type="button"
              className={styles.collapseButton}
              onClick={onClickToggle as any}
              onMouseDown={(e) => e.stopPropagation()}
            >
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
                    value={data.renamingNode.name}
                    autoFocus
                  />
                </div>
              ) : (
                <div className={styles.nodelabel + (isOverOn && canDropOn ? ' ' + styles.dropTarget : '')}>
                  {nodeName}
                </div>
              )}
            </div>
            {node.entityNode && engineState.errorEntities[node.entityNode.entity].get() && (
              <NodeIssuesIcon node={[{ severity: 'error', message: errorComponent?.error }]} />
            )}
          </div>
        </div>

        <div
          className={styles.nodeDropTraget}
          style={{ marginLeft, borderBottomWidth: isOverAfter && canDropAfter ? 2 : 0 }}
          ref={afterDropTarget}
        />
      </div>
    </li>
  )
}
