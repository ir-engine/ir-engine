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
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'

import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { Component } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
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
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@etherealengine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'
import { SpotLightComponent } from '@etherealengine/engine/src/scene/components/SpotLightComponent'
import { SystemComponent } from '@etherealengine/engine/src/scene/components/SystemComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import { NO_PROXY, useState } from '@etherealengine/hyperflux'

import MenuItem from '@etherealengine/ui/src/primitives/mui/MenuItem'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { GroupAddOutlined as PlaceHolderIcon } from '@mui/icons-material'
import { IconButton, PopoverPosition } from '@mui/material'

import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { LinkComponent } from '@etherealengine/engine/src/scene/components/LinkComponent'
import { PostProcessingComponent } from '@etherealengine/engine/src/scene/components/PostProcessingComponent'
import { SceneDynamicLoadTagComponent } from '@etherealengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { ShadowComponent } from '@etherealengine/engine/src/scene/components/ShadowComponent'
import { Vector3 } from 'three'
import { PrimitiveGeometryComponent } from '../../../../engine/src/scene/components/PrimitiveGeometryComponent'
import { ItemTypes } from '../../constants/AssetTypes'
import { EntityNodeEditor } from '../../functions/ComponentEditors'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { Button } from '../inputs/Button'
import StringInput from '../inputs/StringInput'
import { ContextMenu } from '../layout/ContextMenu'
import { InfoTooltip } from '../layout/Tooltip'
import styles from './styles.module.scss'

export type SceneElementType = {
  componentJsonID: string
  label: string
  Icon: any
  type: typeof ItemTypes.Component
}

type SceneElementListItemType = {
  item: SceneElementType
  onClick: (item: SceneElementType) => void
  onContextMenu: (event: React.MouseEvent<HTMLElement>, item: SceneElementType) => void
}

export const ComponentShelfCategories: Record<string, Component[]> = {
  Files: [ModelComponent, VolumetricComponent, PositionalAudioComponent, VideoComponent, ImageComponent],
  'Scene Composition': [
    PrimitiveGeometryComponent,
    GroundPlaneComponent,
    GroupComponent,
    ColliderComponent,
    VariantComponent,
    SceneDynamicLoadTagComponent
  ],
  Interaction: [SpawnPointComponent, PortalComponent, LinkComponent],
  Lighting: [
    AmbientLightComponent,
    PointLightComponent,
    SpotLightComponent,
    DirectionalLightComponent,
    HemisphereLightComponent
  ],
  FX: [LoopAnimationComponent, ShadowComponent, ParticleSystemComponent, EnvmapComponent, PostProcessingComponent],
  Scripting: [SystemComponent, BehaveGraphComponent],
  Misc: [EnvMapBakeComponent, ScenePreviewCameraComponent, SkyboxComponent, SplineTrackComponent, SplineComponent]
}

const SceneElementListItem = ({ item, onClick, onContextMenu }: SceneElementListItemType) => {
  const { t } = useTranslation()

  const onClickItem = useCallback(() => {
    onClick?.(item)
  }, [item, onClick])

  const [_, drag, preview] = useDrag(() => ({ type: ItemTypes.Component, item, multiple: false }))

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div onContextMenu={(event) => onContextMenu(event, item)}>
      <InfoTooltip
        title={item.label}
        info={t(`editor:layout.assetGrid.tooltip.${item.componentJsonID}`)}
        placement="left"
        disableInteractive
      >
        <IconButton
          className={styles.element}
          disableRipple
          ref={drag}
          onClick={onClickItem}
          children={<item.Icon />}
        />
      </InfoTooltip>
    </div>
  )
}

export function ElementList() {
  const { t } = useTranslation()
  const [selectedItem, setSelectedItem] = React.useState<SceneElementType | null>(null)
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const placeObject = () => {
    handleClose()

    const vec3 = new Vector3()
    getSpawnPositionAtCenter(vec3)

    EditorControlFunctions.createObjectFromSceneElement([
      { name: selectedItem!.componentJsonID, props: { position: vec3 } }
    ])
  }

  const placeObjectAtOrigin = () => {
    handleClose()

    EditorControlFunctions.createObjectFromSceneElement([{ name: selectedItem!.componentJsonID }])
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

  const searchBarState = useState<string>('')

  const validElements = useState(ComponentShelfCategories)

  useEffect(() => {
    const result: Record<string, Component[]> = {}
    console.log('searchBarState', searchBarState, searchBarState.value)
    if (searchBarState.value === '') {
      validElements.set(ComponentShelfCategories)
    } else {
      for (const [category, items] of Object.entries(ComponentShelfCategories)) {
        result[category] = items.filter((item) => item.name.toLowerCase().includes(searchBarState.value.toLowerCase()))
      }
      validElements.set(result)
    }
  }, [searchBarState])

  return (
    <>
      <div className={styles.elementListContainer}>
        <span className={styles.searchContainer}>
          <Button onClick={() => searchBarState.set('')}>x</Button>
          <StringInput
            value={searchBarState.value}
            onChange={(event) => searchBarState.set(event?.target.value)}
            placeholder={t('Search...')}
          />
        </span>

        {Object.entries(validElements.get(NO_PROXY)).map(([category, items]) => (
          <div className={styles.category} key={category}>
            {items.length > 0 && (
              <Typography variant="subtitle2" className={styles.categoryTitle}>
                {category}
              </Typography>
            )}
            {items.map((item) => (
              <SceneElementListItem
                key={item.jsonID}
                item={{
                  componentJsonID: item.jsonID!,
                  label: startCase((item.jsonID || item.name).replace('-', ' ').toLowerCase()),
                  Icon: EntityNodeEditor.get(item)?.iconComponent || PlaceHolderIcon,
                  type: ItemTypes.Component
                }}
                onClick={() => EditorControlFunctions.createObjectFromSceneElement([{ name: item.jsonID! }])}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
        ))}
      </div>
      <ContextMenu open={open} anchorEl={anchorEl} anchorPosition={anchorPosition} onClose={handleClose}>
        <MenuItem onClick={placeObject}>{t('editor:layout.assetGrid.placeObject')}</MenuItem>
        <MenuItem onClick={placeObjectAtOrigin}>{t('editor:layout.assetGrid.placeObjectAtOrigin')}</MenuItem>
      </ContextMenu>
    </>
  )
}

export default ElementList
