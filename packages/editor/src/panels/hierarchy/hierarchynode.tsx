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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { userHasProjectPermission } from '@ir-engine/client-core/src/hooks/useUserProjectPermission'
import { API } from '@ir-engine/common'
import { projectPermissionPath } from '@ir-engine/common/src/schema.type.module'
import { usesCtrlKey } from '@ir-engine/common/src/utils/OperatingSystemFunctions'
import { EngineState, EntityTreeComponent, UUIDComponent } from '@ir-engine/ecs'
import {
  getComponent,
  getOptionalComponent,
  getSimulationCounterpart,
  hasComponent,
  removeComponent,
  setComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { EntityHierarchyLockState } from '@ir-engine/editor/src/services/EntityHierarchyLockState'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { STATIC_ASSET_REGEX } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { ResourceLoaderManager } from '@ir-engine/engine/src/assets/functions/resourceLoaderFunctions'
import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GLTFLoaderFunctions } from '@ir-engine/engine/src/gltf/GLTFLoaderFunctions'
import { AssetModifiedState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, getState, none, useHookstate, useMutableState, useState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { TransformPivot, TransformSpace } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { computeTransformPivot } from '@ir-engine/spatial/src/common/functions/TransformPivot'
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
import { isEntityGlb } from '../../functions/utils'
import { EditorHelperState, PlacementMode } from '../../services/EditorHelperState'
import { EditorState } from '../../services/EditorServices'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { HierarchyTreeNodeType } from './helpers'
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
  const showGlbChildrenFeatureFlag = useMutableState(EditorHelperState).showGlbChildren.value
  const { t } = useTranslation()
  const nodes = useHierarchyNodes()
  const node = nodes[props.index]
  const entity = node.entity
  const fixedSizeListStyles = props.style
  const uuid = UUIDComponent.get(entity)
  const selected = useHookstate(getMutableState(SelectionState).selectedEntities).value.includes(uuid)
  const visible = useHasComponent(entity, VisibleComponent)
  const locked = useHookstate(getMutableState(EntityHierarchyLockState).lockedEntities).value[entity] ?? false
  const { rootEntity } = useMutableState(EditorState).value
  const { collapseChildren, expandChildren, collapseNode, expandNode } = useNodeCollapseExpand()
  const renamingNode = useRenamingNode()
  const { expandedNodes, firstSelectedEntity, manualCollapseExpand } = useMutableState(HierarchyTreeState)
  const sourceID = GLTFComponent.useSourceID(rootEntity)
  const currentRenameNode = useHookstate(getComponent(entity, NameComponent))
  const { setMenu } = useHierarchyTreeContextMenu()
  const renameRef = useRef<HTMLInputElement>(null)
  const isRenameOpen = useState(false)
  const canSaveNodeChanges = useState(false)
  const permissionToChangeNodeVerified = useState(false)

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
        AuthoringState.snapshot(getComponent(entity, UUIDComponent).entitySourceID)
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
  const {
    canDrop: canDropOn,
    isOver: isOverOn,
    dropTarget: onDropTarget,
    rigidbodyParentingWarning
  } = useHierarchyTreeDrop(node, 'On')
  const isOverAndCanDrop = isOverOn && canDropOn
  const showGlbRedState = isOverAndCanDrop && !showGlbChildrenFeatureFlag && isEntityGlb(entity)
  const showRigidbodyRedState = isOverAndCanDrop && rigidbodyParentingWarning
  const showRedState = showGlbRedState || showRigidbodyRedState

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const onClickNode = (event: React.MouseEvent) => {
    if (renamingNode.entity !== entity) {
      renamingNode.clear()
    }
    if (event.detail === 1) {
      // Exit click placement mode when anything in the hierarchy is selected
      getMutableState(EditorHelperState).placementMode.set(PlacementMode.DRAG)
      if (usesCtrlKey() ? event.ctrlKey : event.metaKey) {
        if (entity === rootEntity) return
        EditorControlFunctions.toggleSelection([uuid])
      } else if (event.shiftKey && firstSelectedEntity.value) {
        const startIndex = nodes.findIndex((n) => n.entity === firstSelectedEntity.value)
        const endIndex = nodes.findIndex((n) => n.entity === entity)
        const range = nodes.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
        const entityUuids = range.filter((n) => n.entity).map((n) => UUIDComponent.get(n.entity))
        EditorControlFunctions.replaceSelection(entityUuids)
      } else {
        const selected = getState(SelectionState).selectedEntities.includes(UUIDComponent.get(entity))
        if (!selected) {
          EditorControlFunctions.replaceSelection([uuid])
        }
        const node = nodes.find((node) => node.entity === entity)
        if (node) {
          const nodeEl = document.getElementById(getNodeElId(node))
          nodeEl?.focus()
        }

        firstSelectedEntity.set(entity)
      }
    } else if (event.detail === 2) {
      const cameraEntity = getState(ReferenceSpaceState).viewerEntity
      if (entity && getOptionalComponent(cameraEntity, CameraOrbitComponent)) {
        const simulationEntity = getSimulationCounterpart(entity)
        const pivot = computeTransformPivot([simulationEntity], TransformPivot.Center, TransformSpace.world)
        if (!pivot?.position) return
        CameraOrbitComponent.setFocus(cameraEntity, pivot.position, pivot.bounds)
      }
    }
  }

  const onCollapseExpandNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    getMutableState(HierarchyTreeState).manualCollapseExpand.set(true)
    if (expandedNodes.value[sourceID][entity]) collapseNode(entity)
    else expandNode(entity)
  }

  const onHideUnhideNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (visible) {
      removeComponent(entity, VisibleComponent)
      AuthoringState.snapshotEntities([entity])
    } else {
      setComponent(entity, VisibleComponent)
      AuthoringState.snapshotEntities([entity])
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
  const isModified = isModelRoot && !!getState(AssetModifiedState)[GLTFComponent.getSourceID(entity)]

  const onSaveChanges = () => {
    const gltfComponent = getComponent(node.entity, GLTFComponent)
    const [_, orgName, projectName, fileName] = STATIC_ASSET_REGEX.exec(gltfComponent.src)!
    const fullProjectName = `${orgName}/${projectName}`
    const parsedName = fileName.split('?')[0]
    exportRelativeGLTF(node.entity, fullProjectName, parsedName, false).then((newSRC) => {
      EditorControlFunctions.modifyProperty([node.entity], GLTFComponent, { src: newSRC })
      getMutableState(AssetModifiedState)[GLTFComponent.getSourceID(entity)].set(none)
    })
  }

  const onRevert = () => {
    const gltfComponent = getComponent(node.entity, GLTFComponent)
    GLTFLoaderFunctions.unloadScene(gltfComponent.src, node.entity)
    EditorControlFunctions.modifyProperty([node.entity], GLTFComponent, { src: gltfComponent.src })
    ResourceLoaderManager.reloadResource(gltfComponent.src)
    getMutableState(AssetModifiedState)[GLTFComponent.getSourceID(entity)].set(none)
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
      style={{
        ...fixedSizeListStyles,
        ...{
          borderTop: '2px solid var(--surface-1)',
          borderBottom: '2px solid var(--surface-1)'
        }
      }}
      className={twMerge(
        'inline-flex w-auto min-w-full items-center',
        'cursor-pointer text-text-secondary hover:bg-ui-hover-background hover:text-text-primary',
        'bg-ui-background',
        !visible ? 'text-text-inactive' : '',
        selected ? 'rounded-sm border border-ui-select-outline bg-ui-select-background text-text-primary' : '',
        isOverOn && canDropOn ? 'border border-dotted' : '',
        showRedState ? 'border border-dotted text-text-error' : ''
      )}
      data-testid="hierarchy-panel-scene-item"
    >
      <div
        ref={drag}
        id={getNodeElId(node)}
        tabIndex={0}
        onClick={onClickNode}
        onContextMenu={(event) => {
          event.preventDefault()
          setMenu(event, entity)
        }}
        className={twMerge(
          'flex w-full flex-col justify-between overflow-hidden bg-inherit',
          rootEntity === entity ? 'px-2' : 'pl-10 pr-2'
        )}
      >
        <div
          className={twMerge('h-1', isOverBefore && canDropBefore && `bg-ui-hover-primary`)}
          ref={beforeDropTarget}
        />
        <div
          className={twMerge(
            'flex items-center justify-between gap-x-2 bg-inherit pr-2',
            rootEntity === entity ? 'p-2' : 'py-1 pr-2'
          )}
          style={{ marginLeft: `${node.depth * 1.75}rem` }}
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

          <div className="grid h-full w-full grid-cols-[max-content_auto_max-content_max-content_max-content] items-center gap-2 bg-inherit">
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
              <div className="grid min-w-0 text-nowrap rounded bg-transparent px-0.5 py-0 ">
                <span
                  className="overflow-x-auto truncate text-nowrap text-sm"
                  style={{ scrollbarWidth: `none` }}
                  data-testid="hierarchy-panel-scene-item-name"
                >
                  {currentRenameNode.value}
                </span>
              </div>
            )}
            {isModified && canSaveNodeChanges.value && node.entity !== rootEntity && (
              <div className="flex items-center gap-1">
                <Button
                  variant="tertiary"
                  size="sm"
                  className="p-0"
                  title={t('common:components.save')}
                  onClick={() =>
                    ModalState.openModal(
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
                    ModalState.openModal(
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
              data-testid={`hierarchy-panel-scene-item-${locked ? 'unlock' : 'lock'}-button`}
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
              {visible ? (
                <PiEyeBold className={`${showRedState ? 'text-text-inactive' : 'text-base'}`} />
              ) : (
                <PiEyeClosedBold className={`${showRedState ? 'text-text-inactive' : 'text-base'}`} />
              )}
            </button>
          </div>
        </div>
      </div>
    </li>
  )
})
