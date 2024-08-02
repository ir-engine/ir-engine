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
import { clone, debounce, isEmpty } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import {
  StaticResourceQuery,
  StaticResourceType,
  staticResourcePath
} from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { AssetsPanelCategories } from '@etherealengine/editor/src/components/assets/AssetsPanelCategories'
import { AssetSelectionChangePropsType } from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import { FilesViewModeSettings } from '@etherealengine/editor/src/components/assets/FileBrowser/FileBrowserState'
import { inputFileWithAddToScene } from '@etherealengine/editor/src/functions/assetFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { ClickPlacementState } from '@etherealengine/editor/src/systems/ClickPlacementSystem'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { NO_PROXY, State, getMutableState, getState, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { HiDotsVertical } from 'react-icons/hi'
import {
  HiMagnifyingGlass,
  HiMiniArrowLeft,
  HiMiniArrowPath,
  HiOutlineFolder,
  HiOutlinePlusCircle
} from 'react-icons/hi2'
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io'
import { twMerge } from 'tailwind-merge'
import Button from '../../../../../primitives/tailwind/Button'
import Input from '../../../../../primitives/tailwind/Input'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import { TablePagination } from '../../../../../primitives/tailwind/Table'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import { ContextMenu } from '../../../../tailwind/ContextMenu'
import DeleteFileModal from '../../Files/browserGrid/DeleteFileModal'
import { FileIcon } from '../../Files/icon'
import { AssetIconMap } from '../icons'

type Category = {
  name: string
  object: object
  collapsed: boolean
  isLeaf: boolean
  depth: number
}

const generateParentBreadcrumbCategories = (categories: readonly Category[], target: string) => {
  const findNestingCategories = (nestedCategory: Record<string, any>, parentCategory: string): Category[] => {
    for (const key in nestedCategory) {
      if (key === target) {
        const foundCategory = categories.find((c) => c.name === parentCategory)
        if (foundCategory) {
          return [foundCategory]
        }
        return []
      } else if (typeof nestedCategory[key] === 'object' && nestedCategory[key] !== null) {
        const nestedCategories = findNestingCategories(nestedCategory[key], key)
        if (nestedCategories.length) {
          return [categories.find((c) => c.name === parentCategory)!, ...nestedCategories]
        }
      }
    }
    return []
  }

  for (const category of categories) {
    const parentCategories = findNestingCategories(category.object, category.name)
    if (parentCategories.length) {
      return parentCategories
    }
  }

  return []
}

function mapCategoriesHelper(collapsedCategories: { [key: string]: boolean }) {
  const result: Category[] = []
  const generateCategories = (node: object, depth = 0) => {
    for (const key in node) {
      const isLeaf = Object.keys(node[key]).length === 0
      const category: Category = {
        name: key,
        object: node[key],
        collapsed: collapsedCategories[key] ?? true,
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
  return result
}

const ResourceFile = (props: {
  resource: StaticResourceType
  selected: boolean
  onClick: (props: AssetSelectionChangePropsType) => void
  onChange: () => void
}) => {
  const { t } = useTranslation()

  const userID = useMutableState(AuthState).user.id.value
  const { resource, selected, onClick, onChange } = props
  const [anchorEvent, setAnchorEvent] = React.useState<undefined | React.MouseEvent<HTMLDivElement>>(undefined)

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setAnchorEvent(event)
  }

  const assetType = AssetLoader.getAssetType(resource.key)
  const splitResourceKey = resource.key.split('/')
  const name = splitResourceKey.at(-1)!
  const path = splitResourceKey.slice(0, -1).join('/') + '/'

  const [_, drag, preview] = useDrag(() => ({
    type: assetType,
    item: {
      url: resource.url,
      type: assetType,
      multiple: false
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
        onClick({
          contentType: assetType,
          name,
          resourceUrl: resource.url,
          size: 'unknown size'
        })
      }
      onContextMenu={handleContextMenu}
      className="mb-3 flex h-auto w-40 cursor-pointer flex-col items-center text-center"
    >
      <span
        className={`mx-4 mt-2 h-40 w-40 font-['Figtree'] ${
          selected ? 'rounded-lg border border-blue-primary bg-theme-studio-surface' : ''
        }`}
      >
        <FileIcon thumbnailURL={resource.thumbnailURL} type={assetType} />
      </span>

      <Tooltip title={name}>
        <span className="line-clamp-1 w-full text-wrap break-all text-sm text-[#F5F5F5]">{name}</span>
      </Tooltip>

      <ContextMenu anchorEvent={anchorEvent} onClose={() => setAnchorEvent(undefined)} className="gap-1">
        <div className="w-full rounded-lg bg-theme-surface-main px-4 py-2 text-sm text-white">
          <MetadataTable
            rows={[
              { label: t('editor:assetMetadata.name'), value: `${name}` },
              { label: t('editor:assetMetadata.path'), value: `${path}` },
              { label: t('editor:assetMetadata.type'), value: `${resource.mimeType}` },
              { label: t('editor:assetMetadata.tags'), value: `${resource.tags || 'none'}` }
            ]}
          />
          {!!userID && userID === resource.userId && (
            <Button
              variant="outline"
              size="small"
              fullWidth
              onClick={() => {
                PopoverState.showPopupover(
                  <DeleteFileModal
                    files={[
                      {
                        key: resource.key,
                        path: resource.url,
                        name: resource.key,
                        fullName: name,
                        thumbnailURL: resource.thumbnailURL,
                        url: resource.url,
                        type: assetType,
                        isFolder: false
                      }
                    ]}
                    onComplete={(err?: unknown) => {
                      if (!err) {
                        onChange()
                      }
                    }}
                  />
                )
                setAnchorEvent(undefined)
              }}
            >
              {t('editor:layout.assetGrid.deleteAsset')}
            </Button>
          )}
          {/* TODO: add more actions (compressing images/models, editing tags, etc) here as desired  */}
        </div>
      </ContextMenu>
    </div>
  )
}

export const MenuDivider = () => {
  return <div className="my-2 flex w-full border-b border-theme-primary" />
}

interface MetadataTableProps {
  rows: MetadataTableRowProps[]
}

const MetadataTable: React.FC<MetadataTableProps> = ({ rows }) => (
  <table className="cursor-default select-text">
    <tbody>
      {rows.map((row, index) => (
        <MetadataTableRow key={index} label={row.label} value={row.value} />
      ))}
    </tbody>
  </table>
)

interface MetadataTableRowProps {
  label: string
  value: string
}

const MetadataTableRow: React.FC<MetadataTableRowProps> = ({ label, value }) => (
  <tr>
    <td className="font-semibold">{label}</td>
    <td
      className="cursor-default select-text pl-4"
      onContextMenu={(e) => {
        e.stopPropagation() // allow user to copy selected text
      }}
    >
      {value}
    </td>
  </tr>
)

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
    category: Category
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
  const fontSize = useHookstate(getMutableState(FilesViewModeSettings).list.fontSize).value

  return (
    <div
      className={twMerge(
        'flex h-9 cursor-pointer items-center gap-2 text-[#B2B5BD]',
        category.depth === 0 && !category.collapsed && 'mt-0',
        selectedCategory?.name === category.name && 'rounded bg-[#191B1F]'
      )}
      style={{ marginLeft: category.depth > 1 ? category.depth * 16 : 0 }}
      onClick={handleSelectCategory}
    >
      <Button
        variant="transparent"
        className={twMerge('m-0 p-0', category.isLeaf && 'invisible cursor-auto')}
        title={category.collapsed ? 'expand' : 'collapse'}
        startIcon={category.collapsed ? <IoIosArrowForward /> : <IoIosArrowDown />}
      />
      <AssetIconMap name={category.name} />
      <div className="flex w-full items-center gap-1 pr-2">
        <span
          className={twMerge(
            "flex flex-row items-center gap-2 font-['Figtree'] text-[#e7e7e7]",
            selectedCategory?.name === category.name && 'text-[#F5F5F5]'
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          {category.name}
        </span>
        {/* <HiEye className="flex flex-row items-center gap-2 ml-auto text-[#e7e7e7] text-sm" onClick={handlePreview} /> */}
      </div>
    </div>
  )
}

export function AssetsBreadcrumb({
  parentCategories,
  selectedCategory,
  onSelectCategory
}: {
  parentCategories: Category[]
  selectedCategory: Category | null
  onSelectCategory: (c: Category) => void
}) {
  return (
    <div className="flex h-[28px] items-center gap-2 rounded-[4px] border border-theme-input bg-[#141619] px-2 ">
      <HiOutlineFolder className="text-xs text-[#A3A3A3]" />
      {parentCategories.map((category) => (
        <span
          key={category.name}
          className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3] hover:underline"
          onClick={() => onSelectCategory(category)}
        >
          {category.name + ' > '}
        </span>
      ))}
      <span className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3]">
        {selectedCategory?.name}
      </span>
    </div>
  )
}

const CategoriesList = ({
  categories,
  selectedCategory,
  collapsedCategories,
  onSelectCategory,
  style
}: {
  categories: Category[]
  selectedCategory: Category | null
  collapsedCategories: State<{ [key: string]: boolean }>
  onSelectCategory: (category: Category) => void
  style: any
}) => {
  const savedScrollPosition = useRef<number>(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = savedScrollPosition.current
    }
  }, [categories, selectedCategory])

  const handleScroll = () => {
    if (listRef.current) {
      savedScrollPosition.current = listRef.current.scrollTop
    }
  }

  return (
    <div
      ref={listRef}
      className="mb-8 h-full overflow-x-hidden overflow-y-scroll bg-[#0E0F11] px-2 pb-8"
      style={style}
      onScroll={handleScroll}
    >
      {categories.map((category, index) => (
        <AssetCategory
          key={category.name + index}
          data={{
            categories: categories as Category[],
            selectedCategory: selectedCategory,
            onClick: (category: Category) => {
              onSelectCategory(category)
            },
            collapsedCategories,
            category
          }}
          index={index}
        />
      ))}
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
  const originalPath = useMutableState(EditorState).projectName.value
  const staticResourcesPagination = useHookstate({ totalPages: -1, currentPage: 0 })
  const assetsPreviewContext = useHookstate({ selectAssetURL: '' })
  const parentCategories = useHookstate<Category[]>([])

  const mapCategories = () => categories.set(mapCategoriesHelper(collapsedCategories.value))
  useEffect(mapCategories, [collapsedCategories])

  useEffect(() => {
    if (!selectedCategory.value?.name) return
    const parentCategoryBreadcrumbs = generateParentBreadcrumbCategories(categories.value, selectedCategory.value.name)
    parentCategories.set(parentCategoryBreadcrumbs)
  }, [categories, selectedCategory])

  const staticResourcesFindApi = () => {
    loading.set(true)
    searchTimeoutCancelRef.current?.()

    const debouncedSearchQuery = debounce(() => {
      const tags = selectedCategory.value
        ? [selectedCategory.value.name, ...iterativelyListTags(selectedCategory.value.object)]
        : []

      const query = {
        key: {
          $like: `%${searchText.value}%`
        },
        type: {
          $or: [{ type: 'asset' }]
        },
        tags: selectedCategory.value
          ? {
              $or: tags.flatMap((tag) => [
                { tags: { $like: `%${tag.toLowerCase()}%` } },
                { tags: { $like: `%${tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}%` } },
                {
                  tags: {
                    $like: `%${tag
                      .split(' ')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ')}%`
                  }
                }
              ])
            }
          : undefined,
        $sort: { mimeType: 1 },
        $skip: staticResourcesPagination.currentPage.value * 10
      } as StaticResourceQuery

      Engine.instance.api
        .service(staticResourcePath)
        .find({ query })
        .then((resources) => {
          searchedStaticResources.set(resources.data)
          staticResourcesPagination.merge({ totalPages: Math.ceil(resources.total / 10) })
        })
        .then(() => {
          loading.set(false)
        })
    }, 500)

    debouncedSearchQuery()
    searchTimeoutCancelRef.current = debouncedSearchQuery.cancel
  }

  //reset pagination when search text changes
  useEffect(() => {
    staticResourcesPagination.currentPage.set(0)
  }, [searchText])

  useEffect(() => {
    staticResourcesFindApi()
  }, [searchText, selectedCategory, staticResourcesPagination.currentPage])

  const ResourceItems = () => {
    if (loading.value) {
      return (
        <div className="flex w-full items-center justify-center">
          <LoadingView title={t('editor:loadingAssets')} fullSpace className="block h-12 w-12" />
        </div>
      )
    }
    return (
      <>
        {isEmpty(searchedStaticResources.value) && (
          <div className="col-start-2 flex h-full w-full items-center justify-center text-white">
            {t('editor:layout.scene-assets.no-search-results')}
          </div>
        )}
        {!isEmpty(searchedStaticResources.value) && (
          <>
            {searchedStaticResources.value.map((resource) => (
              <ResourceFile
                key={resource.id}
                resource={resource as StaticResourceType}
                selected={resource.url === assetsPreviewContext.selectAssetURL.value}
                onClick={(props: AssetSelectionChangePropsType) => {
                  assetsPreviewContext.selectAssetURL.set(props.resourceUrl)
                  ClickPlacementState.setSelectedAsset(props.resourceUrl)
                }}
                onChange={() => staticResourcesFindApi()}
              />
            ))}
          </>
        )}
      </>
    )
  }

  const handleBack = () => {
    if (!parentCategories.length) {
      selectedCategory.set(null)
      collapsedCategories.set({})
      return
    }
    handleSelectCategory(parentCategories.get(NO_PROXY).at(-1)!)
  }

  const handleRefresh = () => {
    categories.set([])
    collapsedCategories.set({})
    staticResourcesFindApi()
    mapCategories()
  }

  const handleSelectCategory = (category: Category) => {
    selectedCategory.set(clone(category))
    staticResourcesPagination.currentPage.set(0)
    !category.isLeaf && collapsedCategories[category.name].set(!category.collapsed)
  }

  const width = useHookstate(300)
  const mouseDown = useHookstate(false)

  const handleMouseDown = (event) => {
    event.preventDefault()
    mouseDown.set(true)
  }

  const handleMouseUp = () => {
    mouseDown.set(false)
  }

  const handleMouseMove = (event) => {
    if (mouseDown.value) {
      width.set(event.pageX)
    }
  }

  return (
    <>
      <div className="mb-1 flex h-8 items-center bg-theme-surface-main">
        <div className="mr-20 flex gap-2">
          <div className="pointer-events-auto flex items-center">
            <Tooltip title={t('editor:layout.filebrowser.back')} className="left-1">
              <Button variant="transparent" startIcon={<HiMiniArrowLeft />} className="p-0" onClick={handleBack} />
            </Tooltip>
          </div>

          <div className="flex items-center">
            <Tooltip title={t('editor:layout.filebrowser.refresh')}>
              <Button variant="transparent" startIcon={<HiMiniArrowPath />} className="p-0" onClick={handleRefresh} />
            </Tooltip>
          </div>

          {/* <div className="flex items-center">
            <Tooltip title={t('editor:layout.scene-assets.settings')}>
              <Button
                variant="transparent"
                startIcon={<HiOutlineCog6Tooth />}
                className="p-0"
                onClick={handleSettings}
              />
            </Tooltip>
          </div> */}
        </div>

        <div className="align-center flex h-7 flex-1 justify-center gap-2 pr-2">
          <div className="h-full flex-1">
            <AssetsBreadcrumb
              parentCategories={parentCategories.get(NO_PROXY) as Category[]}
              selectedCategory={selectedCategory.value}
              onSelectCategory={handleSelectCategory}
            />
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
          startIcon={<HiOutlinePlusCircle className="text-lg" />}
          variant="transparent"
          rounded="none"
          className="h-full whitespace-nowrap bg-[#375DAF] px-2"
          size="small"
          onClick={() =>
            inputFileWithAddToScene({
              projectName: originalPath as string,
              directoryPath: `projects/${originalPath}/assets/`
            })
              .then(handleRefresh)
              .catch((err) => {
                NotificationService.dispatchNotify(err.message, { variant: 'error' })
              })
          }
        >
          {t('editor:layout.filebrowser.uploadAssets')}
        </Button>
      </div>
      <div className="flex h-full w-full" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
        <CategoriesList
          categories={categories.value as Category[]}
          selectedCategory={selectedCategory.value}
          collapsedCategories={collapsedCategories}
          onSelectCategory={handleSelectCategory}
          style={{ width: width.value }}
        />
        <div className="flex w-[20px] cursor-pointer resize items-center">
          <HiDotsVertical onMouseDown={handleMouseDown} className="text-white" />
        </div>
        <div className="h-full w-full overflow-y-scroll">
          <div className="flex flex-wrap gap-2">
            <ResourceItems />
          </div>
          <div className="mx-auto mb-10">
            <TablePagination
              totalPages={staticResourcesPagination.totalPages.value}
              currentPage={staticResourcesPagination.currentPage.value}
              onPageChange={(newPage) => staticResourcesPagination.merge({ currentPage: newPage })}
            />
          </div>
        </div>
        {/* <div className="w-[200px] bg-[#222222] p-2">TODO: add preview functionality</div> */}
      </div>
    </>
  )
}

export default AssetPanel
