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

import { FileThumbnailJobState } from '@ir-engine/client-core/src/common/services/FileThumbnailJobState'
import { useFind } from '@ir-engine/common'
import { StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import { twMerge } from 'tailwind-merge'
import { SupportedFileTypes } from '../../constants/AssetTypes'
import { EditorState } from '../../services/EditorServices'
import { FilesState, FilesViewModeState, SelectedFilesState } from '../../services/FilesState'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { FileContextMenu } from './contextmenu'
import FileItem, { TableWrapper } from './fileitem'
import {
  CurrentFilesQueryProvider,
  FILES_PAGE_LIMIT,
  canDropOnFileBrowser,
  useCurrentFiles,
  useFileBrowserDrop
} from './helpers'
import FilesLoaders from './loaders'
import FilesToolbar from './toolbar'

function Browser() {
  const [anchorEvent, setAnchorEvent] = useState<undefined | React.MouseEvent>(undefined)
  const dropOnFileBrowser = useFileBrowserDrop()
  const filesState = useMutableState(FilesState)
  const [{ isFileDropOver }, fileDropRef] = useDrop({
    accept: [...SupportedFileTypes],
    drop: (dropItem) => dropOnFileBrowser(dropItem as any),
    canDrop: () => canDropOnFileBrowser(filesState.selectedDirectory.value),
    collect: (monitor) => ({ isFileDropOver: monitor.canDrop() && monitor.isOver() })
  })
  const isListView = useMutableState(FilesViewModeState).viewMode.value === 'list'
  const selectedFiles = useMutableState(SelectedFilesState)
  const { files, refreshDirectory } = useCurrentFiles()
  const thumbnailJobState = useMutableState(FileThumbnailJobState)
  const { projectName } = useMutableState(FilesState)
  const staticResourceData = useHookstate<Record<string, Record<string, string>>>({})

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (columnKey) => {
    setSortConfig((prevConfig) => {
      const newDirection = prevConfig.key === columnKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
      return { key: columnKey, direction: newDirection }
    })
  }

  useEffect(() => {
    refreshDirectory()
  }, [thumbnailJobState.length])

  const staticResourceDataQuery = useFind(staticResourcePath, {
    query: {
      key: {
        $in: files.map((file) => file.key)
      },
      project: projectName.value,
      $select: ['key', 'userId', 'stats', 'createdAt'],
      $limit: FILES_PAGE_LIMIT
    }
  })

  useEffect(() => {
    if (staticResourceDataQuery.status !== 'success') return
    const additionalData: Record<string, Record<string, string>> = {}
    staticResourceDataQuery.data.forEach((data: StaticResourceType) => {
      additionalData[data.key] = {
        createdAt: new Date(data.createdAt).toLocaleString(),
        author: data.userId || 'iR Starter Content',
        statistics: Object.keys({ ...data.stats }).length ? JSON.stringify(data.stats) : ''
      }
    })
    staticResourceData.set(additionalData)
  }, [staticResourceDataQuery.status])

  const sortedFiles = React.useMemo(() => {
    if (!sortConfig.key) return files

    const sorted = [...files].sort(($a, $b) => {
      const additionalDataA = staticResourceData.value[$a?.key] || {}
      const additionalDataB = staticResourceData.value[$b?.key] || {}
      const a = { ...$a, ...additionalDataA }
      const b = { ...$b, ...additionalDataB }

      const { key, direction } = sortConfig
      let valueA: any = (key && a[key]) || ''
      let valueB: any = (key && b[key]) || ''

      if (key === 'createdAt') {
        valueA = new Date(valueA)
        valueB = new Date(valueB)
      } else if (key === 'size') {
        valueA = parseFloat(valueA) || 0
        valueB = parseFloat(valueB) || 0
      } else if (key === 'type' || key === 'author' || key === 'name' || key === 'statistics') {
        valueA = valueA.toString().toLowerCase()
        valueB = valueB.toString().toLowerCase()
      }

      if (valueA < valueB) return direction === 'asc' ? -1 : 1
      if (valueA > valueB) return direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [files, sortConfig, staticResourceData])

  const FileItems = () => (
    <>
      {sortedFiles.map((file, idx) => {
        const backgroundColor = idx % 2 === 0 ? '#111113' : '#191B1F'
        return (
          <FileItem
            file={{ ...file, ...staticResourceData.value[file?.key] }}
            onContextMenu={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (!selectedFiles.value.find((selectedFile) => selectedFile.key === file.key)) {
                selectedFiles.set([file])
              }
              setAnchorEvent(event)
            }}
            key={file.key}
            data-testid="files-panel-file-item"
            className={`${isListView ? `bg-[${backgroundColor}]` : ''}`}
          />
        )
      })}
    </>
  )

  return (
    <div
      className={twMerge('h-full overflow-y-scroll', isFileDropOver ? 'border-2 border-gray-300' : '')}
      ref={fileDropRef}
      onContextMenu={(event) => {
        event.preventDefault()
        event.stopPropagation()
        selectedFiles.set([])
        setAnchorEvent(event)
      }}
    >
      <div
        className={twMerge('mb-2 h-auto pb-6 text-gray-400 ', !isListView && 'flex py-8')}
        onClick={(event) => {
          event.stopPropagation()
          selectedFiles.set([])
          ClickPlacementState.resetSelectedAsset()
        }}
      >
        <div className={twMerge(!isListView && 'flex flex-wrap gap-2')}>
          {isListView ? (
            <TableWrapper handleSort={handleSort}>
              <FileItems />
            </TableWrapper>
          ) : (
            <FileItems />
          )}
        </div>
      </div>
      <FileContextMenu anchorEvent={anchorEvent} setAnchorEvent={setAnchorEvent} />
    </div>
  )
}

export default function FileBrowser() {
  const filesState = useMutableState(FilesState)

  const projectName = useMutableState(EditorState).projectName.value
  useEffect(() => {
    if (projectName) {
      filesState.merge({ selectedDirectory: `/projects/${projectName}/public/`, projectName: projectName })
    }
  }, [projectName])

  return (
    <CurrentFilesQueryProvider>
      <FilesToolbar />
      <FilesLoaders />
      <Browser />
    </CurrentFilesQueryProvider>
  )
}
