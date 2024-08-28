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

import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { AllFileTypes } from '@ir-engine/engine/src/assets/constants/fileTypes'
import { getMutableState, getState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  EntityTreeComponent,
  isAncestor,
  traverseEntityNode
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useCallback, useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { Engine, Entity, UUIDComponent, entityExists } from '@ir-engine/ecs'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'

import { GLTF } from '@gltf-transform/core'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { VALID_HEIRARCHY_SEARCH_REGEX } from '@ir-engine/common/src/regex'
import useUpload from '@ir-engine/editor/src/components/assets/useUpload'
import CreatePrefabPanel from '@ir-engine/editor/src/components/dialogs/CreatePrefabPanelDialog'
import {
  HierarchyTreeNodeType,
  gltfHierarchyTreeWalker
} from '@ir-engine/editor/src/components/hierarchy/HierarchyTreeWalker'
import { ItemTypes, SupportedFileTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { CopyPasteFunctions } from '@ir-engine/editor/src/functions/CopyPasteFunctions'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { addMediaNode } from '@ir-engine/editor/src/functions/addMediaNode'
import { cmdOrCtrlString } from '@ir-engine/editor/src/functions/utils'
import { EditorHelperState, PlacementMode } from '@ir-engine/editor/src/services/EditorHelperState'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { GLTFAssetState, GLTFSnapshotState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { useHotkeys } from 'react-hotkeys-hook'
import { HiMagnifyingGlass, HiOutlinePlusCircle } from 'react-icons/hi2'
import Button from '../../../../../primitives/tailwind/Button'
import Input from '../../../../../primitives/tailwind/Input'
import { ContextMenu } from '../../../../tailwind/ContextMenu'
import { Popup } from '../../../../tailwind/Popup'
import ElementList from '../../Properties/elementList'
import HierarchyTreeNode, { HierarchyTreeNodeProps, RenameNodeData, getNodeElId } from '../node'

const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

const toValidHierarchyNodeName = (entity: Entity, name: string): string => {
  name = name.trim()
  if (getComponent(entity, NameComponent) === name) return ''
  return name
}

const didHierarchyChange = (prev: HierarchyTreeNodeType[], curr: HierarchyTreeNodeType[]) => {
  if (prev.length !== curr.length) return true

  for (let i = 0; i < prev.length; i++) {
    const prevNode = prev[i]
    const currNode = curr[i]
    for (const key in prevNode) {
      if (prevNode[key] !== currNode[key]) return true
    }
  }

  return false
}

/**
 * HierarchyPanel function component provides view for hierarchy tree.
 */
function HierarchyPanelContents(props: { sceneURL: string; rootEntity: Entity; index: number }) {
  const { sceneURL, rootEntity, index } = props
  const { t } = useTranslation()
  const [contextSelectedItem, setContextSelectedItem] = React.useState<undefined | Entity>(undefined)
  const [anchorEvent, setAnchorEvent] = React.useState<undefined | React.MouseEvent<HTMLDivElement>>(undefined)

  const [prevClickedNode, setPrevClickedNode] = useState<Entity | null>(null)
  const onUpload = useUpload(uploadOptions)
  const [renamingNode, setRenamingNode] = useState<RenameNodeData | null>(null)
  const expandedNodes = useHookstate(getMutableState(EditorState).expandedNodes)
  const entityHierarchy = useHookstate<HierarchyTreeNodeType[]>([])
  const [selectedNodes, _setSelectedNodes] = useState<Entity[] | null>(null)
  const lockPropertiesPanel = useHookstate(getMutableState(EditorState).lockPropertiesPanel)
  const searchHierarchy = useHookstate('')
  const selectionState = useMutableState(SelectionState)

  const gltfState = useMutableState(GLTFSnapshotState)
  const gltfSnapshot = gltfState[sceneURL].snapshots[index]

  const [showModelChildren] = useFeatureFlags([FeatureFlags.Studio.UI.Hierarchy.ShowModelChildren])

  const setSelectedNode = (selection: Entity[]) => !lockPropertiesPanel.value && _setSelectedNodes(selection)

  useEffect(() => {
    const entities: Entity[] = []
    for (const selectedUUID of selectionState.selectedEntities.value) {
      const entity = UUIDComponent.getEntityByUUID(selectedUUID)
      if (entity) entities.push(entity)
    }
    setSelectedNode(entities)
  }, [selectionState.selectedEntities])

  useHotkeys(`${cmdOrCtrlString}+d`, (e) => {
    e.preventDefault()
    const objs = SelectionState.getSelectedEntities()
    EditorControlFunctions.duplicateObject(objs)
  })

  useHotkeys(`${cmdOrCtrlString}+g`, (e) => {
    e.preventDefault()
    const objs = SelectionState.getSelectedEntities()
    EditorControlFunctions.groupObjects(objs)
  })

  useHotkeys(`${cmdOrCtrlString}+c`, (e) => {
    e.preventDefault()
    const objs = SelectionState.getSelectedEntities()
    CopyPasteFunctions.copyEntities(objs)
  })

  useHotkeys(`${cmdOrCtrlString}+v`, (e) => {
    e.preventDefault()
    const selectedEntities = SelectionState.getSelectedEntities()
    for (const entity of selectedEntities) {
      CopyPasteFunctions.getPastedEntities()
        .then((nodeComponentJSONs) => {
          nodeComponentJSONs.forEach((componentJSONs) => {
            EditorControlFunctions.createObjectFromSceneElement(componentJSONs, undefined, entity)
          })
        })
        .catch((e) => {
          NotificationService.dispatchNotify(t('editor:hierarchy.copy-paste.no-hierarchy-nodes'), { variant: 'error' })
          console.error(e)
        })
    }
  })

  useHotkeys(`${cmdOrCtrlString}+r`, (e) => {
    e.preventDefault()
    const selectedEntities = SelectionState.getSelectedEntities()
    for (const entity of selectedEntities) {
      onRenameNode(entity)
    }
  })

  const MemoTreeNode = useCallback(
    (props: HierarchyTreeNodeProps) => (
      <HierarchyTreeNode
        {...props}
        key={props.data.nodes[props.index].depth + ' ' + props.index + ' ' + props.data.nodes[props.index].entity}
        onContextMenu={onContextMenu}
      />
    ),
    [entityHierarchy]
  )

  const searchedNodes: HierarchyTreeNodeType[] = []
  if (searchHierarchy.value.length > 0) {
    try {
      const adjustedSearchValue = searchHierarchy.value.replace(VALID_HEIRARCHY_SEARCH_REGEX, '\\$&')
      const condition = new RegExp(adjustedSearchValue, 'i') // 'i' flag for case-insensitive search
      entityHierarchy.value.forEach((node) => {
        if (node.entity && condition.test(getComponent(node.entity, NameComponent)?.toLowerCase() ?? ''))
          searchedNodes.push(node)
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!expandedNodes.value[sceneURL]) {
      expandedNodes.set({ [sceneURL]: { [rootEntity]: true } })
    }
  }, [])

  useEffect(() => {
    const hierarchy = gltfHierarchyTreeWalker(rootEntity, gltfSnapshot.nodes.value as GLTF.INode[], showModelChildren)
    if (didHierarchyChange(entityHierarchy.value as HierarchyTreeNodeType[], hierarchy)) entityHierarchy.set(hierarchy)
  }, [expandedNodes, index, gltfSnapshot, gltfState, selectionState.selectedEntities, showModelChildren])

  /* Expand & Collapse Functions */
  const expandNode = useCallback(
    (entity: Entity) => {
      expandedNodes[sceneURL][entity].set(true)
    },
    [expandedNodes]
  )

  const collapseNode = useCallback(
    (entity: Entity) => {
      expandedNodes[sceneURL][entity].set(none)
    },
    [expandedNodes]
  )

  const expandChildren = useCallback(
    (entity: Entity) => {
      handleClose()
      traverseEntityNode(entity, (child) => {
        expandedNodes[sceneURL][child].set(true)
      })
    },
    [expandedNodes]
  )

  const collapseChildren = useCallback(
    (entity: Entity) => {
      handleClose()
      traverseEntityNode(entity, (child) => {
        expandedNodes[sceneURL][child].set(none)
      })
    },
    [expandedNodes]
  )

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>, item: Entity) => {
    event.preventDefault()
    event.stopPropagation()

    setContextSelectedItem(item)
    setAnchorEvent(event)
  }

  const handleClose = () => {
    setContextSelectedItem(undefined)
    setAnchorEvent(undefined)
  }

  const onClick = useCallback(
    (e: MouseEvent, entity: Entity) => {
      if (e.detail === 1) {
        // Exit click placement mode when anything in the hierarchy is selected
        getMutableState(EditorHelperState).placementMode.set(PlacementMode.DRAG)
        // Deselect material entity since we've just clicked on a hierarchy node
        getMutableState(MaterialSelectionState).selectedMaterial.set(null)
        if (e.ctrlKey) {
          if (entity === rootEntity) return
          EditorControlFunctions.toggleSelection([getComponent(entity, UUIDComponent)])
        } else if (e.shiftKey && prevClickedNode) {
          const startIndex = entityHierarchy.value.findIndex((n) => n.entity === prevClickedNode)
          const endIndex = entityHierarchy.value.findIndex((n) => n.entity === entity)
          const range = entityHierarchy.value.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
          const entityUuids = range.filter((n) => n.entity).map((n) => getComponent(n.entity!, UUIDComponent))
          EditorControlFunctions.replaceSelection(entityUuids)
        } else {
          const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
          if (!selected) {
            EditorControlFunctions.replaceSelection([getComponent(entity, UUIDComponent)])
          }
        }
        setPrevClickedNode(entity)
      } else if (e.detail === 2) {
        if (entity && getOptionalComponent(entity, CameraOrbitComponent)) {
          const editorCameraState = getMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
          editorCameraState.focusedEntities.set([entity])
          editorCameraState.refocus.set(true)
        }
      }
    },
    [prevClickedNode, entityHierarchy]
  )

  const onToggle = useCallback(
    (_, entity: Entity) => {
      if (expandedNodes.value[sceneURL][entity]) collapseNode(entity)
      else expandNode(entity)
    },
    [expandedNodes, expandNode, collapseNode]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent, entity: Entity) => {
      const nodeIndex = entityHierarchy.value.findIndex((node) => node.entity === entity)
      const entityTree = getComponent(entity, EntityTreeComponent)
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          if (entity === rootEntity) return

          const nextNode = nodeIndex !== -1 && entityHierarchy.value[nodeIndex + 1]
          if (!nextNode) return

          if (e.shiftKey) {
            EditorControlFunctions.addToSelection([getComponent(nextNode.entity, UUIDComponent)])
          }

          const nextNodeEl = document.getElementById(getNodeElId(nextNode))
          if (nextNodeEl) {
            nextNodeEl.focus()
          }
          break
        }

        case 'ArrowUp': {
          e.preventDefault()
          if (entity === rootEntity) return

          const prevNode = nodeIndex !== -1 && entityHierarchy.value[nodeIndex - 1]
          if (!prevNode) return

          if (e.shiftKey) {
            EditorControlFunctions.addToSelection([getComponent(prevNode.entity, UUIDComponent)])
          }

          const prevNodeEl = document.getElementById(getNodeElId(prevNode))
          if (prevNodeEl) {
            prevNodeEl.focus()
          }
          break
        }

        case 'ArrowLeft':
          if (entityTree && (!entityTree.children || entityTree.children.length === 0)) return

          if (e.shiftKey) collapseChildren(entity)
          else collapseNode(entity)
          break

        case 'ArrowRight':
          if (entityTree && (!entityTree.children || entityTree.children.length === 0)) return

          if (e.shiftKey) expandChildren(entity)
          else expandNode(entity)
          break

        case 'Enter':
          if (entity === rootEntity) return
          if (e.shiftKey) {
            EditorControlFunctions.toggleSelection([getComponent(entity, UUIDComponent)])
          } else {
            EditorControlFunctions.replaceSelection([getComponent(entity, UUIDComponent)])
          }
          break

        case 'Delete':
        case 'Backspace':
          if (entity === rootEntity) return
          if (selectedNodes && !renamingNode) onDeleteNode(entity)
          break
      }
    },
    [entityHierarchy, expandNode, collapseNode, expandChildren, collapseChildren, renamingNode, selectedNodes]
  )

  const onDeleteNode = useCallback((entity: Entity) => {
    handleClose()

    const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    const objs = selected ? SelectionState.getSelectedEntities() : [entity]
    EditorControlFunctions.removeObject(objs)
  }, [])

  const onDuplicateNode = useCallback((entity: Entity) => {
    handleClose()

    const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    const objs = selected ? SelectionState.getSelectedEntities() : [entity]
    EditorControlFunctions.duplicateObject(objs)
  }, [])

  const onGroupNodes = useCallback((entity: Entity) => {
    handleClose()

    const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    const objs = selected ? SelectionState.getSelectedEntities() : [entity]

    EditorControlFunctions.groupObjects(objs)
  }, [])

  const onCopyNode = useCallback((entity: Entity) => {
    handleClose()

    const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    const nodes = selected ? SelectionState.getSelectedEntities() : [entity]
    CopyPasteFunctions.copyEntities(nodes)
  }, [])

  const onPasteNode = useCallback(async (entity: Entity) => {
    handleClose()

    CopyPasteFunctions.getPastedEntities()
      .then((nodeComponentJSONs) => {
        nodeComponentJSONs.forEach((componentJSONs) => {
          EditorControlFunctions.createObjectFromSceneElement(componentJSONs, undefined, entity)
        })
      })
      .catch(() => {
        NotificationService.dispatchNotify(t('editor:hierarchy.copy-paste.no-hierarchy-nodes'), { variant: 'error' })
      })
  }, [])
  /* Event handlers */

  /* Rename functions */
  const onRenameNode = useCallback((entity: Entity) => {
    handleClose()

    if (entity) {
      EditorControlFunctions.replaceSelection([getComponent(entity, UUIDComponent)])
      setRenamingNode({ entity, name: getComponent(entity, NameComponent) })
    } else {
      // todo
    }
  }, [])

  const onChangeName = useCallback((entity: Entity, name: string) => setRenamingNode({ entity, name }), [])

  const onRenameSubmit = useCallback((entity: Entity, name: string) => {
    name = toValidHierarchyNodeName(entity, name)
    if (name) {
      EditorControlFunctions.modifyName([entity], name)
    }

    setRenamingNode(null)
  }, [])

  useEffect(() => {
    if (!renamingNode) return

    if (!selectionState.selectedEntities.value.includes(getComponent(renamingNode.entity, UUIDComponent))) {
      onRenameSubmit(renamingNode.entity, renamingNode.name)
    }
  }, [selectionState.selectedEntities, renamingNode])
  /* Rename functions */

  const [, treeContainerDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...SupportedFileTypes],
    drop(item: any, monitor) {
      if (monitor.didDrop()) return

      // check if item contains files
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding to editor media
        onUpload(entries).then((assets) => {
          if (!assets) return
          for (const asset of assets) addMediaNode(asset)
        })

        return
      }

      if (item.url) {
        addMediaNode(item.url)
        return
      }

      if (item.type === ItemTypes.Component) {
        EditorControlFunctions.createObjectFromSceneElement([{ name: item!.componentJsonID }])
        return
      }

      EditorControlFunctions.reparentObject(Array.isArray(item.value) ? item.value : [item.value])
    },
    canDrop(item: any, monitor) {
      if (!monitor.isOver({ shallow: true })) return false

      // check if item is of node type
      if (item.type === ItemTypes.Node) {
        const sceneEntity = getState(GLTFAssetState)[sceneURL]
        return !(item.multiple
          ? item.value.some((otherObject) => isAncestor(otherObject, sceneEntity))
          : isAncestor(item.value, sceneEntity))
      }

      return true
    }
  })

  let validNodes = searchHierarchy.value.length > 0 ? searchedNodes : entityHierarchy.value
  validNodes = validNodes.filter((node) => entityExists(node.entity))

  const HierarchyList = ({ height, width }) => (
    <FixedSizeList
      height={height}
      width={width}
      itemSize={40}
      itemCount={validNodes.length}
      itemData={{
        renamingNode,
        nodes: validNodes,
        onKeyDown,
        onChangeName,
        onRenameSubmit,
        onClick,
        onToggle,
        onUpload
      }}
      itemKey={(index: number) => index}
      outerRef={treeContainerDropTarget}
      innerElementType="ul"
    >
      {MemoTreeNode}
    </FixedSizeList>
  )

  const [isAddEntityMenuOpen, setIsAddEntityMenuOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 bg-theme-surface-main">
        <Input
          placeholder={t('common:components.search')}
          value={searchHierarchy.value}
          onChange={(event) => {
            searchHierarchy.set(event.target.value)
          }}
          className="m-1 rounded bg-theme-primary text-[#A3A3A3]"
          startComponent={<HiMagnifyingGlass className="text-white" />}
        />
        <Popup
          keepInside
          open={isAddEntityMenuOpen}
          onClose={() => setIsAddEntityMenuOpen(false)}
          trigger={
            <Button
              startIcon={<HiOutlinePlusCircle />}
              variant="transparent"
              rounded="none"
              className="ml-auto w-32 text-nowrap bg-theme-highlight px-2 py-3 text-white"
              size="small"
              textContainerClassName="mx-0"
              onClick={() => setIsAddEntityMenuOpen(true)}
            >
              {t('editor:hierarchy.lbl-addEntity')}
            </Button>
          }
        >
          <div className="h-full w-96 overflow-y-auto">
            <ElementList type="prefabs" onSelect={() => setIsAddEntityMenuOpen(false)} />
          </div>
        </Popup>
      </div>
      <div id="heirarchy-panel" className="h-5/6 overflow-hidden">
        <AutoSizer onResize={HierarchyList}>{HierarchyList}</AutoSizer>
      </div>
      <ContextMenu anchorEvent={anchorEvent} onClose={handleClose}>
        <div className="flex w-fit min-w-44 flex-col gap-1 truncate rounded-lg bg-neutral-900 shadow-lg">
          <Button
            fullWidth
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => onRenameNode(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + r'}
          >
            {t('editor:hierarchy.lbl-rename')}
          </Button>
          <Button
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => onDuplicateNode(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + d'}
          >
            {t('editor:hierarchy.lbl-duplicate')}
          </Button>
          <Button
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => onGroupNodes(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + g'}
          >
            {t('editor:hierarchy.lbl-group')}
          </Button>
          <Button
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => onCopyNode(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + c'}
          >
            {t('editor:hierarchy.lbl-copy')}
          </Button>
          <Button
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => onPasteNode(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + v'}
          >
            {t('editor:hierarchy.lbl-paste')}
          </Button>
          <Button
            fullWidth
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => onDeleteNode(contextSelectedItem!)}
          >
            {t('editor:hierarchy.lbl-delete')}
          </Button>
          <Button
            fullWidth
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => expandChildren(contextSelectedItem!)}
          >
            {t('editor:hierarchy.lbl-expandAll')}
          </Button>
          <Button
            fullWidth
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => collapseChildren(contextSelectedItem!)}
          >
            {t('editor:hierarchy.lbl-collapseAll')}
          </Button>

          <Button
            fullWidth
            size="small"
            variant="transparent"
            className="text-left text-xs"
            onClick={() => PopoverState.showPopupover(<CreatePrefabPanel entity={contextSelectedItem!} />)}
          >
            {t('editor:hierarchy.lbl-createPrefab')}
          </Button>
        </div>
      </ContextMenu>
    </>
  )
}

const GLTFHierarchySub = (props: { sourceID: string; rootEntity: Entity }) => {
  const { sourceID, rootEntity } = props
  const index = GLTFSnapshotState.useSnapshotIndex(sourceID)

  if (index === undefined) return null
  return <HierarchyPanelContents key={sourceID} sceneURL={sourceID} rootEntity={rootEntity} index={index.value} />
}

export default function HierarchyPanel() {
  const { scenePath, rootEntity } = useMutableState(EditorState).value
  const sourceID = useOptionalComponent(rootEntity, SourceComponent)?.value

  if (!scenePath || !rootEntity || !sourceID) return null
  return <GLTFHierarchySub sourceID={sourceID} rootEntity={rootEntity} />
}
