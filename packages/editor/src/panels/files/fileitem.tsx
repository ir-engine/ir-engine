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

import { FileDataType } from '@etherealengine/editor/src/components/assets/FileBrowser/FileDataType'
import {
  FilesViewModeSettings,
  FilesViewModeState,
  availableTableColumns
} from '@etherealengine/editor/src/services/FilesState'
import { getMutableState, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import Tooltip from '@etherealengine/ui/src/primitives/tailwind/Tooltip'
import React, { MouseEventHandler } from 'react'
import { ConnectDragSource, ConnectDropTarget, useDrag } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { IoIosArrowForward } from 'react-icons/io'
import { VscBlank } from 'react-icons/vsc'
import { twMerge } from 'tailwind-merge'
import { FileIcon } from './fileicon'

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
        className="flex h-7 max-h-7 flex-row items-center gap-2 font-['Figtree'] text-[#e7e7e7]"
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
      className={`h-9 text-[#a3a3a3] hover:bg-[#191B1F]`}
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

function GridView(props: {
  item: FileDataType
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
  isSelected: boolean
  projectName: string
  onContextMenu: React.MouseEventHandler
  drop?: ConnectDropTarget
  drag?: ConnectDragSource
  isOver: boolean
}) {
  const { t } = useTranslation()
  const iconSize = useHookstate(getMutableState(FilesViewModeSettings).icons.iconSize).value
  const thumbnailURL = props.item.thumbnailURL
  const dragFn = props.drag ?? ((input) => input)
  const dropFn = props.drop ?? ((input) => input)

  return (
    <div ref={dropFn} className={twMerge('h-min', props.isOver && 'border-2 border-gray-400')}>
      <div ref={dragFn}>
        <div onContextMenu={props.onContextMenu}>
          <div
            className={`flex h-auto max-h-32 w-28 cursor-pointer flex-col items-center text-center ${
              props.isSelected ? 'rounded bg-[#191B1F]' : ''
            }`}
            onDoubleClick={props.item.isFolder ? props.onDoubleClick : undefined}
            onClick={props.onClick}
          >
            <div
              className="mx-4 mt-2 font-['Figtree']"
              style={{
                height: iconSize,
                width: iconSize,
                fontSize: iconSize
              }}
            >
              <FileIcon
                thumbnailURL={thumbnailURL}
                type={props.item.type}
                isFolder={props.item.isFolder}
                color="text-[#375DAF]"
              />
            </div>

            <Tooltip content={t(props.item.fullName)}>
              <div className="text-secondary line-clamp-1 w-full text-wrap break-all text-sm">
                {props.item.fullName}
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FileItem({ file }: { file: FileDataType }) {
  const filesViewMode = useMutableState(FilesViewModeState).viewMode
  const isListView = filesViewMode.value === 'list'

  const [_dragProps, drag, preview] = useDrag(() => ({
    type: item.type,
    item,
    multiple: false
  }))

  // return isListView ?
}
