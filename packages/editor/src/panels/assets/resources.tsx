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

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { StaticResourceType } from '@ir-engine/common/src/schema.type.module'
import { AssetLoader } from '@ir-engine/engine/src/assets/classes/AssetLoader'
import { State, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import InfiniteScroll from '@ir-engine/ui/src/components/tailwind/InfiniteScroll'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React, { useEffect, useRef, useState } from 'react'
import { DragPreviewImage, useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { FileIcon } from '../files/fileicon'
import DeleteFileModal from '../files/modals/DeleteFileModal'
import { ASSETS_PAGE_LIMIT, calculateItemsToFetch } from './helpers'
import { useAssetsQuery } from './hooks'

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

function ResourceFileContextMenu({
  resource,
  anchorEvent
}: {
  resource: StaticResourceType
  anchorEvent: State<React.MouseEvent | undefined>
}) {
  const { t } = useTranslation()
  const userID = useMutableState(AuthState).user.id.value
  const { refetchResources } = useAssetsQuery()

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
                      refetchResources()
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

function ResourceFile({ resource }: { resource: StaticResourceType }) {
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

  return (
    <>
      <DragPreviewImage connect={preview} src={resource.thumbnailURL || ''} />
      <div
        key={resource.id}
        ref={drag}
        onClick={() => ClickPlacementState.setSelectedAsset(resource.url)}
        onContextMenu={(event) => {
          event.preventDefault()
          event.stopPropagation()
          anchorEvent.set(event)
        }}
        className={twMerge(
          'resource-file mb-3 flex h-40 w-40 cursor-pointer flex-col items-center text-center',
          isSelected && 'rounded bg-[#212226]'
        )}
        data-testid="assets-panel-resource-file"
      >
        <div
          className={twMerge(
            'mx-auto mt-2 flex h-full w-28 items-center justify-center',
            'max-h-40 min-h-20 min-w-20 max-w-40'
          )}
          data-testid="assets-panel-resource-file-icon"
        >
          <FileIcon thumbnailURL={resource.thumbnailURL} type={assetType} />
        </div>

        <Tooltip content={name}>
          <span
            className="line-clamp-2 w-full text-wrap break-all text-sm text-[#F5F5F5]"
            data-testid="assets-panel-resource-file-name"
          >
            {name}
          </span>
        </Tooltip>

        <ResourceFileContextMenu resource={resource} anchorEvent={anchorEvent} />
      </div>
    </>
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
          navBarActivated ? 'py-2 pr-6' : 'p-0.5 pr-1'
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
              navBarActivated ? 'h-auto' : 'h-2',
              hoveredIndex === i ? 'cursor-pointer py-1.5 first:pb-0 first:pt-1.5 last:pt-1.5' : 'py-0.5',
              ''
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
  const { resources, staticResourcesPagination } = useAssetsQuery()
  const totalPages = Math.ceil(staticResourcesPagination.total.value / (ASSETS_PAGE_LIMIT + calculateItemsToFetch()))
  const pages = Math.ceil(resources.length / (ASSETS_PAGE_LIMIT + calculateItemsToFetch()))

  return (
    <div className="flex h-20 flex-col items-center justify-center">
      <div className="text-[10px] text-white">
        Showing <span>{resources.length}</span> of {staticResourcesPagination.total.value}
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
            ></div>
          )
        )}
      </div>
    </div>
  )
}

function ResourceItems() {
  const { t } = useTranslation()
  const { resources, staticResourcesPagination } = useAssetsQuery()
  const pages = Math.ceil(resources.length / (ASSETS_PAGE_LIMIT + calculateItemsToFetch()))
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]) // Create a ref array

  const handleScrollToPage = (pageIndex: number) => {
    if (pageRefs.current[pageIndex]) {
      pageRefs.current[pageIndex]!.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="relative flex w-full ">
      <div className="relative flex w-[95%] flex-col">
        {' '}
        {resources.length === 0 && (
          <div className="col-start-2 flex h-full w-full items-center justify-center text-white">
            {t('editor:layout.scene-assets.no-search-results')}
          </div>
        )}
        {resources.length > 0 &&
          Array.from({ length: pages }, (_, i) => (
            <div key={i} ref={(el) => (pageRefs.current[i] = el)} className="flex w-full flex-col gap-2">
              <div className="mt-4 flex h-2.5 w-[calc(100%_-_16px)] flex-row border-t-[0.5px] border-solid pt-1 text-[smaller] text-gray-500">
                {i > 0 && (
                  <Button
                    className="text-grey-500 mr-auto text-xs"
                    size="small"
                    variant="transparent"
                    onClick={() => handleScrollToPage(i - 1)} // Scroll to the previous page
                  >
                    {'Previous'}
                  </Button>
                )}
                <span className="ml-auto">
                  {i * (ASSETS_PAGE_LIMIT + calculateItemsToFetch()) + 1} -{' '}
                  {Math.min(
                    (i + 1) * (ASSETS_PAGE_LIMIT + calculateItemsToFetch()),
                    staticResourcesPagination.total.value
                  )}{' '}
                  of {staticResourcesPagination.total.value}
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
                    <ResourceFile key={index} resource={resource as StaticResourceType} />
                  ))}
              </div>
            </div>
          ))}
        <BottomPaginationNavBar handleScrollToPage={handleScrollToPage} />
      </div>
      {/* Sticky Mini Navbar */}
      <SideNavBar handleScrollToPage={handleScrollToPage} />
    </div>
  )
}

export default function Resources() {
  const { resourcesLoading, staticResourcesPagination, refetchResources } = useAssetsQuery()

  return (
    <div id="asset-panel" className="relative flex h-full w-full flex-col overflow-auto">
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
        {resourcesLoading && <LoadingView spinnerOnly className="h-6 w-6" />}
      </InfiniteScroll>
      <div className="mx-auto mb-10" />
    </div>
  )
}
