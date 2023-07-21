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

import { startCase } from 'lodash'
import React, { useCallback, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { Vector2 } from 'three'

import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { Component, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { AmbientLightComponent } from '@etherealengine/engine/src/scene/components/AmbientLightComponent'
import { ColliderComponent } from '@etherealengine/engine/src/scene/components/ColliderComponent'
import { DirectionalLightComponent } from '@etherealengine/engine/src/scene/components/DirectionalLightComponent'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { GroundPlaneComponent } from '@etherealengine/engine/src/scene/components/GroundPlaneComponent'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { HemisphereLightComponent } from '@etherealengine/engine/src/scene/components/HemisphereLightComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { PointLightComponent } from '@etherealengine/engine/src/scene/components/PointLightComponent'
import { PortalComponent } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@etherealengine/engine/src/scene/components/SpawnPointComponent'
import { SpotLightComponent } from '@etherealengine/engine/src/scene/components/SpotLightComponent'
import { SystemComponent } from '@etherealengine/engine/src/scene/components/SystemComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import {
  LocalTransformComponent,
  TransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'
import MenuItem from '@etherealengine/ui/src/primitives/mui/MenuItem'
import Tooltip from '@etherealengine/ui/src/primitives/mui/Tooltip'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { GroupAddOutlined as PlaceHolderIcon } from '@mui/icons-material'
import { IconButton, PopoverPosition } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import { EntityNodeEditor } from '../../functions/ComponentEditors'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { getCursorSpawnPosition, getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { ContextMenu } from '../layout/ContextMenu'
import styles from './styles.module.scss'

type SceneElementType = {
  componentName: string
  label: string
  Icon: any
  type: typeof ItemTypes.Prefab
}

type SceneElementListItemType = {
  item: SceneElementType
  onClick: (item: SceneElementType) => void
  onContextMenu: (event: React.MouseEvent<HTMLElement>, item: SceneElementType) => void
}

export const ComponentShelfCategories: Record<string, Component[]> = {
  Files: [ModelComponent, VolumetricComponent, PositionalAudioComponent, VideoComponent, ImageComponent],
  'Scene Composition': [GroundPlaneComponent, GroupComponent, PrefabComponent, ColliderComponent],
  Interaction: [SpawnPointComponent, PortalComponent],
  Lighting: [
    AmbientLightComponent,
    PointLightComponent,
    SpotLightComponent,
    DirectionalLightComponent,
    HemisphereLightComponent
  ],
  FX: [ParticleSystemComponent],
  Scripting: [SystemComponent],
  Misc: [EnvMapBakeComponent, ScenePreviewCameraComponent, SkyboxComponent]
}

export const addSceneComponentElement = (
  item: Pick<SceneElementType, 'componentName'>,
  before?: Entity,
  parent = getState(SceneState).sceneEntity
) => {
  const newEntity = EditorControlFunctions.createObjectFromSceneElement(item.componentName, parent, before, true)
  return newEntity
}

const SceneElementListItem = ({ item, onClick, onContextMenu }: SceneElementListItemType) => {
  const onClickItem = useCallback(() => {
    onClick?.(item)
  }, [item, onClick])

  const [_, drag, preview] = useDrag(() => ({ type: ItemTypes.Prefab, item, multiple: false }))

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div onContextMenu={(event) => onContextMenu(event, item)}>
      <Tooltip title={item.label} placement="left" disableInteractive>
        <IconButton
          className={styles.element}
          disableRipple
          ref={drag}
          onClick={onClickItem}
          children={<item.Icon />}
        />
      </Tooltip>
    </div>
  )
}

export function ElementList() {
  const { t } = useTranslation()
  const [selectedItem, setSelectedItem] = React.useState<SceneElementType | null>(null)
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [{ isDragging }, dropRef] = useDrop({
    accept: [ItemTypes.Prefab],
    collect: (monitor) => ({ isDragging: monitor.getItem() !== null && monitor.canDrop() }),
    drop(item: SceneElementType, monitor) {
      const node = addSceneComponentElement(item)
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

    const node = addSceneComponentElement(selectedItem!)
    if (!node) return

    const transformComponent = getComponent(node, TransformComponent)
    if (transformComponent) getSpawnPositionAtCenter(transformComponent.position)
  }

  const placeObjectAtOrigin = () => {
    handleClose()

    addSceneComponentElement(selectedItem!)
  }

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>, item: SceneElementType) => {
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
    setSelectedItem(null)
    setAnchorEl(null)
    setAnchorPosition(undefined)
  }

  return (
    <>
      <div className={styles.elementListContainer}>
        {Object.entries(ComponentShelfCategories).map(([category, items]) => (
          <div className={styles.category} key={category}>
            <Typography variant="subtitle2" className={styles.categoryTitle}>
              {category}
            </Typography>
            {items.map((item) => (
              <SceneElementListItem
                key={item.name}
                item={{
                  componentName: item.name,
                  label: startCase((item.jsonID || item.name).replace('-', ' ').toLowerCase()),
                  Icon: EntityNodeEditor.get(item)?.iconComponent || PlaceHolderIcon,
                  type: ItemTypes.Prefab
                }}
                onClick={addSceneComponentElement}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        className={styles.elementDropZone}
        ref={dropRef}
        style={{ pointerEvents: isDragging ? 'auto' : 'none', border: isDragging ? '5px solid red' : 'none' }}
      />
      <ContextMenu open={open} anchorEl={anchorEl} anchorPosition={anchorPosition} onClose={handleClose}>
        <MenuItem onClick={placeObject}>{t('editor:layout.assetGrid.placeObject')}</MenuItem>
        <MenuItem onClick={placeObjectAtOrigin}>{t('editor:layout.assetGrid.placeObjectAtOrigin')}</MenuItem>
      </ContextMenu>
    </>
  )
}

export default ElementList
