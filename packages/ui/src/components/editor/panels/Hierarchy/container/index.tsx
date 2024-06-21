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

import { getComponent, getMutableComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { AllFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { getMutableState, getState, none, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import {
  EntityTreeComponent,
  isAncestor,
  traverseEntityNode
} from '@etherealengine/spatial/src/transform/components/EntityTree'
import React, { useCallback, useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import Hotkeys from 'react-hot-keys'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { Engine, EntityUUID, UUIDComponent, entityExists, useQuery } from '@etherealengine/ecs'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import useUpload from '@etherealengine/editor/src/components/assets/useUpload'
import CreatePrefabPanel from '@etherealengine/editor/src/components/dialogs/CreatePrefabPanelDialog'
import {
  HeirarchyTreeNodeType,
  heirarchyTreeWalker
} from '@etherealengine/editor/src/components/hierarchy/HeirarchyTreeWalker'
import { ItemTypes, SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { CopyPasteFunctions } from '@etherealengine/editor/src/functions/CopyPasteFunctions'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { addMediaNode } from '@etherealengine/editor/src/functions/addMediaNode'
import { cmdOrCtrlString } from '@etherealengine/editor/src/functions/utils'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { GLTFAssetState, GLTFSnapshotState } from '@etherealengine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { PopoverPosition } from '@mui/material'
import { HiMagnifyingGlass, HiOutlinePlusCircle } from 'react-icons/hi2'
import { HierarchyPanelTab } from '..'
import Button from '../../../../../primitives/tailwind/Button'
import Input from '../../../../../primitives/tailwind/Input'
import ContextMenu from '../../../layout/ContextMenu'
import Popover from '../../../layout/Popover'
import { PopoverContext } from '../../../util/PopoverContext'
import ElementList from '../../Properties/elementList'
import HierarchyTreeNode, { HierarchyTreeNodeProps, RenameNodeData, getNodeElId } from '../node'

const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

/**
 * HierarchyPanel function component provides view for hierarchy tree.
 */
function HierarchyPanelContents(props: { sceneURL: string; rootEntityUUID: EntityUUID; index: number }) {
  const { sceneURL, rootEntityUUID, index } = props
  const { t } = useTranslation()
  const [contextSelectedItem, setContextSelectedItem] = React.useState<undefined | HeirarchyTreeNodeType>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [anchorPosition, setAnchorPosition] = React.useState({ left: 0, top: 0 })
  const [anchorPositionPop, setAnchorPositionPop] = React.useState<undefined | PopoverPosition>(undefined)

  const [prevClickedNode, setPrevClickedNode] = useState<HeirarchyTreeNodeType | null>(null)
  const onUpload = useUpload(uploadOptions)
  const [renamingNode, setRenamingNode] = useState<RenameNodeData | null>(null)
  const expandedNodes = useHookstate(getMutableState(EditorState).expandedNodes)
  const entityHierarchy = useHookstate<HeirarchyTreeNodeType[]>([])
  const [selectedNode, _setSelectedNode] = useState<HeirarchyTreeNodeType | null>(null)
  const lockPropertiesPanel = useHookstate(getMutableState(EditorState).lockPropertiesPanel)
  const searchHierarchy = useHookstate('')
  const sourcedEntities = useQuery([SourceComponent])
  const rootEntity = UUIDComponent.useEntityByUUID(rootEntityUUID)
  const rootEntityTree = useComponent(rootEntity, EntityTreeComponent)
  const panel = document.getElementById('propertiesPanel')
  const anchorElButton = useHookstate<HTMLButtonElement | null>(null)
  const open = !!anchorElButton.value

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

  const searchedNodes: HeirarchyTreeNodeType[] = []
  if (searchHierarchy.value.length > 0) {
    const condition = new RegExp(searchHierarchy.value.toLowerCase())
    entityHierarchy.value.forEach((node) => {
      if (node.entity && condition.test(getComponent(node.entity, NameComponent)?.toLowerCase() ?? ''))
        searchedNodes.push(node)
    })
  }

  useEffect(() => {
    if (!expandedNodes.value[sceneURL]) {
      expandedNodes.set({ [sceneURL]: { [rootEntity]: true } })
    }
  }, [])

  useEffect(() => {
    entityHierarchy.set(Array.from(heirarchyTreeWalker(sceneURL, rootEntity)))
  }, [expandedNodes, index, rootEntityTree.children, sourcedEntities.length])

  const setSelectedNode = (selection) => !lockPropertiesPanel.value && _setSelectedNode(selection)

  /* Expand & Collapse Functions */
  const expandNode = useCallback(
    (node: HeirarchyTreeNodeType) => {
      expandedNodes[sceneURL][node.entity].set(true)
    },
    [expandedNodes]
  )

  const collapseNode = useCallback(
    (node: HeirarchyTreeNodeType) => {
      expandedNodes[sceneURL][node.entity].set(none)
    },
    [expandedNodes]
  )

  const expandChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      handleClose()
      traverseEntityNode(node.entity, (child) => {
        expandedNodes[sceneURL][child].set(true)
      })
    },
    [expandedNodes]
  )

  const collapseChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      handleClose()
      traverseEntityNode(node.entity, (child) => {
        expandedNodes[sceneURL][child].set(none)
      })
    },
    [expandedNodes]
  )

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>, item: HeirarchyTreeNodeType) => {
    event.preventDefault()
    event.stopPropagation()

    setContextSelectedItem(item)
    setAnchorEl(event.currentTarget)
    setAnchorPosition({
      left: event.clientX + 2,
      top: event.clientY - 6
    })
  }

  const handleClose = () => {
    setContextSelectedItem(undefined)
    setAnchorEl(null)
    setAnchorPosition({ left: 0, top: 0 })
  }

  const onMouseDown = useCallback((e: React.MouseEvent, node: HeirarchyTreeNodeType) => {}, [])

  const onClick = useCallback(
    (e: MouseEvent, node: HeirarchyTreeNodeType) => {
      if (e.detail === 1) {
        if (e.ctrlKey) {
          EditorControlFunctions.toggleSelection([getComponent(node.entity, UUIDComponent)])
          setSelectedNode(null)
        } else if (e.shiftKey && prevClickedNode) {
          const startIndex = entityHierarchy.value.findIndex((n) => n.entity === prevClickedNode.entity)
          const endIndex = entityHierarchy.value.findIndex((n) => n.entity === node.entity)
          const range = entityHierarchy.value.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
          const entityUuids = range.filter((n) => n.entity).map((n) => getComponent(n.entity!, UUIDComponent))
          EditorControlFunctions.replaceSelection(entityUuids)
          setSelectedNode(node)
        } else {
          const selected = getState(SelectionState).selectedEntities.includes(getComponent(node.entity, UUIDComponent))
          if (!selected) {
            EditorControlFunctions.replaceSelection([getComponent(node.entity, UUIDComponent)])
            setSelectedNode(node)
          }
        }
        setPrevClickedNode(node)
      } else if (e.detail === 2) {
        const editorCameraState = getMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
        editorCameraState.focusedEntities.set([node.entity])
        editorCameraState.refocus.set(true)
      }
    },
    [prevClickedNode, entityHierarchy]
  )

  const onToggle = useCallback(
    (_, node: HeirarchyTreeNodeType) => {
      if (expandedNodes.value[sceneURL][node.entity]) collapseNode(node)
      else expandNode(node)
    },
    [expandedNodes, expandNode, collapseNode]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent, node: HeirarchyTreeNodeType) => {
      const nodeIndex = entityHierarchy.value.indexOf(node)
      const entityTree = getComponent(node.entity, EntityTreeComponent)
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()

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

          if (e.shiftKey) collapseChildren(node)
          else collapseNode(node)
          break

        case 'ArrowRight':
          if (entityTree && (!entityTree.children || entityTree.children.length === 0)) return

          if (e.shiftKey) expandChildren(node)
          else expandNode(node)
          break

        case 'Enter':
          if (e.shiftKey) {
            EditorControlFunctions.toggleSelection([getComponent(node.entity, UUIDComponent)])
            setSelectedNode(null)
          } else {
            EditorControlFunctions.replaceSelection([getComponent(node.entity, UUIDComponent)])
            setSelectedNode(node)
          }
          break

        case 'Delete':
        case 'Backspace':
          if (selectedNode && !renamingNode) onDeleteNode(selectedNode!)
          break
      }
    },
    [entityHierarchy, expandNode, collapseNode, expandChildren, collapseChildren, renamingNode, selectedNode]
  )

  const onDeleteNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    const selected = getState(SelectionState).selectedEntities.includes(getComponent(node.entity, UUIDComponent))
    const objs = selected ? SelectionState.getSelectedEntities() : [node.entity]
    EditorControlFunctions.removeObject(objs)
  }, [])

  const onDuplicateNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    const selected = getState(SelectionState).selectedEntities.includes(getComponent(node.entity, UUIDComponent))
    const objs = selected ? SelectionState.getSelectedEntities() : [node.entity]
    EditorControlFunctions.duplicateObject(objs)
  }, [])

  const onGroupNodes = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    const selected = getState(SelectionState).selectedEntities.includes(getComponent(node.entity, UUIDComponent))
    const objs = selected ? SelectionState.getSelectedEntities() : [node.entity]

    EditorControlFunctions.groupObjects(objs)
  }, [])

  const onCopyNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    const selected = getState(SelectionState).selectedEntities.includes(getComponent(node.entity, UUIDComponent))
    const nodes = selected ? SelectionState.getSelectedEntities() : [node.entity]
    CopyPasteFunctions.copyEntities(nodes)
  }, [])

  const onPasteNode = useCallback(async (node: HeirarchyTreeNodeType) => {
    handleClose()

    CopyPasteFunctions.getPastedEntities()
      .then((nodeComponentJSONs) => {
        nodeComponentJSONs.forEach((componentJSONs) => {
          EditorControlFunctions.createObjectFromSceneElement(componentJSONs, undefined, node.entity)
        })
      })
      .catch(() => {
        NotificationService.dispatchNotify(t('editor:hierarchy.copy-paste.no-hierarchy-nodes'), { variant: 'error' })
      })
  }, [])
  /* Event handlers */

  /* Rename functions */
  const onRenameNode = useCallback((node: HeirarchyTreeNodeType) => {
    handleClose()

    if (node.entity) {
      const entity = node.entity
      setRenamingNode({ entity, name: getComponent(entity, NameComponent) })
    } else {
      // todo
    }
  }, [])

  const onChangeName = useCallback(
    (node: HeirarchyTreeNodeType, name: string) => setRenamingNode({ entity: node.entity, name }),
    []
  )

  const onRenameSubmit = useCallback((node: HeirarchyTreeNodeType, name: string) => {
    if (name) {
      EditorControlFunctions.modifyName([node.entity], name)
    }

    setRenamingNode(null)
  }, [])
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
      itemSize={32}
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
      itemKey={(index) => index}
      outerRef={treeContainerDropTarget}
      innerElementType="ul"
    >
      {MemoTreeNode}
    </FixedSizeList>
  )

  return (
    <>
      <PopoverContext.Provider
        value={{
          handlePopoverClose: () => {
            anchorElButton.set(null)
          }
        }}
      >
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

          <Button
            startIcon={<HiOutlinePlusCircle />}
            variant="transparent"
            rounded="none"
            className="ml-auto w-32 bg-theme-highlight px-2 py-3"
            size="small"
            textContainerClassName="mx-0"
            onClick={(event) => {
              setAnchorPositionPop({ top: event.clientY - 10, left: panel?.getBoundingClientRect().left! + 10 })
              anchorElButton.set(event.currentTarget)
            }}
          >
            <span className="text-nowrap">{t('editor:hierarchy.lbl-addEntity')}</span>
          </Button>
        </div>
        <Popover
          open={open}
          anchorEl={anchorElButton.value as any}
          onClose={() => {
            anchorElButton.set(null)
            setAnchorPositionPop(undefined)
          }}
          panelId={HierarchyPanelTab.id!}
          anchorPosition={anchorPositionPop}
          className="h-[60%] w-full min-w-[300px] overflow-y-auto"
        >
          <ElementList type="prefabs" />
        </Popover>
      </PopoverContext.Provider>
      <div id="heirarchy-panel" className="h-5/6 overflow-hidden">
        <AutoSizer onResize={HierarchyList}>{HierarchyList}</AutoSizer>
      </div>
      <ContextMenu
        open={!!anchorEl}
        anchorEl={anchorEl}
        panelId={'heirarchy-panel'}
        anchorPosition={anchorPosition}
        onClose={handleClose}
      >
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={() => onRenameNode(contextSelectedItem!)}
        >
          {t('editor:hierarchy.lbl-rename')}
        </Button>
        <Hotkeys
          keyName={cmdOrCtrlString + '+d'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onDuplicateNode(selectedNode!)
          }}
        >
          <Button
            size="small"
            variant="transparent"
            className="w-full text-left text-xs"
            onClick={() => onDuplicateNode(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + d'}
          >
            {t('editor:hierarchy.lbl-duplicate')}
          </Button>
        </Hotkeys>
        <Hotkeys
          keyName={cmdOrCtrlString + '+g'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onGroupNodes(selectedNode!)
          }}
        >
          <Button
            size="small"
            variant="transparent"
            className="w-full text-left text-xs"
            onClick={() => onGroupNodes(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + g'}
          >
            {t('editor:hierarchy.lbl-group')}
          </Button>
        </Hotkeys>
        <Hotkeys
          keyName={cmdOrCtrlString + '+c'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onCopyNode(selectedNode)
          }}
        >
          <Button
            size="small"
            variant="transparent"
            className="w-full text-left text-xs"
            onClick={() => onCopyNode(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + c'}
          >
            {t('editor:hierarchy.lbl-copy')}
          </Button>
        </Hotkeys>
        <Hotkeys
          keyName={cmdOrCtrlString + '+v'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onPasteNode(selectedNode)
          }}
        >
          <Button
            size="small"
            variant="transparent"
            className="w-full text-left text-xs"
            onClick={() => onPasteNode(contextSelectedItem!)}
            endIcon={cmdOrCtrlString + ' + v'}
          >
            {t('editor:hierarchy.lbl-paste')}
          </Button>
        </Hotkeys>
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
          onClick={() => PopoverState.showPopupover(<CreatePrefabPanel node={contextSelectedItem!} />)}
        >
          {t('editor:hierarchy.lbl-createPrefab')}
        </Button>

        {/* )} */}
      </ContextMenu>
    </>
  )
}

export default function HierarchyPanel() {
  const sceneID = useHookstate(getMutableState(EditorState).scenePath).value
  const gltfEntity = useMutableState(EditorState).rootEntity.value
  if (!sceneID || !gltfEntity) return null

  const GLTFHierarchySub = () => {
    const rootEntityUUID = getComponent(gltfEntity, UUIDComponent)
    const sourceID = `${rootEntityUUID}-${sceneID}`
    const index = GLTFSnapshotState.useSnapshotIndex(sourceID)

    return (
      <HierarchyPanelContents
        key={`${sourceID}-${index.value}`}
        rootEntityUUID={rootEntityUUID}
        sceneURL={sourceID}
        index={index.value}
      />
    )
  }

  return <GLTFHierarchySub />
}
