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
import React, { useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { FileIcon } from '../files/fileicon'
import DeleteFileModal from '../files/modals/DeleteFileModal'
import './assetPanel.css'
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

  return (
    <div
      key={resource.id}
      ref={drag}
      onClick={() => ClickPlacementState.setSelectedAsset(resource.url)}
      onContextMenu={(event) => {
        event.preventDefault()
        event.stopPropagation()
        anchorEvent.set(event)
      }}
      className={'mb-3 flex h-40 w-40 cursor-pointer flex-col items-center text-center' + 'resource-file'}
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
  )
}

function ResourceItems() {
  const { t } = useTranslation()
  const { resources } = useAssetsQuery()

  return (
    <>
      {resources.length === 0 && (
        <div className="col-start-2 flex h-full w-full items-center justify-center text-white">
          {t('editor:layout.scene-assets.no-search-results')}
        </div>
      )}
      {resources.length > 0 && (
        <>
          <div
            id="asset-items"
            className="relative mt-auto flex h-full w-full flex-wrap gap-2"
            data-testid="assets-panel-resource-items"
          >
            {resources.map((resource) => (
              <ResourceFile key={resource.id} resource={resource as StaticResourceType} />
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default function Resources() {
  const { resourcesLoading, staticResourcesPagination, refetchResources } = useAssetsQuery()

  return (
    <div id="asset-panel" className="flex h-full w-full flex-col overflow-auto">
      <InfiniteScroll
        disableEvent={staticResourcesPagination.skip.value >= staticResourcesPagination.total.value || resourcesLoading}
        onScrollBottom={() => {
          staticResourcesPagination.skip.set((prevSkip) => prevSkip + ASSETS_PAGE_LIMIT + calculateItemsToFetch())
          refetchResources()
        }}
      >
        <div className="mt-auto flex h-full w-full flex-wrap gap-2" data-testid="assets-panel-resource-items-container">
          <ResourceItems />
        </div>
        {resourcesLoading && <LoadingView spinnerOnly className="h-6 w-6" />}
      </InfiniteScroll>
      <div className="mx-auto mb-10" />
    </div>
  )
}
