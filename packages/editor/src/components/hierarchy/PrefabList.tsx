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
import { GroundPlaneComponent } from '@etherealengine/engine/src/scene/components/GroundPlaneComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { SDFComponent } from '@etherealengine/engine/src/scene/components/SDFComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@etherealengine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { AmbientLightComponent } from '@etherealengine/spatial/src/renderer/components/AmbientLightComponent'
import { DirectionalLightComponent } from '@etherealengine/spatial/src/renderer/components/DirectionalLightComponent'
import { HemisphereLightComponent } from '@etherealengine/spatial/src/renderer/components/HemisphereLightComponent'
import { PointLightComponent } from '@etherealengine/spatial/src/renderer/components/PointLightComponent'
import { SpotLightComponent } from '@etherealengine/spatial/src/renderer/components/SpotLightComponent'

import PlaceHolderIcon from '@mui/icons-material/GroupAddOutlined'
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { CameraSettingsComponent } from '@etherealengine/engine/src/scene/components/CameraSettingsComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { LinkComponent } from '@etherealengine/engine/src/scene/components/LinkComponent'
import { MediaSettingsComponent } from '@etherealengine/engine/src/scene/components/MediaSettingsComponent'
import { MountPointComponent } from '@etherealengine/engine/src/scene/components/MountPointComponent'
import { PostProcessingComponent } from '@etherealengine/engine/src/scene/components/PostProcessingComponent'
import { RenderSettingsComponent } from '@etherealengine/engine/src/scene/components/RenderSettingsComponent'
import { SceneSettingsComponent } from '@etherealengine/engine/src/scene/components/SceneSettingsComponent'
import { ShadowComponent } from '@etherealengine/engine/src/scene/components/ShadowComponent'
import { TextComponent } from '@etherealengine/engine/src/scene/components/TextComponent'
import { ComponentJsonType } from '@etherealengine/engine/src/scene/types/SceneTypes'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { FogSettingsComponent } from '@etherealengine/spatial/src/renderer/components/FogSettingsComponent'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'
import { PrimitiveGeometryComponent } from '../../../../engine/src/scene/components/PrimitiveGeometryComponent'
import { ComponentEditorsState } from '../../functions/ComponentEditors'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { usePopoverContextClose } from '../element/PopoverContext'

export const PrefabShelfCategories = {
  Audio: [PositionalAudioComponent],
  Image: [ImageComponent],
  Ground: [GroundPlaneComponent],
  Shape: [PrimitiveGeometryComponent],
  Spawn: [SpawnPointComponent],
  Collider: [RigidBodyComponent, ColliderComponent],
  'Spot Light': [SpotLightComponent],
  'Ambient Light': [AmbientLightComponent],
  PointLight: [PointLightComponent],
  'Directional Light': [DirectionalLightComponent],
  'Hemisphere Light': [HemisphereLightComponent],
  '3D Text': [TextComponent],
  Model: [ModelComponent, VariantComponent, ShadowComponent, LoopAnimationComponent, EnvmapComponent],
  Video: [VideoComponent],
  Volumetric: [VolumetricComponent],
  Chair: [MountPointComponent],
  Link: [LinkComponent],
  Particles: [ParticleSystemComponent],
  Settings: [
    MediaSettingsComponent,
    RenderSettingsComponent,
    SceneSettingsComponent,
    CameraSettingsComponent,
    PostProcessingComponent,
    FogSettingsComponent,
    SkyboxComponent
  ],
  'Preview Camera': [ScenePreviewCameraComponent],
  Spline: [SplineTrackComponent, SplineComponent],
  'Effect Volume': [SDFComponent]
}
export const PrefabNameShelfCategoriesState = defineState({
  name: 'ee.editor.PrefabNameShelfCategories',
  initial: () => {
    return {
      Audio: ['Audio'],
      Image: ['Image'],
      Ground: ['Ground'],
      Shape: ['Shape'],
      Spawn: ['Spawn'],
      Collider: ['Collider'],
      Light: ['Spot Light', 'Ambient Light', 'Point Light', 'Directional Light', 'Hemisphere Light'],

      '3D Text': ['3D Text'],
      Model: ['Model'],
      Video: ['Video'],
      Volumetric: ['Volumetric'],
      Chair: ['Chair'],
      Link: ['Link'],
      Particles: ['Particles'],
      Settings: ['Settings'],
      'Preview Camera': ['Preview Camera'],
      Spline: ['Spline'],
      'Effect Volume': ['SDF']
    } as Record<string, string[]>
  }
})

const PrefabListItem = ({ item }: { item: string }) => {
  const { t } = useTranslation()
  const Icon = getState(ComponentEditorsState)[item]?.iconComponent ?? PlaceHolderIcon
  const handleClosePopover = usePopoverContextClose()
  return (
    <ListItemButton
      sx={{ pl: 4, bgcolor: 'var(--dockBackground)' }}
      onClick={() => {
        let componentJsons: ComponentJsonType[] = []
        PrefabShelfCategories[item].forEach((component) => {
          componentJsons.push({ name: component.jsonID })
        })
        // EditorControlFunctions.createObjectFromSceneElement([
        //   { name: PrefabShelfCategories[item][0].jsonID }

        // ])
        EditorControlFunctions.createObjectFromSceneElement(componentJsons)
        handleClosePopover()
      }}
    >
      <ListItemIcon style={{ color: 'var(--textColor)' }}>
        <Icon />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="subtitle1" color={'var(--textColor)'}>
            {startCase(item.replace('-', ' ').toLowerCase())}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color={'var(--textColor)'}>
            {t(`editor:layout.assetGrid.component-detail.${item}`)}
          </Typography>
        }
      />
    </ListItemButton>
  )
}
const ScenePrefabListItem = ({
  categoryTitle,
  categoryItems,
  isCollapsed
}: {
  categoryTitle: string
  categoryItems: string[]
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
            <PrefabListItem key={item} item={item} />
          ))}
        </List>
      </Collapse>
    </>
  )
}

const usePrefabNameShelfCategories = (search: string) => {
  useHookstate(getMutableState(PrefabNameShelfCategoriesState)).value

  if (!search) {
    return Object.entries(getState(PrefabNameShelfCategoriesState))
  }

  const searchRegExp = new RegExp(search, 'gi')

  return Object.entries(getState(PrefabNameShelfCategoriesState))
    .map(([category, items]) => {
      const filteredItems = items.filter((item) => item.match(searchRegExp)?.length)
      return [category, filteredItems] as [string, string[]]
    })
    .filter(([_, items]) => !!items.length)
}

export function PrefabList() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shelves = usePrefabNameShelfCategories(search.query.value)

  const onSearch = (text: string) => {
    search.local.set(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      search.query.set(text)
    }, 50)
  }

  return (
    <List
      sx={{ width: 300, height: 900, bgcolor: 'var(--dockBackground)' }}
      subheader={
        <div style={{ padding: '0.5rem' }}>
          <Typography style={{ color: 'var(--textColor)', textAlign: 'center', textTransform: 'uppercase' }}>
            {t('editor:layout.assetGrid.prefab')}
          </Typography>
          <InputText
            placeholder={t('editor:layout.assetGrid.prefab-search')}
            value={search.local.value}
            sx={{ mt: 1 }}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      }
    >
      {shelves.map(([category, items]) => (
        <ScenePrefabListItem
          key={category}
          categoryTitle={category}
          categoryItems={items}
          isCollapsed={!!search.query.value}
        />
      ))}
    </List>
  )
}

export default PrefabList
