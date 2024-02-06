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

import React, { useCallback, useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import Hotkeys from 'react-hot-keys'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import { getComponent, getMutableComponent, getOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { AllFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { NO_PROXY, getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { EntityTreeComponent, traverseEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'

import MenuItem from '@mui/material/MenuItem'
import { PopoverPosition } from '@mui/material/Popover'

import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { Engine } from '@etherealengine/ecs'
import { entityExists } from '@etherealengine/ecs/src/EntityFunctions'
import { useQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { SceneObjectComponent } from '@etherealengine/engine/src/scene/components/SceneObjectComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { ItemTypes, SupportedFileTypes } from '../../constants/AssetTypes'
import { CopyPasteFunctions } from '../../functions/CopyPasteFunctions'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { addMediaNode } from '../../functions/addMediaNode'
import { isAncestor } from '../../functions/getDetachedObjectsRoots'
import { cmdOrCtrlString } from '../../functions/utils'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'
import Search from '../Search/Search'
import useUpload from '../assets/useUpload'
import { PropertiesPanelButton } from '../inputs/Button'
import { ContextMenu } from '../layout/ContextMenu'
import { updateProperties } from '../properties/Util'
import { HeirarchyTreeNodeType, heirarchyTreeWalker } from './HeirarchyTreeWalker'
import { HierarchyTreeNode, HierarchyTreeNodeProps, RenameNodeData, getNodeElId } from './HierarchyTreeNode'
import styles from './styles.module.scss'

/**
 * initializes object containing Properties multiple, accepts.
 */
const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

/**
 * HierarchyPanel function component provides view for hierarchy tree.
 */
function HierarchyPanelContents({ rootEntityUUID }: { rootEntityUUID: EntityUUID }) {
  const { t } = useTranslation()
  const [contextSelectedItem, setContextSelectedItem] = React.useState<undefined | HeirarchyTreeNodeType>(undefined)
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [prevClickedNode, setPrevClickedNode] = useState<HeirarchyTreeNodeType | null>(null)
  const onUpload = useUpload(uploadOptions)
  const selectionState = useHookstate(getMutableState(SelectionState))
  const [renamingNode, setRenamingNode] = useState<RenameNodeData | null>(null)
  const expandedNodes = useHookstate(getMutableState(EditorState).expandedNodes)
  const entityHierarchy = useHookstate<HeirarchyTreeNodeType[]>([])
  const nodeSearch: HeirarchyTreeNodeType[] = []
  const [selectedNode, _setSelectedNode] = useState<HeirarchyTreeNodeType | null>(null)
  const lockPropertiesPanel = useHookstate(getMutableState(EditorState).lockPropertiesPanel)
  const searchHierarchy = useHookstate('')

  const activeScene = useHookstate(getMutableState(SceneState).activeScene)
  const uuidQuery = useQuery([UUIDComponent, SceneObjectComponent])
  const rootEntity = UUIDComponent.useEntityByUUID(rootEntityUUID)
  const index = SceneState.useSnapshotIndex(activeScene.value!)

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

  if (searchHierarchy.value.length > 0) {
    const condition = new RegExp(searchHierarchy.value.toLowerCase())
    entityHierarchy.value.forEach((node) => {
      if (node.entity && condition.test(getComponent(node.entity, NameComponent)?.toLowerCase() ?? ''))
        nodeSearch.push(node)
    })
  }

  useEffect(() => {
    if (!expandedNodes.value[activeScene.value!]) {
      expandedNodes.set({ [activeScene.value!]: { [rootEntity]: true } })
    }
  }, [rootEntity])

  useEffect(() => {
    if (!activeScene.value) return
    entityHierarchy.set(
      Array.from(
        heirarchyTreeWalker(
          activeScene.value,
          SceneState.getRootEntity(getState(SceneState).activeScene!),
          SelectionState.getSelectedEntities()
        )
      )
    )
  }, [expandedNodes, index, uuidQuery.length, activeScene, selectionState.selectedEntities])

  const setSelectedNode = (selection) => !lockPropertiesPanel.value && _setSelectedNode(selection)

  /* Expand & Collapse Functions */
  const expandNode = useCallback(
    (node: HeirarchyTreeNodeType) => {
      const scene = activeScene.get(NO_PROXY)
      if (!scene) return
      expandedNodes[scene][node.entity].set(true)
    },
    [expandedNodes, activeScene]
  )

  const collapseNode = useCallback(
    (node: HeirarchyTreeNodeType) => {
      const scene = activeScene.get(NO_PROXY)
      if (!scene) return
      expandedNodes[scene][node.entity].set(none)
    },
    [expandedNodes, activeScene]
  )

  const expandChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      const scene = activeScene.get(NO_PROXY)
      if (!scene) return
      handleClose()
      traverseEntityNode(node.entity, (child) => {
        expandedNodes[scene][child].set(true)
      })
    },
    [expandedNodes]
  )

  const collapseChildren = useCallback(
    (node: HeirarchyTreeNodeType) => {
      const scene = activeScene.get(NO_PROXY)
      if (!scene) return
      handleClose()
      traverseEntityNode(node.entity, (child) => {
        expandedNodes[scene][child].set(none)
      })
    },
    [expandedNodes]
  )

  /* Event handlers */
  const onMouseDown = useCallback(
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
      }
    },
    [prevClickedNode, entityHierarchy]
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
    setAnchorPosition(undefined)
  }

  const onClick = useCallback((e: MouseEvent, node: HeirarchyTreeNodeType) => {
    if (e.detail === 2) {
      const editorCameraState = getMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
      editorCameraState.focusedEntities.set([node.entity])
      editorCameraState.refocus.set(true)
    }
  }, [])

  const onToggle = useCallback(
    (_, node: HeirarchyTreeNodeType) => {
      if (!activeScene.value) return
      if (expandedNodes.value[activeScene.value][node.entity]) collapseNode(node)
      else expandNode(node)
    },
    [activeScene, expandedNodes, expandNode, collapseNode]
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
      updateProperties(NameComponent, name, [node.entity])
      const groups = getOptionalComponent(node.entity, GroupComponent)
      if (groups) for (const obj of groups) if (obj) obj.name = name
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

      if (!getState(SceneState).activeScene) return false

      // check if item is of node type
      if (item.type === ItemTypes.Node) {
        const sceneEntity = SceneState.getRootEntity(getState(SceneState).activeScene!)
        return !(item.multiple
          ? item.value.some((otherObject) => isAncestor(otherObject, sceneEntity))
          : isAncestor(item.value, sceneEntity))
      }

      return true
    }
  })

  if (!activeScene) return <></>

  let validNodes = nodeSearch?.length > 0 ? nodeSearch : entityHierarchy.value
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
        onMouseDown,
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
      <div className={styles.panelContainer}>
        <div className={styles.dockableTabButtons}>
          <Search elementsName="hierarchy" handleInputChange={searchHierarchy.set} />
        </div>
        <div style={{ height: '100%' }}>
          <AutoSizer onResize={HierarchyList}>{HierarchyList}</AutoSizer>
        </div>
        <PropertiesPanelButton
          variant="contained"
          // TODO see why we have to specify capitalize here
          style={{
            textTransform: 'capitalize',
            margin: '5px auto',
            width: 'auto',
            fontSize: '12px',
            lineHeight: '0.5'
          }}
          onClick={() => EditorControlFunctions.createObjectFromSceneElement()}
        >
          {t('editor:hierarchy.lbl-addEntity')}
        </PropertiesPanelButton>
      </div>
      <ContextMenu open={!!anchorEl} anchorEl={anchorEl} anchorPosition={anchorPosition} onClose={handleClose}>
        <MenuItem onClick={() => onRenameNode(contextSelectedItem!)}>{t('editor:hierarchy.lbl-rename')}</MenuItem>
        <Hotkeys
          keyName={cmdOrCtrlString + '+d'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onDuplicateNode(selectedNode!)
          }}
        >
          <MenuItem onClick={() => onDuplicateNode(contextSelectedItem!)}>
            {t('editor:hierarchy.lbl-duplicate')}
            <div>{cmdOrCtrlString + ' + d'}</div>
          </MenuItem>
        </Hotkeys>
        <Hotkeys
          keyName={cmdOrCtrlString + '+g'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onGroupNodes(selectedNode!)
          }}
        >
          <MenuItem onClick={() => onGroupNodes(contextSelectedItem!)}>
            {t('editor:hierarchy.lbl-group')}
            <div>{cmdOrCtrlString + ' + g'}</div>
          </MenuItem>
        </Hotkeys>
        <Hotkeys
          keyName={cmdOrCtrlString + '+c'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onCopyNode(selectedNode)
          }}
        >
          <MenuItem onClick={() => onCopyNode(contextSelectedItem!)}>
            {t('editor:hierarchy.lbl-copy')}
            <div>{cmdOrCtrlString + ' + c'}</div>
          </MenuItem>
        </Hotkeys>
        <Hotkeys
          keyName={cmdOrCtrlString + '+v'}
          onKeyUp={(_, e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedNode && onPasteNode(selectedNode)
          }}
        >
          <MenuItem onClick={() => onPasteNode(contextSelectedItem!)}>
            {t('editor:hierarchy.lbl-paste')}
            <div>{cmdOrCtrlString + ' + v'}</div>
          </MenuItem>
        </Hotkeys>
        <MenuItem onClick={() => onDeleteNode(contextSelectedItem!)}>{t('editor:hierarchy.lbl-delete')}</MenuItem>
        <MenuItem onClick={() => expandChildren(contextSelectedItem!)}>{t('editor:hierarchy.lbl-expandAll')}</MenuItem>
        <MenuItem onClick={() => collapseChildren(contextSelectedItem!)}>
          {t('editor:hierarchy.lbl-collapseAll')}
        </MenuItem>
      </ContextMenu>
    </>
  )
}

export default function HierarchyPanel() {
  const editorState = useHookstate(getMutableState(EditorState))
  const sceneState = useHookstate(getMutableState(SceneState))

  const sceneJson = SceneState.getScene(editorState.sceneID.value!)

  if (!editorState.sceneID.value || !sceneState.scenes[editorState.sceneID.value] || !sceneJson) return null
  return <HierarchyPanelContents key={sceneJson.root} rootEntityUUID={sceneJson.root} />
}
