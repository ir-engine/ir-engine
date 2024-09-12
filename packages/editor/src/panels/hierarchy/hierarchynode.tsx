/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { usesCtrlKey } from '@ir-engine/common/src/utils/OperatingSystemFunctions'
import { entityExists, UUIDComponent } from '@ir-engine/ecs'
import {
  getAllComponents,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { HierarchyTreeNodeType } from '@ir-engine/editor/src/components/hierarchy/HierarchyTreeWalker'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import TransformPropertyGroup from '@ir-engine/ui/src/components/editor/properties/transform'
import React, { KeyboardEvent, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'
import { PiEyeBold, PiEyeClosedBold } from 'react-icons/pi'
import { ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'
import useUpload from '../../components/assets/useUpload'
import { ComponentEditorsState } from '../../services/ComponentEditors'
import { EditorHelperState, PlacementMode } from '../../services/EditorHelperState'
import { EditorState } from '../../services/EditorServices'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { deleteNode, uploadOptions } from './helpers'
import {
  useHierarchyNodes,
  useHierarchyTreeContextMenu,
  useHierarchyTreeDrop,
  useNodeCollapseExpand,
  useRenamingNode
} from './hooks'

type DragItemType = {
  type: (typeof ItemTypes)[keyof typeof ItemTypes]
  value: Entity | Entity[]
  multiple: boolean
}

function getNodeElId(node: HierarchyTreeNodeType) {
  return 'hierarchy-node-' + node.entity
}

function toValidHierarchyNodeName(entity: Entity, name: string): string {
  name = name.trim()
  if (getComponent(entity, NameComponent) === name) return ''
  return name
}

function IconComponent({ entity }: { entity: Entity }) {
  const icons = entityExists(entity)
    ? getAllComponents(entity)
        .map((c) => getState(ComponentEditorsState)[c.name]?.iconComponent)
        .filter((icon) => !!icon)
    : []
  const _IconComponent = icons.length > 0 ? icons[0] : TransformPropertyGroup.iconComponent
  if (!_IconComponent) return null
  return <_IconComponent entity={entity} className="h-5 w-5 flex-shrink-0 text-inherit" />
}

export default function HierarchyTreeNode(props: ListChildComponentProps<undefined>) {
  const nodes = useHierarchyNodes()
  const node = nodes[props.index]
  const entity = node.entity
  const fixedSizeListStyles = props.style
  const uuid = useComponent(entity, UUIDComponent)
  const selected = useHookstate(getMutableState(SelectionState).selectedEntities).value.includes(uuid.value)
  const visible = useOptionalComponent(entity, VisibleComponent)
  const { rootEntity } = useMutableState(EditorState).value
  const { collapseChildren, expandChildren, collapseNode, expandNode } = useNodeCollapseExpand()
  const renamingNode = useRenamingNode()
  const onUpload = useUpload(uploadOptions)
  const { expandedNodes, firstSelectedEntity } = useMutableState(HierarchyTreeState)
  const sourceId = useOptionalComponent(rootEntity, SourceComponent)!.value
  const currentRenameNode = useHookstate(getComponent(entity, NameComponent))
  const { setMenu } = useHierarchyTreeContextMenu()

  const [, drag, preview] = useDrag({
    type: ItemTypes.Node,
    item: (): DragItemType => {
      const selectedEntities = SelectionState.getSelectedEntities()

      if (selectedEntities.includes(node.entity)) {
        const multiple = selectedEntities.length > 1
        return {
          type: ItemTypes.Node,
          multiple,
          value: multiple ? selectedEntities : selectedEntities[0]
        }
      }
      return {
        type: ItemTypes.Node,
        multiple: false,
        value: entity
      }
    },
    canDrag: () =>
      !SelectionState.getSelectedEntities().some(
        (entity) => !getOptionalComponent(entity, EntityTreeComponent)?.parentEntity
      ),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  const {
    canDrop: canDropBefore,
    isOver: isOverBefore,
    dropTarget: beforeDropTarget
  } = useHierarchyTreeDrop(node, 'Before')
  const {
    canDrop: canDropAfter,
    isOver: isOverAfter,
    dropTarget: afterDropTarget
  } = useHierarchyTreeDrop(node, 'After')
  const { canDrop: canDropOn, isOver: isOverOn, dropTarget: onDropTarget } = useHierarchyTreeDrop(node, 'On')

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const onKeyDown = (event: KeyboardEvent) => {
    const nodeIndex = nodes.findIndex((node) => node.entity === entity)
    const entityTree = getComponent(entity, EntityTreeComponent)
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (entity === rootEntity) return

        const nextNode = nodeIndex !== -1 && nodes[nodeIndex + 1]
        if (!nextNode) return

        if (event.shiftKey) {
          EditorControlFunctions.addToSelection([getComponent(nextNode.entity, UUIDComponent)])
        }

        const nextNodeEl = document.getElementById(getNodeElId(nextNode))
        if (nextNodeEl) {
          nextNodeEl.focus()
        }
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (entity === rootEntity) return

        const prevNode = nodeIndex !== -1 && nodes[nodeIndex - 1]
        if (!prevNode) return

        if (event.shiftKey) {
          EditorControlFunctions.addToSelection([getComponent(prevNode.entity, UUIDComponent)])
        }

        const prevNodeEl = document.getElementById(getNodeElId(prevNode))
        if (prevNodeEl) {
          prevNodeEl.focus()
        }
        break
      }
      case 'ArrowLeft': {
        if (entityTree && (!entityTree.children || entityTree.children.length === 0)) return

        if (event.shiftKey) collapseChildren(entity)
        else collapseNode(entity)
        break
      }
      case 'ArrowRight': {
        if (entityTree && (!entityTree.children || entityTree.children.length === 0)) return

        if (event.shiftKey) expandChildren(entity)
        else expandNode(entity)
        break
      }
      case 'Enter': {
        if (entity === rootEntity) return
        if (event.shiftKey) {
          EditorControlFunctions.toggleSelection([getComponent(entity, UUIDComponent)])
        } else {
          EditorControlFunctions.replaceSelection([getComponent(entity, UUIDComponent)])
        }
        break
      }
      case 'Delete':
      case 'Backspace': {
        if (entity === rootEntity) return
        if (selected && renamingNode.entity !== entity) deleteNode(entity)
        break
      }
    }
  }

  const onClickNode = (event: React.MouseEvent) => {
    if (event.detail === 1) {
      // Exit click placement mode when anything in the hierarchy is selected
      getMutableState(EditorHelperState).placementMode.set(PlacementMode.DRAG)
      // Deselect material entity since we've just clicked on a hierarchy node
      getMutableState(MaterialSelectionState).selectedMaterial.set(null)
      if ((event.ctrlKey && usesCtrlKey()) || (event.metaKey && !usesCtrlKey())) {
        if (entity === rootEntity) return
        EditorControlFunctions.toggleSelection([getComponent(entity, UUIDComponent)])
      } else if (event.shiftKey && firstSelectedEntity.value) {
        const startIndex = nodes.findIndex((n) => n.entity === firstSelectedEntity.value)
        const endIndex = nodes.findIndex((n) => n.entity === entity)
        const range = nodes.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
        const entityUuids = range.filter((n) => n.entity).map((n) => getComponent(n.entity!, UUIDComponent))
        EditorControlFunctions.replaceSelection(entityUuids)
      } else {
        const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
        if (!selected) {
          EditorControlFunctions.replaceSelection([getComponent(entity, UUIDComponent)])
        }
        firstSelectedEntity.set(entity)
      }
    } else if (event.detail === 2) {
      if (entity && getOptionalComponent(entity, CameraOrbitComponent)) {
        const cameraEntity = getState(EngineState).viewerEntity
        // const editorCameraState = getMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent) // TODO: remove after testing
        const editorCameraState = getMutableComponent(cameraEntity, CameraOrbitComponent)
        editorCameraState.focusedEntities.set([entity])
        editorCameraState.refocus.set(true)
      }
    }
  }

  const onCollapseExpandNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (expandedNodes.value[sourceId][entity]) collapseNode(entity)
    else expandNode(entity)
  }

  const onHideUnhideNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (visible) {
      EditorControlFunctions.addOrRemoveComponent([entity], VisibleComponent, false)
    } else {
      EditorControlFunctions.addOrRemoveComponent([entity], VisibleComponent, true)
    }
    setVisibleComponent(entity, !hasComponent(entity, VisibleComponent))
  }

  return (
    <li
      key={node.depth + ' ' + props.index + ' ' + entity}
      style={fixedSizeListStyles}
      className={twMerge(
        'cursor-pointer',
        selected ? 'border text-white' : 'text-[#b2b5bd]',
        selected && (props.index % 2 ? 'bg-[#1d1f23]' : 'bg-zinc-900'),
        !selected && (props.index % 2 ? 'bg-[#141619] hover:bg-[#1d1f23]' : 'bg-[#080808] hover:bg-zinc-900'),
        !visible && (props.index % 2 ? 'bg-[#191B1F]' : 'bg-[#0e0f11]'),
        !visible && 'text-[#42454d]',
        isOverOn && canDropOn && 'border border-dotted',
        'hover:text-white'
      )}
    >
      <div
        ref={drag}
        id={getNodeElId(node)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onClick={onClickNode}
        onContextMenu={(event) => {
          event.preventDefault()
          setMenu(event, entity)
        }}
        className="py-.5 ml-3.5 h-9 justify-between bg-inherit pr-2"
      >
        <div
          className={twMerge('h-1', isOverBefore && canDropBefore && 'bg-white')}
          style={{ marginLeft: `${node.depth * 1.25}em` }}
          ref={beforeDropTarget}
        />

        <div
          className="flex items-center bg-inherit pr-2"
          style={{ paddingLeft: `${node.depth * 1.25}em` }}
          ref={onDropTarget}
        >
          {node.isLeaf ? (
            <div className="w-5 shrink-0" />
          ) : (
            <button
              type="button"
              className="m-0 h-5 w-5 border-[none] bg-inherit p-0 hover:opacity-80"
              onClick={onCollapseExpandNode}
            >
              {node.isCollapsed ? (
                <MdKeyboardArrowRight className="font-small text-white" />
              ) : (
                <MdKeyboardArrowDown className="font-small text-white" />
              )}
            </button>
          )}

          <div className="flex flex-1 items-center gap-2 bg-inherit py-0.5 pl-0 pr-1 text-inherit ">
            <IconComponent entity={entity} />
            <div className="flex flex-1 items-center">
              {renamingNode.entity === entity ? (
                <div className="relative h-[15px] w-full bg-inherit px-1 text-inherit">
                  <input
                    type="text"
                    className="absolute top-[-3px] m-0 w-full rounded-none bg-inherit py-0.5 pl-0.5 text-sm"
                    onChange={(event) => currentRenameNode.set(event.target.value)}
                    onKeyDown={(event: KeyboardEvent) => {
                      if (event.key === 'Escape') renamingNode.clear()
                      else if (event.key === 'Enter') {
                        EditorControlFunctions.modifyName(
                          [entity],
                          toValidHierarchyNodeName(entity, currentRenameNode.value)
                        )
                      }
                      currentRenameNode.set(getComponent(entity, NameComponent))
                    }}
                    value={currentRenameNode.value}
                    autoFocus
                    maxLength={64}
                  />
                </div>
              ) : (
                <div className="ml-2 min-w-0 flex-1 text-nowrap rounded bg-transparent px-0.5 py-0 text-inherit ">
                  <span className="text-nowrap text-sm leading-4">{currentRenameNode.value}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="m-0 h-5 w-5 flex-shrink-0 border-none p-0 hover:opacity-80"
              onClick={onHideUnhideNode}
            >
              {visible ? (
                <PiEyeBold className="font-small text-[#6B7280]" />
              ) : (
                <PiEyeClosedBold className="font-small text-[#42454d]" />
              )}
            </button>
          </div>
        </div>

        <div
          className={twMerge('h-1', isOverAfter && canDropAfter && 'bg-white')}
          style={{ marginLeft: `${node.depth * 1.25}em` }}
          ref={afterDropTarget}
        />
      </div>
    </li>
  )
}
