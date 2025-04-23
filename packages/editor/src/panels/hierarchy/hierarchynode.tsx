/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the"License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an"AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { userHasProjectPermission } from '@ir-engine/client-core/src/hooks/useUserProjectPermission'
import { API } from '@ir-engine/common'
import { projectPermissionPath } from '@ir-engine/common/src/schema.type.module'
import { usesCtrlKey } from '@ir-engine/common/src/utils/OperatingSystemFunctions'
import { EngineState, EntityTreeComponent, UUIDComponent } from '@ir-engine/ecs'
import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { EntityHierarchyLockState } from '@ir-engine/editor/src/services/EntityHierarchyLockState'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { STATIC_ASSET_REGEX } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { ResourceLoaderManager } from '@ir-engine/engine/src/assets/functions/resourceLoaderFunctions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GLTFLoaderFunctions } from '@ir-engine/engine/src/gltf/GLTFLoaderFunctions'
import { AssetModifiedState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, getState, none, useHookstate, useMutableState, useState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { Button, Input } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import React, { KeyboardEvent, useEffect, useRef } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { IoArrowUndo, IoSaveOutline } from 'react-icons/io5'
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'
import { PiEyeBold, PiEyeClosedBold, PiLockBold, PiLockOpenBold } from 'react-icons/pi'
import { ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'
import { IconComponent } from '../../components/panels/IconComponent'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { EditorHelperState, PlacementMode } from '../../services/EditorHelperState'
import { EditorHistoryFunctions } from '../../services/EditorHistoryState'
import { EditorState } from '../../services/EditorServices'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { deleteNode, HierarchyTreeNodeType } from './helpers'
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
  return name
}

export default React.memo(function HierarchyTreeNode(props: ListChildComponentProps<undefined>) {
  const { t } = useTranslation()
  const nodes = useHierarchyNodes()
  const node = nodes[props.index]
  const entity = node.entity
  const fixedSizeListStyles = props.style
  const uuid = getComponent(entity, UUIDComponent)
  const selected = useHookstate(getMutableState(SelectionState).selectedEntities).value.includes(uuid)
  const visible = useHasComponent(entity, VisibleComponent)
  const locked = useHookstate(getMutableState(EntityHierarchyLockState).lockedEntities).value[entity] ?? false
  const { rootEntity } = useMutableState(EditorState).value
  const { collapseChildren, expandChildren, collapseNode, expandNode } = useNodeCollapseExpand()
  const renamingNode = useRenamingNode()
  const { expandedNodes, firstSelectedEntity } = useMutableState(HierarchyTreeState)
  const sourceID = GLTFComponent.useInstanceID(rootEntity)
  const currentRenameNode = useHookstate(getComponent(entity, NameComponent))
  const { setMenu } = useHierarchyTreeContextMenu()
  const renameRef = useRef<HTMLInputElement>(null)
  const isRenameOpen = useState(false)
  const canSaveNodeChanges = useState(false)
  const permissionToChangeNodeVerified = useState(false)

  //@todo when this feature flag is added, remove the hardcoded value
  const hideGlbChildrenFeatureFlag = [true] //useFeatureFlags([FeatureFlags.Studio.UI.Hierarchy.HideGlbChildren])

  const handleRenameOpen = () => {
    if (!isRenameOpen.value) {
      isRenameOpen.set(true)
      document.addEventListener('mousedown', handleClickOutside)
    }
  }

  const handleRenameClose = (saveRename: boolean) => {
    if (isRenameOpen.value) {
      isRenameOpen.set(false)
      document.removeEventListener('mousedown', handleClickOutside)
      if (saveRename) {
        EditorControlFunctions.modifyName([entity], toValidHierarchyNodeName(entity, currentRenameNode.value))
        EditorHistoryFunctions.snapshot(getComponent(entity, SourceComponent))
        currentRenameNode.set(getComponent(entity, NameComponent))
      }
      renamingNode.clear()
    }
  }

  const handleClickOutside = (event) => {
    if (renameRef.current && !renameRef.current.contains(event.target)) {
      handleRenameClose(true)
    }
  }

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
    if (renamingNode.entity !== entity) {
      renamingNode.clear()
    }
    if (event.detail === 1) {
      // Exit click placement mode when anything in the hierarchy is selected
      getMutableState(EditorHelperState).placementMode.set(PlacementMode.DRAG)
      // Deselect material entity since we've just clicked on a hierarchy node
      getMutableState(MaterialSelectionState).selectedMaterial.set(null)
      if (usesCtrlKey() ? event.ctrlKey : event.metaKey) {
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
      const cameraEntity = getState(ReferenceSpaceState).viewerEntity
      if (entity && getOptionalComponent(cameraEntity, CameraOrbitComponent)) {
        const editorCameraState = getMutableComponent(cameraEntity, CameraOrbitComponent)
        editorCameraState.focusedEntities.set([entity])
        editorCameraState.refocus.set(true)
      }
    }
  }

  const onCollapseExpandNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (expandedNodes.value[sourceID][entity]) collapseNode(entity)
    else expandNode(entity)
  }

  const onHideUnhideNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (visible) {
      EditorHistoryFunctions.removeComponent([entity], VisibleComponent)
    } else {
      EditorHistoryFunctions.setComponent([entity], VisibleComponent)
    }
  }

  const onLockUnlockNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (locked) {
      EntityHierarchyLockState.updateLocked(entity, false)
    } else {
      EntityHierarchyLockState.updateLocked(entity, true)
    }
  }

  const isModelRoot = hasComponent(entity, GLTFComponent)
  const modState = useMutableState(AssetModifiedState)
  const isModified = isModelRoot && modState && modState.get()[GLTFComponent.getInstanceID(entity)]

  const onSaveChanges = () => {
    const gltfComponent = getComponent(node.entity, GLTFComponent)
    const [_, orgName, projectName, fileName] = STATIC_ASSET_REGEX.exec(gltfComponent.src)!
    const fullProjectName = `${orgName}/${projectName}`
    const parsedName = fileName.split('?')[0]
    exportRelativeGLTF(node.entity, fullProjectName, parsedName, false).then((newSRC) => {
      EditorControlFunctions.modifyProperty([node.entity], GLTFComponent, { src: newSRC })
      getMutableState(AssetModifiedState)[GLTFComponent.getInstanceID(entity)].set(none)
    })
  }

  const onRevert = () => {
    const gltfComponent = getComponent(node.entity, GLTFComponent)
    GLTFLoaderFunctions.unloadScene(gltfComponent.src, node.entity)
    EditorControlFunctions.modifyProperty([node.entity], GLTFComponent, { src: gltfComponent.src })
    ResourceLoaderManager.reloadResource(gltfComponent.src)
    getMutableState(AssetModifiedState)[GLTFComponent.getInstanceID(entity)].set(none)
  }

  useEffect(() => {
    if (isModified) {
      checkIfUserCanSaveNodeChanges()
    } else {
      canSaveNodeChanges.set(false)
    }
  }, [isModified])

  const checkIfUserCanSaveNodeChanges = async () => {
    if (permissionToChangeNodeVerified.value) return
    permissionToChangeNodeVerified.set(true)

    const gltfComponent = getComponent(node.entity, GLTFComponent)
    const [, orgName, projectName, fileName] = STATIC_ASSET_REGEX.exec(gltfComponent.src)!
    const fullProjectName = `${orgName}/${projectName}`

    const { projectName: stateProjectName } = getState(EditorState)

    const trimmedFilename = fileName.split('?')[0]
    if (trimmedFilename && trimmedFilename.endsWith('.glb')) {
      canSaveNodeChanges.set(false)
      return
    }
    if (stateProjectName === fullProjectName) {
      canSaveNodeChanges.set(true)
      return
    }

    const userID = getState(EngineState).userID
    const { data } = await API.instance.service(projectPermissionPath).find({
      query: {
        project: fullProjectName,
        userId: userID
      }
    })
    const [permission] = data
    if (!permission) {
      canSaveNodeChanges.set(false)
      return
    }
    canSaveNodeChanges.set(userHasProjectPermission(permission, ['owner', 'editor']))
  }

  return (
    <li
      key={node.depth + ' ' + props.index + ' ' + entity}
      style={fixedSizeListStyles}
      className={twMerge(
        'cursor-pointer text-text-secondary hover:bg-ui-hover-background hover:text-text-primary',
        'bg-ui-background',
        !visible ? 'text-text-inactive' : '',
        selected ? 'rounded-sm border border-ui-select-outline bg-ui-select-background text-text-primary' : '',
        isOverOn && canDropOn ? 'border border-dotted' : '',
        hideGlbChildrenFeatureFlag[0] && isOverOn && !canDropOn ? 'border border-dotted bg-ui-hover-error' : ''
      )}
      data-testid="hierarchy-panel-scene-item"
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
        className="flex w-full flex-col justify-between overflow-hidden bg-inherit"
      >
        <div
          className={twMerge('h-1', isOverBefore && canDropBefore && `bg-ui-hover-primary`)}
          ref={beforeDropTarget}
        />
        <div
          className={twMerge(
            'flex w-full items-center justify-between gap-x-2 bg-inherit pr-2',
            rootEntity === entity ? 'p-2' : 'py-1 pl-10 pr-2'
          )}
          style={{ marginLeft: `${node.depth * 0.75}rem` }}
          ref={onDropTarget}
        >
          {node.isLeaf ? (
            <div className="w-5 shrink-0" />
          ) : (
            <button
              type="button"
              data-testid={`hierarchy-panel-scene-item-${node.isCollapsed ? 'expand' : 'collapse'}-button`}
              onClick={onCollapseExpandNode}
            >
              {node.isCollapsed ? (
                <MdKeyboardArrowRight className="text-base" />
              ) : (
                <MdKeyboardArrowDown className="text-base" />
              )}
            </button>
          )}

          <div className="flex w-full items-center gap-2 bg-inherit">
            <IconComponent entity={entity} />
            {renamingNode.entity === entity ? (
              <Input
                ref={renameRef}
                type="text"
                fullWidth
                data-testid="hierarchy-panel-scene-item-rename-input"
                onFocus={() => handleRenameOpen()}
                onChange={(event) => currentRenameNode.set(event.target.value)}
                onKeyDown={(event: KeyboardEvent) => {
                  if (event.key === 'Escape') {
                    handleRenameClose(false)
                  } else if (event.key === 'Enter') {
                    handleRenameClose(true)
                  }
                }}
                value={currentRenameNode.value}
                autoFocus
                maxLength={64}
              />
            ) : (
              <div className="min-w-0 flex-1 text-nowrap rounded bg-transparent px-0.5 py-0 ">
                <span className="text-nowrap text-sm" data-testid="hierarchy-panel-scene-item-name">
                  {currentRenameNode.value}
                </span>
              </div>
            )}
            {isModified && canSaveNodeChanges.value && (
              <div className="flex items-center gap-1">
                <Button
                  variant="tertiary"
                  size="sm"
                  className="p-0"
                  title={t('common:components.save')}
                  onClick={() =>
                    PopoverState.showPopupover(
                      <ConfirmDialog
                        onSubmit={onSaveChanges}
                        title={t('editor:dialog.saveModel.title')}
                        text={t('editor:dialog.saveModel.text')}
                      />
                    )
                  }
                >
                  <IoSaveOutline />
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  className="p-0"
                  title={t('editor:dialog.revertModel.lbl-name')}
                  onClick={() =>
                    PopoverState.showPopupover(
                      <ConfirmDialog
                        onSubmit={onRevert}
                        title={t('editor:dialog.revertModel.title')}
                        text={t('editor:dialog.revertModel.text')}
                      />
                    )
                  }
                >
                  <IoArrowUndo />
                </Button>
              </div>
            )}

            <button
              type="button"
              className="m-0 h-5 w-5 flex-shrink-0 border-none p-0 hover:opacity-80"
              data-testid={`hierarchy-panel-scene-item-${visible ? 'hide' : 'unhide'}-button`}
              onClick={onLockUnlockNode}
            >
              {locked ? (
                <PiLockBold className="font-small text-ui-primary" />
              ) : (
                <PiLockOpenBold className="font-small text-[#42454d]" />
              )}
            </button>
            <button
              type="button"
              className="m-0 h-5 w-5 flex-shrink-0 border-none p-0 hover:opacity-80"
              data-testid={`hierarchy-panel-scene-item-${visible ? 'hide' : 'unhide'}-button`}
              onClick={onHideUnhideNode}
            >
              {visible ? <PiEyeBold className="text-base" /> : <PiEyeClosedBold className="text-base" />}
            </button>
          </div>
        </div>
      </div>
    </li>
  )
})
