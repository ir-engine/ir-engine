import React, { memo, useCallback, useEffect, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { Vector2 } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { getComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityOrObjectUUID, EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { LocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'

import { IconButton, MenuItem, PopoverPosition, Tooltip } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { prefabIcons } from '../../functions/PrefabEditors'
import { getCursorSpawnPosition, getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { useSelectionState } from '../../services/SelectionServices'
import { ContextMenu } from '../layout/ContextMenu'
import styles from './styles.module.scss'

export interface PrefabItemType {
  type: string
  prefabType: string
  Icon: any
  label: string
  description?: string
}

const getPrefabList = () => {
  const arr = [] as PrefabItemType[]

  Engine.instance.scenePrefabRegistry.forEach((_, prefabType: string) => {
    arr.push({
      prefabType,
      type: ItemTypes.Prefab,
      Icon: prefabIcons[prefabType] || null,
      label: prefabType
    })
  })

  return arr
}

export const addPrefabElement = (item: PrefabItemType, parent = getState(SceneState).sceneEntity, before?: Entity) => {
  const newEntity = EditorControlFunctions.createObjectFromPrefab(item.prefabType, parent, before, true)

  return newEntity
}

type PrefabListItemType = {
  item: PrefabItemType
  onClick: (item: PrefabItemType) => void
  onContextMenu: (event: React.MouseEvent<HTMLElement>, item: PrefabItemType) => void
}

/**
 * AssetGridItem used to create grid item view.
 *
 * @param       {PrefabItemType} item
 * @param       {Function} onClick
 * @param       {Function} onContextMenu
 * @constructor
 */
function PrefabListItem({ item, onClick, onContextMenu }: PrefabListItemType) {
  const onClickItem = useCallback(() => {
    onClick?.(item)
  }, [item, onClick])

  const [_, drag, preview] = useDrag(() => ({ type: item.type, item, multiple: false }))

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div onContextMenu={(event) => onContextMenu(event, item)}>
      <Tooltip title={item.label} placement="left" disableInteractive>
        <IconButton className={styles.element} disableRipple ref={drag} onClick={onClickItem}>
          <item.Icon />
        </IconButton>
      </Tooltip>
    </div>
  )
}

/**
 * Memo
 * React renders the component and memoizes the result.
 * Before the next render, if the new props are the same,
 * React reuses the memoized result skipping the next rendering
 */
const MemoAssetGridItem = memo(PrefabListItem)

/**
 * AssetGrid component used to render AssetGridItems.
 */
export function ElementList() {
  const { t } = useTranslation()
  const selectionState = useSelectionState()
  const [prefabs, setPrefabs] = useState(getPrefabList())
  const [selectedItem, setSelectedItem] = React.useState<undefined | PrefabItemType>(undefined)
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

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

      const transformComponent = getComponent(node, TransformComponent)
      if (transformComponent) {
        getCursorSpawnPosition(monitor.getClientOffset() as Vector2, transformComponent.position)
        const localTransformComponent = getComponent(node, LocalTransformComponent)
        if (localTransformComponent) {
          localTransformComponent.position.copy(transformComponent.position)
        }
      }
    }
  })

  const placeObject = () => {
    handleClose()

    const node = addPrefabElement(selectedItem!)
    if (!node) return

    const transformComponent = getComponent(node, TransformComponent)
    if (transformComponent) getSpawnPositionAtCenter(transformComponent.position)
  }

  const placeObjectAtOrigin = () => {
    handleClose()

    addPrefabElement(selectedItem!)
  }

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>, item: PrefabItemType) => {
    event.preventDefault()
    event.stopPropagation()

    setSelectedItem(item)
    setAnchorEl(event.currentTarget)
    setAnchorPosition({
      left: event.clientX + 2,
      top: event.clientY - 6
    })
  }

  const handleClose = () => {
    setSelectedItem(undefined)
    setAnchorEl(null)
    setAnchorPosition(undefined)
  }

  return (
    <>
      <div className={styles.elementListContainer}>
        {prefabs.map((item) => (
          <MemoAssetGridItem
            key={item.prefabType}
            item={item}
            onClick={addPrefabElement}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
      <div
        className={styles.elementDropZone}
        ref={dropRef}
        style={{ pointerEvents: isDragging ? 'auto' : 'none' }}
      ></div>
      <ContextMenu open={open} anchorEl={anchorEl} anchorPosition={anchorPosition} onClose={handleClose}>
        <MenuItem onClick={placeObject}>{t('editor:layout.assetGrid.placeObject')}</MenuItem>
        <MenuItem onClick={placeObjectAtOrigin}>{t('editor:layout.assetGrid.placeObjectAtOrigin')}</MenuItem>
      </ContextMenu>
    </>
  )
}

export default ElementList
