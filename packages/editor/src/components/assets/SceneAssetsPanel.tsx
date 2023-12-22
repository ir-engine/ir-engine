/* eslint-disable no-case-declarations */
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
import Inventory2Icon from '@mui/icons-material/Inventory2'
import { t } from 'i18next'
import { TabData } from 'rc-dock'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AssetClass } from '@etherealengine/engine/src/assets/enum/AssetClass'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { StaticResourceType, staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { CircularProgress } from '@mui/material'
import { debounce } from 'lodash'
import StringInput from '../inputs/StringInput'
import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import ImageNodeEditor from '../properties/ImageNodeEditor'
import ModelNodeEditor from '../properties/ModelNodeEditor'
import VideoNodeEditor from '../properties/VideoNodeEditor'
import styles from './styles.module.scss'

type FolderType = { folderType: 'folder'; assetClass: string }
type ResourceType = { folderType: 'staticResource' } & StaticResourceType

type CategorizedStaticResourceType = FolderType | ResourceType

const ResourceIcons = {
  [AssetClass.Model]: ModelNodeEditor.iconComponent,
  [AssetClass.Image]: ImageNodeEditor.iconComponent,
  [AssetClass.Video]: VideoNodeEditor.iconComponent
}

const StaticResourceItem = (props: {
  data: {
    resources: CategorizedStaticResourceType[]
    onClick: (resource: CategorizedStaticResourceType) => void
    selectedCategory: string | null
  }
  index: number
}) => {
  const { resources, onClick, selectedCategory } = props.data
  const index = props.index
  const resource = resources[index]

  if (resource.folderType === 'folder') {
    return (
      <div
        key={resource.folderType}
        className={`${styles.resourceItemContainer} ${selectedCategory === resource.assetClass ? styles.selected : ''}`}
        onClick={() => onClick(resource)}
      >
        {resource.assetClass}
      </div>
    )
  }
}

const ResourceFile = ({ resource }: { resource: StaticResourceType }) => {
  const ResourceIcon = ResourceIcons[AssetLoader.getAssetClass(resource.key)]
  return (
    <div
      key={resource.id}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: '10px'
      }}
    >
      <ResourceIcon style={{ marginBottom: '5px', height: '70px', width: '70px' }} />
      <span>{resource.key.split('/').at(-1)}</span>
    </div>
  )
}

const SceneAssetsPanel = () => {
  const { t } = useTranslation()
  const staticResources = useHookstate<CategorizedStaticResourceType[]>([])
  const categorizedStaticResources = useHookstate({} as Record<string, StaticResourceType[]>)
  const selectedCategory = useHookstate<string | null>(null)
  const loading = useHookstate(false)
  const searchText = useHookstate('')
  const searchTimeoutCancelRef = useRef<(() => void) | null>(null)
  const searchedStaticResources = useHookstate<StaticResourceType[]>([])

  useEffect(() => {
    const staticResourcesFindApi = () =>
      Engine.instance.api
        .service(staticResourcePath)
        .find({ query: { key: { $like: `%${searchText.value}%` || undefined }, $sort: { mimeType: 1 }, $limit: 100 } })
        .then((resources) => {
          if (searchText.value) {
            searchedStaticResources.set(resources.data)
            return
          }

          const categorizedResources: Record<string, StaticResourceType[]> = {}
          const categorizedResourcesList: CategorizedStaticResourceType[] = []

          let previousAssetClass: string | null = null

          resources.data.forEach((resource) => {
            const assetClass = AssetLoader.getAssetClass(resource.key)
            if (previousAssetClass !== assetClass) {
              categorizedResourcesList.push({ folderType: 'folder', assetClass })
              previousAssetClass = assetClass
              categorizedResources[previousAssetClass] = []
            }
            categorizedResources[previousAssetClass].push(resource)
            categorizedResourcesList.push({ folderType: 'staticResource', ...resource })
          })

          categorizedStaticResources.set(categorizedResources)
          staticResources.set(categorizedResourcesList)
        })
        .then(() => {
          loading.set(false)
        })

    loading.set(true)

    searchTimeoutCancelRef.current?.()
    const debouncedSearchQuery = debounce(staticResourcesFindApi, 500)
    debouncedSearchQuery()

    searchTimeoutCancelRef.current = debouncedSearchQuery.cancel

    return () => searchTimeoutCancelRef.current?.()
  }, [searchText])

  const ResourceList = useCallback(
    ({ height, width }) => (
      <FixedSizeList
        height={height}
        width={width}
        itemSize={32}
        itemCount={staticResources.length}
        itemData={{
          resources: staticResources.get(NO_PROXY),
          selectedCategory: selectedCategory.value,
          onClick: (resource: FolderType) => {
            selectedCategory.set(resource.assetClass)
            searchText.set('')
          }
        }}
        itemKey={(index) => index}
      >
        {StaticResourceItem}
      </FixedSizeList>
    ),
    [selectedCategory]
  )

  const ResourceItems = () => {
    if (loading.value) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </div>
      )
    }
    if (searchText.value) {
      if (staticResources.value)
        return (
          <>
            {searchedStaticResources.map((resource) => (
              <ResourceFile key={resource.value.id} resource={resource.get(NO_PROXY)} />
            ))}
          </>
        )
      return <div>{t('editor:layout.scene-assets.no-search-results')}</div>
    }
    if (selectedCategory.value) {
      return (
        <>
          {categorizedStaticResources.value[selectedCategory.value!]?.map((resource) => (
            <ResourceFile resource={resource} />
          ))}
        </>
      )
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {t('editor:layout.scene-assets.no-category')}
      </div>
    )
  }

  return (
    <div style={{ margin: '1rem auto', height: '100%', width: '100%' }}>
      <div className={styles.searchContainer}>
        <StringInput
          placeholder={t('editor:layout.scene-assets.search-placeholder')}
          value={searchText.value}
          onChange={(event) => searchText.set(event.target.value)}
        />
      </div>
      <div style={{ display: 'flex', height: '100%', width: '100%', margin: '1rem auto' }}>
        <div style={{ height: '100%', width: '50%' }}>
          <AutoSizer onResize={ResourceList}>{ResourceList}</AutoSizer>
        </div>
        <div
          style={{
            width: '50%',
            display: 'grid',
            gap: '40px 10px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gridAutoRows: '60px'
          }}
        >
          <ResourceItems />
        </div>
      </div>
    </div>
  )
}

export const SceneAssetsPanelTab: TabData = {
  id: 'sceneAssetsPanel',
  closable: true,
  cached: true,
  title: (
    <PanelDragContainer>
      <PanelIcon as={Inventory2Icon} size={12} />
      <PanelTitle>{t('editor:tabs.scene-assets')}</PanelTitle>
    </PanelDragContainer>
  ),
  content: <SceneAssetsPanel />
}

export default SceneAssetsPanel
