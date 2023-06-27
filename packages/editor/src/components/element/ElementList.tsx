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

import React, { memo, useCallback, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { Vector2 } from 'three'

import { MediaPrefabs } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { getComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityOrObjectUUID, EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { PhysicsPrefabs } from '@etherealengine/engine/src/physics/systems/PhysicsSystem'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { LightPrefabs } from '@etherealengine/engine/src/scene/systems/LightSystem'
import { ScenePrefabs } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import { LocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { NO_PROXY, useState } from '@etherealengine/hyperflux'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { IconButton, MenuItem, PopoverPosition, Tooltip, Typography } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { prefabIcons } from '../../functions/PrefabEditors'
import { getCursorSpawnPosition, getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { SelectionState } from '../../services/SelectionServices'
import { ContextMenu } from '../layout/ContextMenu'
import styles from './styles.module.scss'

export interface PrefabItemType {
  type: string
  prefabType: string
  Icon: any
  label: string
  description?: string
}

const categories = {
  Files: [ScenePrefabs.model, MediaPrefabs.volumetric, MediaPrefabs.audio, MediaPrefabs.video, ScenePrefabs.image],
  'Scene Composition': [ScenePrefabs.groundPlane, ScenePrefabs.group, ScenePrefabs.prefab, PhysicsPrefabs.collider],
  Interaction: [ScenePrefabs.spawnPoint, ScenePrefabs.portal],
  Lighting: [...Object.values(LightPrefabs)],
  FX: [ScenePrefabs.ocean, ScenePrefabs.particleEmitter, ScenePrefabs.spline, ScenePrefabs.cloud, ScenePrefabs.water],
  Scripting: [ScenePrefabs.system, ScenePrefabs.behaveGraph]
}

const getPrefabList = () => {
  const result = {} as Record<string, PrefabItemType[]>
  for (const category in categories) {
    result[category] = categories[category].map((prefab) => ({
      type: ItemTypes.Prefab,
      prefabType: prefab,
      Icon: prefabIcons[prefab] || null,
      label: prefab
    }))
  }
  Engine.instance.scenePrefabRegistry.forEach((_, prefabType: string) => {
    if (Object.entries(categories).every(([_, prefabs]) => !(prefabs as string[]).includes(prefabType))) {
      !result['Misc'] && (result['Misc'] = [])
      result['Misc'].push({
        type: ItemTypes.Prefab,
        prefabType,
        Icon: prefabIcons[prefabType] || null,
        label: prefabType
      })
    }
  })

  return result
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
  const selectionState = useHookstate(getMutableState(SelectionState))
  const prefabs = useState(getPrefabList())
  const [selectedItem, setSelectedItem] = React.useState<undefined | PrefabItemType>(undefined)
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  useEffect(() => {
    prefabs.set(getPrefabList())
  }, [selectionState.sceneGraphChangeCounter.value])

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
        {Object.entries(prefabs.get(NO_PROXY)).map(([category, items]) => (
          <div className={styles.category} key={category}>
            <Typography variant="subtitle2" className={styles.categoryTitle}>
              {category}
            </Typography>
            {items.map((item) => (
              <MemoAssetGridItem
                key={item.prefabType}
                item={item}
                onClick={addPrefabElement}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
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
