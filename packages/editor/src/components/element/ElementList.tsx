import React, { memo, useCallback, useEffect, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { Vector2 } from 'three'

import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { createEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { ScenePrefabTypes } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { IconButton, Tooltip } from '@mui/material'

import { executeCommandWithHistory } from '../../classes/History'
import { ItemTypes } from '../../constants/AssetTypes'
import EditorCommands from '../../constants/EditorCommands'
import { prefabIcons } from '../../functions/PrefabEditors'
import { getCursorSpawnPosition, getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { shouldPrefabDeserialize } from '../../functions/shouldDeserialize'
import { useSelectionState } from '../../services/SelectionServices'
import { ContextMenu, ContextMenuTrigger, MenuItem } from '../layout/ContextMenu'
import styles from './styles.module.scss'

export interface PrefabItemType {
  type: string
  prefabType: ScenePrefabTypes
  Icon: any
  label: string // todo
  description?: string // todo
}

const ELEMENT_CONTEXT_ID = 'el-menu'

const getPrefabList = () => {
  const arr = [] as PrefabItemType[]

  useWorld().scenePrefabRegistry.forEach((_, prefabType: ScenePrefabTypes) => {
    if (shouldPrefabDeserialize(prefabType)) {
      arr.push({
        prefabType,
        type: ItemTypes.Prefab,
        Icon: prefabIcons[prefabType] || null,
        label: prefabType
      })
    }
  })

  return arr
}

export const addPrefabElement = (
  item: PrefabItemType,
  parent?: EntityTreeNode,
  before?: EntityTreeNode
): EntityTreeNode | undefined => {
  const node = createEntityNode(createEntity())

  executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node, {
    prefabTypes: item.prefabType,
    parents: parent,
    befores: before
  })

  return node
}

type PrefabListItemType = {
  contextMenuId: string
  item: PrefabItemType
  onClick: (item: PrefabItemType) => void
}

/**
 * AssetGridItem used to create grid item view.
 *
 * @author Robert Long
 * @param       {string} contextMenuId
 * @param       {ReactNode} tooltipComponent
 * @param       {PrefabItemType} item
 * @param       {Function} onClick
 * @constructor
 */
function PrefabListItem({ contextMenuId, item, onClick }: PrefabListItemType) {
  const onClickItem = useCallback(() => {
    onClick?.(item)
  }, [item, onClick])

  const [_, drag, preview] = useDrag(() => ({ type: item.type, item, multiple: false }))

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <ContextMenuTrigger
      id={contextMenuId}
      collect={() => {
        return { item }
      }}
      holdToDisplay={-1}
    >
      <Tooltip title={item.label} placement="left" disableInteractive>
        <IconButton className={styles.element} disableRipple ref={drag} onClick={onClickItem}>
          <item.Icon />
        </IconButton>
      </Tooltip>
    </ContextMenuTrigger>
  )
}

/**
 *
 * Memo
 * React renders the component and memoizes the result.
 * Before the next render, if the new props are the same,
 * React reuses the memoized result skipping the next rendering
 *
 *
 * @author Robert Long
 */
const MemoAssetGridItem = memo(PrefabListItem)

/**
 * AssetGrid component used to render AssetGridItems.
 *
 * @author Robert Long
 */
export function ElementList() {
  const { t } = useTranslation()
  const selectionState = useSelectionState()
  const [prefabs, setPrefabs] = useState(getPrefabList())

  useEffect(() => {
    updatePrefabList()
  }, [selectionState.sceneGraphChangeCounter.value])

  const updatePrefabList = () => setPrefabs(getPrefabList())

  const [{ isDragging }, dropRef] = useDrop({
    accept: [ItemTypes.Prefab],
    collect: (monitor) => ({ isDragging: monitor.getItem() !== null && monitor.canDrop() }),
    drop(item: PrefabItemType, monitor) {
      const node = addPrefabElement(item)
      if (!node) return

      const transformComponent = getComponent(node.entity, TransformComponent)
      if (transformComponent) {
        getCursorSpawnPosition(monitor.getClientOffset() as Vector2, transformComponent.position)
      }
    }
  })

  const placeObject = useCallback((_, trigger) => {
    const node = addPrefabElement(trigger.item)
    if (!node) return

    const transformComponent = getComponent(node.entity, TransformComponent)
    if (transformComponent) getSpawnPositionAtCenter(transformComponent.position)
  }, [])

  const placeObjectAtOrigin = useCallback((_, trigger) => addPrefabElement(trigger.item), [])

  return (
    <>
      <div className={styles.elementListContainer}>
        {prefabs.map((item) => (
          <MemoAssetGridItem
            key={item.prefabType}
            contextMenuId={ELEMENT_CONTEXT_ID}
            item={item}
            onClick={addPrefabElement}
          />
        ))}
      </div>
      <div
        className={styles.elementDropZone}
        ref={dropRef}
        style={{ pointerEvents: isDragging ? 'auto' : 'none' }}
      ></div>
      <ContextMenu id={ELEMENT_CONTEXT_ID}>
        <MenuItem onClick={placeObject}>{t('editor:layout.assetGrid.placeObject')}</MenuItem>
        <MenuItem onClick={placeObjectAtOrigin}>{t('editor:layout.assetGrid.placeObjectAtOrigin')}</MenuItem>
      </ContextMenu>
    </>
  )
}

export default ElementList
