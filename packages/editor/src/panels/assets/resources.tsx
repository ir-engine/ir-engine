/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/
import {
  FileThumbnailJobState,
  removeFromFileThumbnailsSeen
} from '@ir-engine/client-core/src/common/services/FileThumbnailJobState'
import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import ProgressBar from '@ir-engine/client-core/src/systems/ui/LoadingDetailView/SimpleProgressBar'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { StaticResourceType } from '@ir-engine/common/src/schema.type.module'
import { AssetLoader } from '@ir-engine/engine/src/assets/classes/AssetLoader'
import { State, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Button, Tooltip } from '@ir-engine/ui'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import InfiniteScroll from '@ir-engine/ui/src/components/tailwind/InfiniteScroll'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { useEffect, useRef, useState } from 'react'
import { DragPreviewImage, useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { FileIcon } from '../files/fileicon'
import { FileUploadProgress } from '../files/loaders'
import DeleteFileModal from '../files/modals/DeleteFileModal'
import { AssetCategoryNode } from './categories'
import { ASSETS_PAGE_LIMIT, calculateItemsToFetch } from './helpers'
import { useAssetsCategory, useAssetsQuery } from './hooks'

interface MetadataTableRowProps {
  label: string
  value: string
}

const MetadataTable = ({ rows }: { rows: MetadataTableRowProps[] }) => (
  <table className="cursor-default select-text">
    <tbody>
      {rows.map((row, index) => (
        <MetadataTableRow key={index} label={row.label} value={row.value} />
      ))}
    </tbody>
  </table>
)

const MetadataTableRow = ({ label, value }: MetadataTableRowProps) => (
  <tr>
    <td className="font-semibold text-text-primary">{label}</td>
    <td
      className="cursor-default select-text pl-4 text-text-secondary"
      onContextMenu={(e) => {
        e.stopPropagation() // allow user to copy selected text
      }}
    >
      {value}
    </td>
  </tr>
)

function ResourceFileContextMenu({
  resource,
  anchorEvent
}: {
  resource: StaticResourceType
  anchorEvent: State<React.MouseEvent | undefined>
}) {
  const { t } = useTranslation()
  const userID = useMutableState(AuthState).user.id.value
  const { refetchResources, staticResourcesPagination } = useAssetsQuery()

  const splitResourceKey = resource.key.split('/')
  const name = resource.name || splitResourceKey.at(-1)!
  const path = splitResourceKey.slice(0, -1).join('/') + '/'
  const assetType = AssetLoader.getAssetType(resource.key)

  return (
    <ContextMenu
      anchorEvent={anchorEvent.value as React.MouseEvent}
      onClose={() => anchorEvent.set(undefined)}
      className="gap-1"
    >
      <div className="w-full rounded-lg border border-ui-outline bg-surface-2 px-4 py-2 text-sm">
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
            variant="tertiary"
            size="sm"
            fullWidth
            onClick={() => {
              ModalState.openModal(
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
                      removeFromFileThumbnailsSeen([resource.key])
                      refetchResources(true)
                    }
                  }}
                />
              )
              anchorEvent.set(undefined)
            }}
          >
            {t('editor:layout.assetGrid.deleteAsset')}
          </Button>
        )}
      </div>
    </ContextMenu>
  )
}

export function FileCard({
  item,
  name,
  onClick,
  onContextMenu,
  isSelected,
  info,
  dataTestIdJson,
  assetType,
  onDoubleClick,
  className,
  onLoad,
  onLoadStart
}) {
  const thumbnailURL = item.thumbnailURL
  return (
    <>
      <div
        key={item.id}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        className={twMerge(
          'max-h-38 w-30 group flex h-auto cursor-pointer flex-col items-center p-1.5 text-center ',
          className
        )}
        data-testid={dataTestIdJson?.fileItemId}
      >
        <div
          className={twMerge(
            `box-border h-20 w-16 rounded font-figtree text-sm`,
            isSelected ? 'rounded border border-[#375DAF] bg-[#2C2E30]' : 'group-hover:bg-[#202225]'
          )}
          data-testid={dataTestIdJson?.fileIconId}
        >
          <FileIcon
            thumbnailURL={thumbnailURL}
            type={assetType}
            isFolder={item?.isFolder}
            onLoad={onLoad}
            onLoadStart={onLoadStart}
          />
        </div>

        <Tooltip content={name} position="bottom">
          <Text
            theme="secondary"
            fontSize="sm"
            className={twMerge(
              'mt-2 w-24 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-text-secondary',
              isSelected ? 'rounded bg-ui-primary' : 'rounded group-hover:bg-ui-hover-background'
            )}
            data-testid={dataTestIdJson?.fileNameId}
          >
            {name}
          </Text>
        </Tooltip>
        <span className="text-xs text-[#375DAF]">{info}</span>
      </div>
    </>
  )
}

function ResourceFile({
  resource,
  onLoad,
  onLoadStart
}: {
  resource: StaticResourceType
  onLoad?: () => void
  onLoadStart?: () => void
}) {
  const anchorEvent = useHookstate<React.MouseEvent | undefined>(undefined)

  const assetType = AssetLoader.getAssetType(resource.key)
  const name = resource.name || resource.key.split('/').at(-1)!

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

  const isSelected = useMutableState(ClickPlacementState).selectedAsset.value === resource.url

  const handleLoad = () => {
    onLoad?.()
  }

  const handleLoadStart = () => {
    onLoadStart?.()
  }

  return (
    <div className="h-min">
      <DragPreviewImage connect={preview} src={resource.thumbnailURL || ''} />
      <div ref={drag}>
        <FileCard
          item={resource}
          name={name}
          onClick={() => ClickPlacementState.setSelectedAsset(resource.url)}
          onContextMenu={(event) => {
            event.preventDefault()
            event.stopPropagation()
            anchorEvent.set(event)
          }}
          isSelected={isSelected}
          info={resource.mimeType}
          assetType={assetType}
          dataTestIdJson={{
            fileIconId: 'assets-panel-resource-file-icon',
            fileNameId: 'assets-panel-resource-file-name',
            fileItemId: 'assets-panel-resource-file'
          }}
          onDoubleClick={() => {}}
          className="resource-file"
          onLoad={handleLoad}
          onLoadStart={handleLoadStart}
        />
      </div>
      <ResourceFileContextMenu resource={resource} anchorEvent={anchorEvent} />
    </div>
  )
}

function SideNavBar({ handleScrollToPage }) {
  const [navBarActivated, setNavBarActivated] = useState<boolean>(false) // Track the navbar activation
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null) // Track the hovered index
  const { resources, staticResourcesPagination } = useAssetsQuery()
  const pages = Math.ceil(resources.length / (ASSETS_PAGE_LIMIT + calculateItemsToFetch()))

  return (
    <div className="relative p-2">
      <div
        id="minimap-nav"
        className={twMerge(
          'duration-250 fixed ml-6 mt-1.5 flex w-6 flex-col items-end overflow-visible rounded-[4px] text-[10px] transition-[margin,padding]',
          navBarActivated ? 'py-2 pr-6' : 'py-2.5 pr-3'
        )}
        onMouseEnter={() => setNavBarActivated(true)}
        onMouseLeave={() => setNavBarActivated(false)}
      >
        {/* Sticky positioning */}
        {Array.from({ length: pages }, (_, i) => (
          <div
            key={i}
            className={twMerge(
              'nav-item duration-250 flex w-10 flex-row items-center justify-end gap-1 text-gray-500  transition-[padding]',
              navBarActivated ? 'h-auto' : 'h-3.5',
              hoveredIndex === i ? 'cursor-pointer py-1.5 first:pb-0 first:pt-1.5 last:pt-1.5' : 'py-0.5'
            )}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleScrollToPage(i)}
          >
            <span
              className={twMerge(
                'nav-handle duration-250 h-[1px] transition-[width]',
                hoveredIndex === null
                  ? 'bg-gray-400'
                  : i === (hoveredIndex + 1) % pages || i === (hoveredIndex - 1 + pages) % pages
                  ? 'bg-gray-700'
                  : 'bg-gray-400',
                hoveredIndex === i ? 'w-10 bg-white' : 'w-3'
              )}
            ></span>
            <span
              className={twMerge(
                'nav-id w-[1em] transition-opacity duration-500 ',
                navBarActivated ? 'opacity-100' : 'opacity-0',
                hoveredIndex === null
                  ? 'text-gray-400'
                  : i === (hoveredIndex + 1) % pages || i === (hoveredIndex - 1 + pages) % pages
                  ? 'text-gray-700'
                  : 'text-gray-400',
                hoveredIndex === i ? 'text-white' : ''
              )}
            >
              {i === 0
                ? '▲'
                : Math.min(
                    (i + 1) * (ASSETS_PAGE_LIMIT + calculateItemsToFetch()),
                    staticResourcesPagination.total.value
                  )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BottomPaginationNavBar({ handleScrollToPage }) {
  const { t } = useTranslation()
  const { resources, staticResourcesPagination } = useAssetsQuery()
  const totalPages = Math.ceil(staticResourcesPagination.total.value / (ASSETS_PAGE_LIMIT + calculateItemsToFetch()))
  const pages = Math.ceil(resources.length / (ASSETS_PAGE_LIMIT + calculateItemsToFetch()))

  return (
    <div className="flex h-20 flex-col items-center justify-center">
      <div className="text-[10px] text-text-secondary">
        {t('editor:layout.scene-assets.total-assets', { total: resources.length })}
      </div>
      <div className="m-3 flex h-[1px] w-36 flex-row gap-[0.19rem]">
        {Array.from({ length: totalPages }, (_, i) =>
          i > pages ? (
            <div key={i} className="h-[10px] w-1/4 border-t-[1px] border-solid border-gray-700"></div>
          ) : (
            <div
              key={i}
              className="duration-250 h-[10px] w-1/4 border-t-[1px] border-solid border-gray-400 transition-all hover:border-t-[10px]"
              onClick={() => handleScrollToPage(i)}
            />
          )
        )}
      </div>
    </div>
  )
}

function ResourceItems() {
  const { t } = useTranslation()
  const { resourcesLoading, resources, staticResourcesPagination, refetchResources } = useAssetsQuery()
  const { currentCategoryPath } = useAssetsCategory()
  const currentCategory = currentCategoryPath.get({ noproxy: true }) as AssetCategoryNode
  const pages = Math.ceil(resources.length / (ASSETS_PAGE_LIMIT + calculateItemsToFetch()))
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]) // Create a ref array
  const fileIconsLoaded = useHookstate(0)
  const fileIconsToLoad = useHookstate(0)

  const handleScrollToPage = (pageIndex: number) => {
    if (pageRefs.current[pageIndex]) {
      pageRefs.current[pageIndex]!.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const isStillLoadingIcons = fileIconsLoaded.value !== fileIconsToLoad.value

  const handleFileIconLoadStart = () => {
    fileIconsToLoad.set(fileIconsToLoad.get() + 1)
  }

  const handleFileIconLoad = () => {
    fileIconsLoaded.set(fileIconsLoaded.get() + 1)
  }

  const thumbnailJobState = useMutableState(FileThumbnailJobState)
  const debouncedRefetchResourcesRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(debouncedRefetchResourcesRef.current)
  }, [])

  useEffect(() => {
    if (debouncedRefetchResourcesRef) {
      clearTimeout(debouncedRefetchResourcesRef.current)
    }
    debouncedRefetchResourcesRef.current = setTimeout(() => {
      refetchResources()
    }, 500)
  }, [thumbnailJobState.jobs.length])

  useEffect(() => {
    fileIconsToLoad.set(0)
    fileIconsLoaded.set(0)
  }, [currentCategory?.path])

  return (
    <div className="relative flex w-full ">
      <div className="relative flex w-[95%] flex-col">
        <FileUploadProgress />{' '}
        {resources.length === 0 && !resourcesLoading && (
          <div className="col-start-2 flex h-full w-full items-center justify-center text-text-secondary">
            {t('editor:layout.scene-assets.no-search-results')}
          </div>
        )}
        {resources.length > 0 &&
          Array.from({ length: pages }, (_, i) => (
            <div key={i} ref={(el) => (pageRefs.current[i] = el)} className="flex w-full flex-col gap-2">
              <div className="mt-4 flex h-2.5 w-[calc(100%_-_16px)] flex-row border-t-[0.5px] border-solid border-[#42454D] pt-1 text-[smaller]">
                {i > 0 && (
                  <button
                    className="mr-auto flex items-center justify-center px-0 py-2 text-xs text-[#42454D]"
                    onClick={() => handleScrollToPage(i - 1)} // Scroll to the previous page
                  >
                    ▲ {t('editor:layout.scene-assets.previous')}
                  </button>
                )}
                <span className="ml-auto text-[#42454D]">
                  {i * (ASSETS_PAGE_LIMIT + calculateItemsToFetch()) + 1} -{' '}
                  {Math.min(
                    (i + 1) * (ASSETS_PAGE_LIMIT + calculateItemsToFetch()),
                    staticResourcesPagination.total.value
                  )}
                </span>
              </div>
              <div
                id="asset-items"
                className="relative mt-auto flex w-full flex-wrap gap-2"
                data-testid="assets-panel-resource-items"
              >
                {resources
                  .slice(
                    i * (ASSETS_PAGE_LIMIT + calculateItemsToFetch()),
                    (i + 1) * (ASSETS_PAGE_LIMIT + calculateItemsToFetch())
                  )
                  .map((resource, index) => (
                    <ResourceFile
                      onLoadStart={handleFileIconLoadStart}
                      onLoad={handleFileIconLoad}
                      key={resource.id}
                      resource={resource as StaticResourceType}
                    />
                  ))}
              </div>
            </div>
          ))}
        {!resourcesLoading && !isStillLoadingIcons && resources.length > 0 && (
          <BottomPaginationNavBar handleScrollToPage={handleScrollToPage} />
        )}
        {(resourcesLoading || isStillLoadingIcons) && (
          <div className="my-4 w-full">
            <div id="progress-container" xr-layer="true" xr-scalable="true" className="w-[350px] place-self-center ">
              <ProgressBar
                borderRadius="2px"
                bgColor={'#ffffff'}
                completed={(fileIconsLoaded.value / fileIconsToLoad.value) * 100}
                height="3px"
                baseBgColor="#2F3137"
                isLabelVisible={false}
              />
            </div>
            <div className="my-2 flex w-[350px] place-self-center text-sm text-white ">
              <div className="w-1/2 justify-center  text-left">Loading Assets</div>
              <div className="w-1/2 justify-center  text-right ">
                {fileIconsLoaded.value} of {fileIconsToLoad.value}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Sticky Mini Navbar */}
      <SideNavBar handleScrollToPage={handleScrollToPage} />
    </div>
  )
}

export default function Resources() {
  const { resourcesLoading, staticResourcesPagination, refetchResources } = useAssetsQuery()

  return (
    <div id="asset-panel" className="relative flex h-full w-full flex-col overflow-auto bg-surface-1">
      <InfiniteScroll
        disableEvent={staticResourcesPagination.skip.value >= staticResourcesPagination.total.value || resourcesLoading}
        onScrollBottom={() => {
          staticResourcesPagination.skip.set((prevSkip) => prevSkip + ASSETS_PAGE_LIMIT + calculateItemsToFetch())
          refetchResources()
        }}
      >
        <div
          className="relative mt-auto flex h-full w-full flex-wrap gap-2"
          data-testid="assets-panel-resource-items-container"
        >
          <ResourceItems />
        </div>
      </InfiniteScroll>
      <div className="mx-auto mb-10" />
    </div>
  )
}
