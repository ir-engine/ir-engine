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
import { CircularProgress } from '@mui/material'
import { debounce } from 'lodash'
import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import { staticResourcePath, StaticResourceType } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { AssetSelectionChangePropsType } from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import Input from '../../../../../primitives/tailwind/Input'
import { FileIcon } from '../../Files/icon'

type FolderType = { folderType: 'folder'; assetClass: string }
type ResourceType = { folderType: 'staticResource' } & StaticResourceType

type CategorizedStaticResourceType = FolderType | ResourceType

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

  if (resource.folderType === 'folder' && resource.assetClass !== 'unknown') {
    return (
      <div key={resource.folderType} className="bg-theme-surface-main p-2 text-white" onClick={() => onClick(resource)}>
        {resource.assetClass}
      </div>
    )
  }
}

const AssetsPreviewContext = createContext({ onAssetSelectionChanged: (props: AssetSelectionChangePropsType) => {} })

const ResourceFile = ({ resource }: { resource: StaticResourceType }) => {
  const { onAssetSelectionChanged } = useContext(AssetsPreviewContext)

  const assetType = AssetLoader.getAssetType(resource.key)
  const [_, drag, preview] = useDrag(() => ({
    type: assetType,
    item: {
      url: resource.url
    },
    multiple: false
  }))

  useEffect(() => {
    if (preview) preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const fullName = resource.key.split('/').at(-1)!
  const name = fullName.length > 15 ? `${fullName.substring(0, 12)}...` : fullName

  return (
    <div
      ref={drag}
      key={resource.id}
      onClick={() =>
        onAssetSelectionChanged?.({
          contentType: assetType,
          name: fullName,
          resourceUrl: resource.url,
          size: 'unknown size'
        })
      }
      className="mt-[10px] flex cursor-pointer flex-col items-center  justify-center align-middle"
    >
      <span className="mb-[5px] h-[70px] w-[70px] text-[70px]">
        <FileIcon thumbnailURL={resource.thumbnailURL} type={assetType} />
      </span>
      <span className="text-white">{name}</span>
    </div>
  )
}

const AssetPanel = () => {
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

          resources.data.forEach((resource) => {
            const assetClass = AssetLoader.getAssetClass(resource.key)
            if (!(assetClass in categorizedResources)) {
              categorizedResourcesList.push({ folderType: 'folder', assetClass })
              categorizedResources[assetClass] = []
            }
            categorizedResources[assetClass].push(resource)
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
        itemSize={1}
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
              <ResourceFile key={resource.value.id} resource={resource.get(NO_PROXY) as StaticResourceType} />
            ))}
          </>
        )
      return <div>{t('editor:layout.scene-assets.no-search-results')}</div>
    }
    if (selectedCategory.value) {
      return (
        <>
          {categorizedStaticResources.value[selectedCategory.value!]?.map((resource) => (
            <ResourceFile resource={resource as StaticResourceType} />
          ))}
        </>
      )
    }
    return <div className="flex justify-center align-middle">{t('editor:layout.scene-assets.no-category')}</div>
  }

  return (
    <>
      <div className="bg-theme-surface-main mb-1 ml-1 flex h-7" />
      <div className="flex h-[100%] flex-row p-2">
        <div className="flex h-[100%] w-[25%] flex-col gap-2">
          <Input
            placeholder={t('editor:layout.filebrowser.search-placeholder')}
            value={searchText.value}
            onChange={(e) => {
              searchText.set(e.target.value)
            }}
            className="bg-theme-primary w-[100%] rounded"
            startComponent={<HiMagnifyingGlass className="text-white" />}
          />
          <AutoSizer onResize={ResourceList}>{ResourceList}</AutoSizer>
        </div>
        <div className="grid h-[100%] w-[75%] grid-cols-4 overflow-scroll">
          <ResourceItems />
        </div>
      </div>
    </>
  )
}

export default AssetPanel
