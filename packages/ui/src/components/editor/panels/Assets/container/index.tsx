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
import { clone, debounce, isEmpty, last } from 'lodash'
import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { staticResourcePath, StaticResourceType } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { AssetsPanelCategories } from '@etherealengine/editor/src/components/assets/AssetsPanelCategories'
import { AssetSelectionChangePropsType } from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { getState, State, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import {
  HiChevronDown,
  HiChevronRight,
  HiEye,
  HiMagnifyingGlass,
  HiMiniArrowLeft,
  HiMiniArrowPath,
  HiOutlineCog6Tooth,
  HiOutlineFolder,
  HiOutlinePlusCircle
} from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'
import Button from '../../../../../primitives/tailwind/Button'
import Input from '../../../../../primitives/tailwind/Input'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import Text from '../../../../../primitives/tailwind/Text'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import { FileIcon } from '../../Files/icon'

type Category = {
  name: string
  object: object
  collapsed: boolean
  isLeaf: boolean
  depth: number
}
const AssetsPreviewContext = createContext({ onAssetSelectionChanged: (props: AssetSelectionChangePropsType) => {} })

const generateAssetsBreadcrumb = (categories: Category[], target: string) => {
  let path: string[] = []

  function findCategory(category: any, currentPath: string[]) {
    for (const key in category) {
      if (key === target) {
        path = currentPath.concat(key)
        return true
      }
      if (
        typeof category[key] === 'object' &&
        category[key] !== null &&
        findCategory(category[key], currentPath.concat(key))
      ) {
        return true
      }
    }
    return false
  }

  for (const category of categories) {
    if (findCategory(category.object, [category.name])) {
      return path
    }
  }

  return categories.filter(({ name }) => name === target).map(({ name }) => name)
}

const ResourceFile = ({ resource }: { resource: StaticResourceType }) => {
  const { onAssetSelectionChanged } = useContext(AssetsPreviewContext)

  const assetType = AssetLoader.getAssetType(resource.key)
  const name = resource.key.split('/').at(-1)!

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

  return (
    <div
      key={resource.id}
      ref={drag}
      onClick={() =>
        onAssetSelectionChanged?.({
          contentType: assetType,
          name,
          resourceUrl: resource.url,
          size: 'unknown size'
        })
      }
      className="mt-[10px] flex cursor-pointer flex-col items-center justify-center align-middle"
    >
      <span className="mb-[5px] h-[70px] w-[70px] text-[70px]">
        <FileIcon thumbnailURL={resource.thumbnailURL} type={assetType} />
      </span>
      <span className="w-[100px] overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-white">{name}</span>
    </div>
  )
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

const AssetCategory = (props: {
  data: {
    categories: Category[]
    onClick: (category: Category) => void
    selectedCategory: Category | null
    collapsedCategories: State<{ [key: string]: boolean }>
  }
  index: number
}) => {
  const { categories, onClick, selectedCategory, collapsedCategories } = props.data
  const index = props.index
  const category = categories[index]

  const handleSelectCategory = () => {
    onClick(category)
    !category.isLeaf && collapsedCategories[category.name].set(!category.collapsed)
  }

  const handlePreview = () => {
    // TODO: add preview functionality
  }

  return (
    <div
      className={twMerge(
        'flex cursor-pointer items-center gap-2',
        category.depth === 0 && !category.collapsed && 'mt-4'
      )}
      style={{ marginLeft: category.depth * 16 }}
      onClick={handleSelectCategory}
    >
      <Button
        variant="transparent"
        className={twMerge('m-0 p-0', category.isLeaf && 'invisible cursor-auto')}
        title={category.collapsed ? 'expand' : 'collapse'}
        startIcon={category.collapsed ? <HiChevronRight /> : <HiChevronDown />}
      />
      <div className="flex w-full items-center gap-1 pr-2">
        <Text className={twMerge('text-[#B2B5BD]', selectedCategory?.name === category.name && 'font-bold')}>
          {category.name}
        </Text>
        <HiEye className="ml-auto text-[#B2B5BD]" onClick={handlePreview} />
      </div>
    </div>
  )
}

type AssetsBreadcrumbProps = {
  path: string
}
export function AssetsBreadcrumb({ path }: AssetsBreadcrumbProps) {
  return (
    <div className="flex h-[28px] items-center gap-2 rounded-[4px] border border-[#42454D] bg-[#141619] px-2 ">
      <HiOutlineFolder className="text-xs text-[#A3A3A3]" />
      <span
        className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3]"
        style={{ direction: 'rtl' }}
      >
        {path}
      </span>
    </div>
  )
}

const AssetPanel = () => {
  const { t } = useTranslation()
  const searchTimeoutCancelRef = useRef<(() => void) | null>(null)
  const collapsedCategories = useHookstate<{ [key: string]: boolean }>({})
  const categories = useHookstate<Category[]>([])
  const selectedCategory = useHookstate<Category | null>(null)
  const loading = useHookstate(false)
  const searchedStaticResources = useHookstate<StaticResourceType[]>([])
  const searchText = useHookstate('')
  const breadcrumbPath = useHookstate('')
  const { projectName } = useMutableState(EditorState)

  const CategoriesList = () => {
    return (
      <div className="mb-8 h-[100%] w-[200px] overflow-y-auto bg-[#0E0F11] pb-8">
        {categories.map((category, index) => (
          <AssetCategory
            key={category.name.value}
            data={{
              categories: categories.value as Category[],
              selectedCategory: selectedCategory.value,
              onClick: (category: Category) => {
                selectedCategory.set(clone(category))
              },
              collapsedCategories
            }}
            index={index}
          />
        ))}
      </div>
    )
  }

  const mapCategories = () => {
    const result: Category[] = []
    const generateCategories = (node: object, depth = 0) => {
      for (const key in node) {
        const isLeaf = Object.keys(node[key]).length === 0
        const category: Category = {
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
  }

  useEffect(mapCategories, [collapsedCategories])

  useEffect(() => {
    const assetsBreadcrumb = generateAssetsBreadcrumb(
      categories.value as Category[],
      selectedCategory.value?.name as string
    )?.join(' > ')
    breadcrumbPath.set(assetsBreadcrumb)
  }, [categories, selectedCategory])

  useEffect(() => {
    const staticResourcesFindApi = () => {
      const query = {
        key: {
          $like: `%${searchText.value}%` || undefined
        },
        project: projectName.value!,
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
          <LoadingView className="h-4 w-4" spinnerOnly />
        </div>
      )
    }
    return (
      <>
        {isEmpty(searchedStaticResources.value) && (
          <div className="h-full w-full justify-center text-white">
            {t('editor:layout.scene-assets.no-search-results')}
          </div>
        )}
        {!isEmpty(searchedStaticResources.value) && (
          <>
            {searchedStaticResources.value.map((resource) => (
              <ResourceFile key={resource.id} resource={resource as StaticResourceType} />
            ))}
          </>
        )}
      </>
    )
  }

  const handleBack = () => {
    if (isEmpty(breadcrumbPath.value)) {
      return
    }

    const paths: string[] = breadcrumbPath.value
      .split('>')
      .slice(0, -1)
      .map((item) => item.trim())

    if (isEmpty(paths)) {
      selectedCategory.set(null)
      collapsedCategories.set({})
      return
    }
    const selected = categories?.find((category) => category.name.value === last(paths))
    selectedCategory.set(clone(selected?.value) as Category)
  }

  const handleRefresh = () => {
    categories.set([])
    selectedCategory.set(null)
    collapsedCategories.set({})
    mapCategories()
  }

  const handleSettings = () => {
    // TODO: add settings functionality
  }

  const handleUpdateAsset = () => {
    // TODO: add upload asset functionality
  }

  return (
    <>
      <div className="mb-1 flex h-8 items-center bg-theme-surface-main">
        <div className="mr-20 flex gap-2">
          <div id="back" className="pointer-events-auto flex items-center">
            <Tooltip title={t('editor:layout.filebrowser.back')} direction="bottom" className="left-1">
              <Button variant="transparent" startIcon={<HiMiniArrowLeft />} className="p-0" onClick={handleBack} />
            </Tooltip>
          </div>

          <div id="refresh" className="flex items-center">
            <Tooltip title={t('editor:layout.filebrowser.refresh')} direction="bottom">
              <Button variant="transparent" startIcon={<HiMiniArrowPath />} className="p-0" onClick={handleRefresh} />
            </Tooltip>
          </div>

          <div id="settings" className="flex items-center">
            <Tooltip title={t('editor:layout.scene-assets.settings')} direction="bottom">
              <Button
                variant="transparent"
                startIcon={<HiOutlineCog6Tooth />}
                className="p-0"
                onClick={handleSettings}
              />
            </Tooltip>
          </div>
        </div>

        <div className="align-center flex h-7 flex-1 justify-center gap-2 pr-2">
          <div className="h-full flex-1">
            <AssetsBreadcrumb path={breadcrumbPath.value} />
          </div>
          <Input
            placeholder={t('editor:layout.scene-assets.search-placeholder')}
            value={searchText.value}
            onChange={(e) => {
              searchText.set(e.target.value)
            }}
            labelClassname="text-sm text-red-500"
            containerClassname="flex h-full bg-theme-primary rounded w-auto"
            className="h-7 rounded-[4px] bg-theme-primary py-0 text-xs text-[#A3A3A3] placeholder:text-[#A3A3A3] focus-visible:ring-0"
            startComponent={<HiMagnifyingGlass className="h-[14px] w-[14px] text-[#A3A3A3]" />}
          />
        </div>

        <Button
          id="uploadAssets"
          startIcon={<HiOutlinePlusCircle className="text-lg" />}
          variant="transparent"
          rounded="none"
          className="h-full whitespace-nowrap bg-[#375DAF] px-2"
          size="small"
          onClick={handleUpdateAsset}
        >
          {t('editor:layout.filebrowser.uploadAssets')}
        </Button>
      </div>
      <div className="flex h-full">
        <CategoriesList />
        <div className="grid flex-1 grid-cols-3 gap-2 overflow-auto p-2">
          <ResourceItems />
        </div>
        {/* <div className="w-[200px] bg-[#222222] p-2">TODO: add preview functionality</div> */}
      </div>
    </>
  )
}

export default AssetPanel
