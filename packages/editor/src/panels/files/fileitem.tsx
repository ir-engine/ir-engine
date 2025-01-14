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

import { usesCtrlKey } from '@ir-engine/common/src/utils/OperatingSystemFunctions.ts'
import {
  FilesState,
  FilesViewModeSettings,
  FilesViewModeState,
  SelectedFilesState
} from '@ir-engine/editor/src/services/FilesState'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Tooltip } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { MouseEventHandler, useEffect } from 'react'
import { ConnectDragSource, ConnectDropTarget, useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { IoIosArrowForward } from 'react-icons/io'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { VscBlank } from 'react-icons/vsc'
import { twMerge } from 'tailwind-merge'
import { FileDataType, SupportedFileTypes } from '../../constants/AssetTypes'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { FileIcon } from './fileicon'
import { availableTableColumns, canDropOnFileBrowser, useCurrentFiles, useFileBrowserDrop } from './helpers'

type DisplayTypeProps = {
  file: FileDataType & { [key: string]: unknown }
  onDoubleClick?: MouseEventHandler
  onClick?: MouseEventHandler
  isSelected: boolean
  drag: ConnectDragSource
  drop: ConnectDropTarget
  isOver: boolean
  onContextMenu: React.MouseEventHandler
  className?: string
}

export function TableWrapper({ children, handleSort }: { children: React.ReactNode; handleSort: any }) {
  const { t } = useTranslation()
  const selectedTableColumns = useHookstate(getMutableState(FilesViewModeSettings).list.selectedTableColumns).value

  return (
    <table className="w-full">
      <thead>
        <tr className="h-8 divide-x divide-[#42454D] border-b-[0.5px] border-[#42454D] bg-[#191B1F] text-left text-[#E7E7E7]">
          {availableTableColumns
            .filter((header) => selectedTableColumns[header])
            .map((header) => (
              <th
                key={header}
                onClick={() => handleSort(header)}
                className="table-cell p-2 text-xs font-normal dark:text-[#A3A3A3]"
              >
                <div className="flex items-center justify-between">
                  <span>{t(`editor:layout.filebrowser.table-list.headers.${header}`)}</span>
                  <MdKeyboardArrowDown />
                </div>
              </th>
            ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

function FileItemRow({
  file,
  onClick,
  onDoubleClick,
  isSelected,
  drag,
  drop,
  isOver,
  onContextMenu,
  className
}: DisplayTypeProps) {
  const filesViewModeSettings = useMutableState(FilesViewModeSettings)
  const selectedTableColumns = filesViewModeSettings.list.selectedTableColumns.value
  const fontSize = filesViewModeSettings.list.fontSize.value

  const thumbnailURL = file?.thumbnailURL

  const tableColumns = {
    name: (
      <span
        className="flex h-7 max-h-7 flex-row items-center gap-2 font-figtree text-[#e7e7e7]"
        style={{ fontSize: `${fontSize}px` }}
      >
        {file.isFolder ? <IoIosArrowForward /> : <VscBlank />}
        <FileIcon isMinified={true} thumbnailURL={thumbnailURL} type={file?.type} isFolder={file?.isFolder} />
        <span className="text-ellipsis text-nowrap">{file?.fullName}</span>
      </span>
    ),
    type: file?.type.toUpperCase(),
    author: (file?.author as string) || '',
    createdAt: (file?.createdAt as string) || '',
    statistics: (file?.statistics as string) || '',
    size: file?.size
  }

  return (
    <tr
      key={file?.key}
      ref={(ref) => drag(drop(ref))}
      className={twMerge(
        'h-9 rounded text-[#a3a3a3]',
        isOver && 'border-2 border-gray-400',
        className,
        !isSelected ? 'hover:bg-[#2F3137]' : 'bg-[#375DAF]'
      )}
      onContextMenu={onContextMenu}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid="files-panel-file-item"
    >
      {availableTableColumns
        .filter((header) => selectedTableColumns[header])
        .map((header, idx) => (
          <td key={idx} style={{ fontSize: `${fontSize}px` }} data-testid={`files-panel-file-item-${header}`}>
            {tableColumns[header]}
          </td>
        ))}
    </tr>
  )
}

function FileItemCard({
  file,
  onDoubleClick,
  onClick,
  isSelected,
  drag,
  drop,
  isOver,
  onContextMenu,
  className
}: DisplayTypeProps) {
  const iconSize = useHookstate(getMutableState(FilesViewModeSettings).icons.iconSize).value
  const thumbnailURL = file?.thumbnailURL

  return (
    <div
      ref={(ref) => drag(drop(ref))}
      className={twMerge('group box-border h-min', isOver && 'border-2 border-gray-400', className)}
      onContextMenu={onContextMenu}
    >
      <div
        className={twMerge('max-h-38 w-30 flex h-auto cursor-pointer flex-col items-center p-1.5 text-center')}
        onDoubleClick={file?.isFolder ? onDoubleClick : undefined}
        data-testid="files-panel-file-item"
        onClick={onClick}
      >
        <div
          className={twMerge(
            `box-border rounded border border-0 font-figtree`,
            isSelected ? 'border-2 border-[#375DAF] bg-[#2C2E30]' : 'group-hover:bg-[#202225]'
          )}
          style={{
            height: iconSize,
            width: iconSize,
            fontSize: iconSize
          }}
        >
          <FileIcon thumbnailURL={thumbnailURL} type={file?.type} isFolder={file?.isFolder} color="text-[#375DAF]" />
        </div>

        <Tooltip content={file?.fullName} position="bottom">
          <Text
            theme="secondary"
            fontSize="sm"
            className={twMerge(
              'mt-2 w-24 overflow-hidden text-ellipsis whitespace-nowrap px-2',
              isSelected ? 'rounded bg-[#375DAF]' : 'rounded group-hover:bg-[#2F3137]'
            )}
            data-testid="files-panel-file-item-name"
          >
            {file?.fullName}
          </Text>
        </Tooltip>
        <span className="text-xs text-[#375DAF]">{file?.size}</span>
      </div>
    </div>
  )
}

export default function FileItem({
  file,
  onContextMenu,
  className
}: {
  file: FileDataType
  onContextMenu: React.MouseEventHandler
  className?: string
}) {
  const filesViewMode = useMutableState(FilesViewModeState).viewMode
  const filesState = useMutableState(FilesState)
  const selectedFiles = useMutableState(SelectedFilesState)

  const isListView = filesViewMode.value === 'list'

  const { changeDirectoryByPath, files } = useCurrentFiles()
  const dropOnFileBrowser = useFileBrowserDrop()

  const [_dragProps, drag, preview] = useDrag(() => ({
    type: file.type,
    item: file,
    multiple: false
  }))

  const [{ isOver }, drop] = useDrop({
    accept: [...SupportedFileTypes],
    drop: (dropItem) =>
      dropOnFileBrowser(
        dropItem as any,
        file,
        selectedFiles.map((selectedFile) => selectedFile.key.value)
      ),
    canDrop: (dropItem: Record<string, unknown>) =>
      file.isFolder &&
      ('key' in dropItem || canDropOnFileBrowser(file.key)) &&
      !selectedFiles.find((selectedFile) => selectedFile.key.value === file.key),
    collect: (monitor) => ({
      isOver: monitor.canDrop() && monitor.isOver()
    })
  })

  useEffect(() => {
    if (preview) preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const handleSelectedFiles = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!files) return

    if (usesCtrlKey() ? event.ctrlKey : event.metaKey) {
      selectedFiles.set((prevSelectedFiles) =>
        prevSelectedFiles.includes(file)
          ? prevSelectedFiles.filter((prevFile) => prevFile.key !== file.key)
          : [...prevSelectedFiles, file]
      )
    } else if (event.shiftKey) {
      const lastIndex = files.findIndex((file) => file.key === selectedFiles.value.at(-1)?.key)
      const clickedIndex = files.findIndex((prevFile) => prevFile.key === file.key)
      const newSelectedFiles = files.slice(Math.min(lastIndex, clickedIndex), Math.max(lastIndex, clickedIndex) + 1)
      selectedFiles.merge(
        newSelectedFiles.filter((newFile) => !selectedFiles.value.some((file) => newFile.key === file.key))
      )
    } else {
      if (selectedFiles.value.some((prevFile) => prevFile.key === file.key)) {
        selectedFiles.set([])
      } else {
        selectedFiles.set([file])
      }
    }
  }

  const handleFileClick = (event: React.MouseEvent) => {
    if (file.isFolder && event.detail === 2) {
      const newPath = `${filesState.selectedDirectory.value}${file.name}/`
      changeDirectoryByPath(newPath)
    } else {
      ClickPlacementState.setSelectedAsset(file.url)
    }
  }

  const commonProps: DisplayTypeProps = {
    file,
    onClick: (event: React.MouseEvent) => {
      handleSelectedFiles(event)
      handleFileClick(event)
    },
    onDoubleClick: (event: React.MouseEvent) => {
      selectedFiles.set([])
      handleFileClick(event)
    },
    isSelected: selectedFiles.value.some((selectedFile) => selectedFile.key === file.key),
    drag,
    drop,
    isOver,
    onContextMenu,
    className
  }

  return isListView ? <FileItemRow {...commonProps} /> : <FileItemCard {...commonProps} />
}
