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
import React, { useRef } from 'react'
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
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import PlaceHolderIcon from '@mui/icons-material/GroupAddOutlined'
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { CameraSettingsComponent } from '@etherealengine/engine/src/scene/components/CameraSettingsComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { LinkComponent } from '@etherealengine/engine/src/scene/components/LinkComponent'
import { MountPointComponent } from '@etherealengine/engine/src/scene/components/MountPointComponent'
import { PostProcessingComponent } from '@etherealengine/engine/src/scene/components/PostProcessingComponent'
import { SceneDynamicLoadTagComponent } from '@etherealengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { ShadowComponent } from '@etherealengine/engine/src/scene/components/ShadowComponent'
import { TextComponent } from '@etherealengine/engine/src/scene/components/TextComponent'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'
import { PrimitiveGeometryComponent } from '../../../../engine/src/scene/components/PrimitiveGeometryComponent'
import { ItemTypes } from '../../constants/AssetTypes'
import { EntityNodeEditor } from '../../functions/ComponentEditors'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { SelectionState } from '../../services/SelectionServices'
import { usePopoverContextClose } from './PopoverContext'

export type SceneElementType = {
  componentJsonID: string
  label: string
  Icon: any
  type: typeof ItemTypes.Component
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
  Interaction: [SpawnPointComponent, PortalComponent, LinkComponent, MountPointComponent],
  Lighting: [
    AmbientLightComponent,
    PointLightComponent,
    SpotLightComponent,
    DirectionalLightComponent,
    HemisphereLightComponent
  ],
  FX: [LoopAnimationComponent, ShadowComponent, ParticleSystemComponent, EnvmapComponent, PostProcessingComponent],
  Scripting: [SystemComponent, BehaveGraphComponent],
  Misc: [
    EnvMapBakeComponent,
    CameraSettingsComponent,
    ScenePreviewCameraComponent,
    SkyboxComponent,
    SplineTrackComponent,
    SplineComponent,
    TextComponent
  ]
}

const ComponentListItem = ({ item }: { item: Component }) => {
  const { t } = useTranslation()
  const Icon = EntityNodeEditor.get(item)?.iconComponent || PlaceHolderIcon
  const handleClosePopover = usePopoverContextClose()

  return (
    <ListItemButton
      sx={{ pl: 4, bgcolor: 'var(--dockBackground)' }}
      onClick={() => {
        const nodes = getMutableState(SelectionState).selectedEntities.value
        EditorControlFunctions.addOrRemoveComponent(nodes, item, true)
        handleClosePopover()
      }}
    >
      <ListItemIcon style={{ color: 'var(--textColor)' }}>
        <Icon />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="subtitle1" color={'var(--textColor)'}>
            {startCase((item.jsonID || item.name).replace('-', ' ').toLowerCase())}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color={'var(--textColor)'}>
            {t(`editor:layout.assetGrid.component-detail.${item.jsonID}`)}
          </Typography>
        }
      />
    </ListItemButton>
  )
}

const SceneElementListItem = ({
  categoryTitle,
  categoryItems,
  isCollapsed
}: {
  categoryTitle: string
  categoryItems: Component[]
  isCollapsed: boolean
}) => {
  const open = useHookstate(categoryTitle === 'Misc')
  return (
    <>
      <ListItemButton
        onClick={() => open.set((prev) => !prev)}
        style={{
          backgroundColor: 'var(--dockBackground)',
          cursor: 'pointer',
          color: 'var(--textColor)',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <Typography>{categoryTitle}</Typography>
        <Icon type={isCollapsed || open.value ? 'KeyboardArrowUp' : 'KeyboardArrowDown'} />
      </ListItemButton>
      <Collapse in={isCollapsed || open.value} timeout={'auto'} unmountOnExit>
        <List component={'div'} sx={{ bgcolor: 'var(--dockBackground)', width: '100%' }} disablePadding>
          {categoryItems.map((item) => (
            <ComponentListItem key={item.jsonID || item.name} item={item} />
          ))}
        </List>
      </Collapse>
    </>
  )
}

const filterComponentShelfCategories = (search: string) => {
  if (!search) {
    return Object.entries(ComponentShelfCategories)
  }

  const searchRegExp = new RegExp(search, 'gi')

  return Object.entries(ComponentShelfCategories)
    .map(([category, items]) => {
      const filteredItems = items.filter((item) => item.name.match(searchRegExp)?.length)
      return [category, filteredItems] as [string, Component[]]
    })
    .filter(([_, items]) => !!items.length)
}

export function ElementList() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onSearch = (text: string) => {
    search.local.set(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      search.query.set(text)
    }, 50)
  }

  return (
    <List
      sx={{ width: 300, height: 600, bgcolor: 'var(--dockBackground)' }}
      subheader={
        <div style={{ padding: '0.5rem' }}>
          <Typography style={{ color: 'var(--textColor)', textAlign: 'center', textTransform: 'uppercase' }}>
            {t('editor:layout.assetGrid.components')}
          </Typography>
          <InputText
            placeholder={t('editor:layout.assetGrid.components-search')}
            value={search.local.value}
            sx={{ mt: 1 }}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      }
    >
      {filterComponentShelfCategories(search.query.value).map(([category, items]) => (
        <SceneElementListItem
          key={category}
          categoryTitle={category}
          categoryItems={items}
          isCollapsed={!!search.query.value}
        />
      ))}
    </List>
  )
}

export default ElementList
