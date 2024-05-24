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

import { staticResourcePath, StaticResourceType } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { AssetsPanelCategories } from '@etherealengine/editor/src/components/assets/AssetsPanelCategories'
import { AssetSelectionChangePropsType } from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { getState, NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import Input from '../../../../../primitives/tailwind/Input'
import { FileIcon } from '../../Files/icon'

type FolderType = { folderType: 'folder'; assetClass: string }
type ResourceType = { folderType: 'staticResource' } & StaticResourceType

type CategorizedStaticResourceType = FolderType | ResourceType

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

type Category = {
  name: string
  object: object
  collapsed: boolean
  isLeaf: boolean
  depth: number
}

function iterativelyListTags(obj: object): string[] {
  const tags: string[] = []
  for (const key in obj) {
    tags.push(key)
    if (typeof obj[key] === 'object') {
      tags.push(...iterativelyListTags(obj[key]))
    }
  }
  return tags
}

const AssetPanel = () => {
  const { t } = useTranslation()
  const collapsedCategories = useHookstate<{ [key: string]: boolean }>({})
  const categories = useHookstate<Category[]>([])
  const selectedCategory = useHookstate<Category | null>(null)
  const loading = useHookstate(false)
  const searchText = useHookstate('')
  const searchTimeoutCancelRef = useRef<(() => void) | null>(null)
  const searchedStaticResources = useHookstate<StaticResourceType[]>([])

  const AssetCategory = useCallback(
    (props: {
      data: {
        categories: Category[]
        onClick: (resource: Category) => void
        selectedCategory: Category | null
      }
      index: number
    }) => {
      const { categories, onClick, selectedCategory } = props.data
      const index = props.index
      const resource = categories[index]

      return (
        <div className={`flex items-center ml-${resource.depth}`}>
          {resource.isLeaf ? (
            <></>
          ) : (
            <div onClick={() => collapsedCategories[resource.name].set(!resource.collapsed)}>
              {resource.collapsed ? (
                <MdKeyboardArrowRight className="font-small text-white" />
              ) : (
                <MdKeyboardArrowDown className="font-small text-white" />
              )}
            </div>
          )}
          <div
            key={resource.name}
            className={twMerge(`p-2`, selectedCategory === resource ? 'bg-theme-primary text-grey' : 'text-white')}
            onClick={() => onClick(resource)}
          >
            <span className="dark:text-[#A3A3A3]">{resource.name}</span>
          </div>
        </div>
      )
    },
    []
  )

  const CategoriesList = () => {
    return (
      <div className="h-[100%] overflow-y-auto">
        {categories.map((category, index) => (
          <AssetCategory
            data={{
              categories: categories.value as Category[],
              selectedCategory: selectedCategory.value,
              onClick: (resource: Category) => {
                selectedCategory.set(JSON.parse(JSON.stringify(resource)))
              }
            }}
            index={index}
          />
        ))}
      </div>
    )
  }

  useEffect(() => {
    const result: Category[] = []
    const generateCategories = (node: object, depth = 0) => {
      for (const key in node) {
        const isLeaf = Object.keys(node[key]).length === 0
        const category = {
          name: key,
          object: node[key],
          collapsed: collapsedCategories[key].value ?? true,
          depth,
          isLeaf
        }
        result.push(category)
        if (typeof node[key] === 'object' && !category.collapsed) {
          generateCategories(node[key], depth + 1)
        }
      }
    }
    generateCategories(getState(AssetsPanelCategories))
    categories.set(result)
  }, [collapsedCategories])

  useEffect(() => {
    const staticResourcesFindApi = () => {
      const query = {
        key: { $like: `%${searchText.value}%` || undefined },
        $sort: { mimeType: 1 },
        $limit: 10000
      }

      if (selectedCategory.value) {
        const tags = [selectedCategory.value.name, ...iterativelyListTags(selectedCategory.value.object)]
        query['tags'] = {
          $or: tags.flatMap((tag) => [
            { tags: { $like: `%${tag.toLowerCase()}%` } },
            { tags: { $like: `%${tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}%` } }
          ])
        }
      }
      Engine.instance.api
        .service(staticResourcePath)
        .find({ query })
        .then((resources) => {
          searchedStaticResources.set(resources.data)
        })
        .then(() => {
          loading.set(false)
        })
    }

    loading.set(true)

    searchTimeoutCancelRef.current?.()
    const debouncedSearchQuery = debounce(staticResourcesFindApi, 500)
    debouncedSearchQuery()

    searchTimeoutCancelRef.current = debouncedSearchQuery.cancel

    return () => searchTimeoutCancelRef.current?.()
  }, [searchText, selectedCategory])

  const ResourceItems = () => {
    if (loading.value) {
      return (
        <div className="flex items-center justify-center">
          <CircularProgress />
        </div>
      )
    }
    if (searchedStaticResources.value)
      if (selectedCategory.value)
        return (
          <>
            {searchedStaticResources
              .filter((resource) => {
                const tags = [selectedCategory.value!.name, ...iterativelyListTags(selectedCategory.value!.object)]
                return tags.some((tag) => resource.tags.value?.map((x) => x.toLowerCase()).includes(tag.toLowerCase()))
              })
              .map((resource) => (
                <ResourceFile key={resource.value.id} resource={resource.get(NO_PROXY) as StaticResourceType} />
              ))}
          </>
        )
    return <div>{t('editor:layout.scene-assets.no-search-results')}</div>
  }

  return (
    <>
      <div className="bg-theme-surface-main mb-1 flex h-7" />
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
          <CategoriesList />
        </div>
        <div className="grid h-[100%] w-[75%] grid-cols-4 overflow-y-auto">
          <ResourceItems />
        </div>
      </div>
    </>
  )
}

export default AssetPanel
