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
  FilesState,
  FilesViewModeSettings,
  FilesViewModeState,
  SelectedFilesState
} from '@ir-engine/editor/src/services/FilesState'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React, { MouseEventHandler, useEffect } from 'react'
import { ConnectDragSource, ConnectDropTarget, useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { IoIosArrowForward } from 'react-icons/io'
import { VscBlank } from 'react-icons/vsc'
import { twMerge } from 'tailwind-merge'
import { SupportedFileTypes } from '../../constants/AssetTypes'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { FileContextMenu } from './contextmenu'
import { FileIcon } from './fileicon'
import {
  FileDataType,
  availableTableColumns,
  canDropOnFileBrowser,
  useCurrentFiles,
  useFileBrowserDrop
} from './helpers'

type DisplayTypeProps = {
  file: FileDataType
  onDoubleClick?: MouseEventHandler
  onClick?: MouseEventHandler
  isSelected: boolean
  onContextMenu: React.MouseEventHandler
}

/* todo - implement table view */
function TableView({
  file,
  onContextMenu,
  onClick,
  onDoubleClick,
  modifiedDate,
  drop,
  isOver,
  drag,
  projectName
}: {
  file: FileDataType
  onContextMenu: React.MouseEventHandler
  onClick?: MouseEventHandler<HTMLDivElement>
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  modifiedDate?: string
  drop?: ConnectDropTarget
  isOver: boolean
  drag?: ConnectDragSource
  projectName: string
}) {
  const selectedTableColumns = useHookstate(getMutableState(FilesViewModeSettings).list.selectedTableColumns).value
  const fontSize = useHookstate(getMutableState(FilesViewModeSettings).list.fontSize).value
  const dragFn = drag ?? ((input) => input)
  const dropFn = drop ?? ((input) => input)

  const thumbnailURL = file.thumbnailURL

  const tableColumns = {
    name: (
      <span
        className="flex h-7 max-h-7 flex-row items-center gap-2 font-figtree text-[#e7e7e7]"
        style={{ fontSize: `${fontSize}px` }}
      >
        {file.isFolder ? <IoIosArrowForward /> : <VscBlank />}
        <FileIcon isMinified={true} thumbnailURL={thumbnailURL} type={file.type} isFolder={file.isFolder} />
        {file.fullName}
      </span>
    ),
    type: file.type.toUpperCase(),
    dateModified: modifiedDate || '',
    size: file.size
  }
  return (
    <tr
      key={file.key}
      className="h-9 text-[#a3a3a3] hover:bg-[#191B1F]"
      onContextMenu={onContextMenu}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      ref={(ref) => dragFn(dropFn(ref))}
    >
      {availableTableColumns
        .filter((header) => selectedTableColumns[header])
        .map((header, idx) => (
          <td key={idx} style={{ fontSize: `${fontSize}px` }}>
            {tableColumns[header]}
          </td>
        ))}
    </tr>
  )
}

function GridView({ file, onDoubleClick, onContextMenu, onClick, isSelected }: DisplayTypeProps) {
  const iconSize = useHookstate(getMutableState(FilesViewModeSettings).icons.iconSize).value
  const thumbnailURL = file.thumbnailURL

  return (
    <div onContextMenu={onContextMenu}>
      <div
        className={twMerge(
          'flex h-auto max-h-32 w-28 cursor-pointer flex-col items-center text-center',
          isSelected && 'rounded bg-[#191B1F]'
        )}
        onDoubleClick={file.isFolder ? onDoubleClick : undefined}
        onClick={onClick}
      >
        <div
          className="mx-4 mt-2 font-figtree"
          style={{
            height: iconSize,
            width: iconSize,
            fontSize: iconSize
          }}
        >
          <FileIcon thumbnailURL={thumbnailURL} type={file.type} isFolder={file.isFolder} color="text-[#375DAF]" />
        </div>

        <Tooltip content={file.fullName}>
          <Text theme="secondary" fontSize="sm" className="line-clamp-1 w-full text-wrap break-all">
            {file.fullName}
          </Text>
        </Tooltip>
      </div>
    </div>
  )
}

export default function FileItem({ file }: { file: FileDataType }) {
  const { t } = useTranslation()
  const filesViewMode = useMutableState(FilesViewModeState).viewMode
  const isListView = filesViewMode.value === 'list'
  const [anchorEvent, setAnchorEvent] = React.useState<undefined | React.MouseEvent>(undefined)
  const filesState = useMutableState(FilesState)
  const { changeDirectoryByPath, files } = useCurrentFiles()
  const dropOnFileBrowser = useFileBrowserDrop()
  const selectedFiles = useMutableState(SelectedFilesState)

  const [_dragProps, drag, preview] = useDrag(() => ({
    type: file.type,
    file,
    multiple: false
  }))

  useEffect(() => {
    if (preview) preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

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

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setAnchorEvent(event)
    if (!selectedFiles.value.length) selectedFiles.set([file])
  }

  const handleSelectedFiles = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!files) return

    if (event.ctrlKey || event.metaKey) {
      selectedFiles.set((prevSelectedFiles) =>
        prevSelectedFiles.some((file) => file.key === file.key)
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

  return (
    <div ref={drop} className={twMerge('h-min', isOver && 'border-2 border-gray-400')}>
      <div ref={drag}>
        <div onContextMenu={handleContextMenu}>
          <GridView
            file={file}
            onClick={(event) => {
              handleSelectedFiles(event)
              handleFileClick(event)
            }}
            onDoubleClick={handleFileClick}
            onContextMenu={handleContextMenu}
            isSelected={selectedFiles.value.some(({ key }) => key === file.key)}
          />
          <FileContextMenu anchorEvent={anchorEvent} setAnchorEvent={setAnchorEvent} file={file} />
        </div>
      </div>
    </div>
  )
}
