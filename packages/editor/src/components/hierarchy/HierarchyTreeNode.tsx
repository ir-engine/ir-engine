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

import React, { KeyboardEvent, StyleHTMLAttributes, useCallback, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { Object3D } from 'three'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  getAllComponents,
  getComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { entityExists } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import {
  EntityTreeComponent,
  getEntityNodeArrayFromEntities
} from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { ErrorComponent } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import { ItemTypes, SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { EntityNodeEditor } from '../../functions/ComponentEditors'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { isAncestor } from '../../functions/getDetachedObjectsRoots'
import { SelectionState } from '../../services/SelectionServices'
import useUpload from '../assets/useUpload'
import { addSceneComponentElement } from '../element/ElementList'
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
  return 'hierarchy-node-' + (node.obj3d ? node.obj3d.uuid : node.entityNode)
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
  const selectionState = useHookstate(getMutableState(SelectionState))
  useComponent(getMutableState(SceneState).sceneEntity.value, EntityTreeComponent)

  const nodeName = node.obj3d
    ? node.obj3d.name ?? node.obj3d.uuid
    : hasComponent(node.entityNode as Entity, NameComponent)
    ? getComponent(node.entityNode as Entity, NameComponent)
    : ''

  const errors = node.entityNode ? useOptionalComponent(node.entityNode as Entity, ErrorComponent) : undefined
  const firstError = errors?.keys[0]

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

      return {
        type: ItemTypes.Node,
        multiple,
        value: multiple ? getEntityNodeArrayFromEntities(selectedEntities) : selectedEntities[0]
      }
    },
    canDrag() {
      return !selectionState.selectedEntities.value.some(
        (entity) => !(typeof entity === 'string' || getComponent(entity, EntityTreeComponent)?.parentEntity)
      )
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  const dropItem = (node: HeirarchyTreeNodeType, place: 'On' | 'Before' | 'After') => {
    const isObj3D = !node.entityNode && node.obj3d
    if (isObj3D) return
    const obj3d = node.obj3d!
    let parentNode: Entity | null = null
    let beforeNode: Entity | null = null

    if (place === 'Before') {
      const entityTreeComponent = getComponent(node.entityNode as Entity, EntityTreeComponent)
      parentNode = entityTreeComponent?.parentEntity
      beforeNode = node.entityNode as Entity
    } else if (place === 'After') {
      const entityTreeComponent = getComponent(node.entityNode as Entity, EntityTreeComponent)
      parentNode = entityTreeComponent?.parentEntity
      const parentTreeComponent = getComponent(entityTreeComponent?.parentEntity!, EntityTreeComponent)
      if (!node.lastChild && parentNode && parentTreeComponent?.children.length > node.childIndex + 1) {
        beforeNode = parentTreeComponent.children[node.childIndex + 1]
      }
    } else {
      parentNode = node.entityNode as Entity
    }

    if (!parentNode)
      return () => {
        console.warn('parent is not defined')
      }

    return (item: any, monitor): void => {
      if (parentNode && typeof parentNode !== 'string' && typeof beforeNode !== 'string') {
        if (item.files) {
          const dndItem: any = monitor.getItem()
          const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

          //uploading files then adding as media to the editor
          data.onUpload(entries).then((assets) => {
            if (!assets) return
            for (const asset of assets) {
              addMediaNode(asset, parentNode, beforeNode)
            }
          })
          return
        }

        if (item.url) {
          addMediaNode(item.url, parentNode, beforeNode)
          return
        }

        if (item.type === ItemTypes.Prefab) {
          const createdEntity = addSceneComponentElement(item, parentNode, beforeNode!)
          EditorControlFunctions.reparentObject([createdEntity], parentNode, beforeNode)
          return
        }
      }
      if (parentNode) {
        EditorControlFunctions.reparentObject(
          Array.isArray(item.value) ? item.value : [item.value],
          parentNode,
          beforeNode
        )
      }
    }
  }

  const canDropItem = (entityNode: Entity | Object3D, dropOn?: boolean) => {
    return (item, monitor): boolean => {
      //check if monitor is over or object is not parent element
      if (!monitor.isOver()) return false
      const isObject3D = typeof entityNode === 'object'
      const eNode = entityNode as Entity
      const obj3d = entityNode as Object3D

      if (!dropOn && !isObject3D) {
        const entityTreeComponent = getComponent(eNode, EntityTreeComponent)
        if (!entityTreeComponent) return false
      }
      if (dropOn && isObject3D && !obj3d.parent) return false
      if (item.type === ItemTypes.Node) {
        const entityTreeComponent = getComponent(eNode, EntityTreeComponent)
        return (
          (dropOn || !!entityTreeComponent.parentEntity) &&
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
    canDrop: canDropItem((node.entityNode as Entity) ?? node.obj3d!),
    collect: (monitor) => ({
      canDropBefore: monitor.canDrop(),
      isOverBefore: monitor.isOver()
    })
  })

  const [{ canDropAfter, isOverAfter }, afterDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ItemTypes.Prefab, ...SupportedFileTypes],
    drop: dropItem(node, 'After'),
    canDrop: canDropItem((node.entityNode as Entity) ?? node.obj3d!),
    collect: (monitor) => ({
      canDropAfter: monitor.canDrop(),
      isOverAfter: monitor.isOver()
    })
  })

  const [{ canDropOn, isOverOn }, onDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ItemTypes.Prefab, ...SupportedFileTypes],
    drop: dropItem(node, 'On'),
    canDrop: canDropItem((node.entityNode as Entity) ?? node.obj3d!, true),
    collect: (monitor) => ({
      canDropOn: monitor.canDrop(),
      isOverOn: monitor.isOver()
    })
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const collectNodeMenuProps = useCallback(() => node, [node])
  const editors =
    typeof node.entityNode === 'number' && entityExists(node.entityNode as Entity)
      ? getAllComponents(node.entityNode as Entity)
          .map((c) => EntityNodeEditor.get(c)!)
          .filter((c) => !!c)
      : []
  const IconComponent = editors.length && editors[editors.length - 1].iconComponent
  const renaming = data.renamingNode && data.renamingNode.entity === node.entityNode
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
            {firstError && <NodeIssuesIcon node={[{ severity: 'error', message: firstError }]} />}
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
