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

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { fileBrowserPath, staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'
import {
  FilesViewModeSettings,
  availableTableColumns
} from '@etherealengine/editor/src/components/assets/FileBrowser/FileBrowserState'
import { FileDataType } from '@etherealengine/editor/src/components/assets/FileBrowser/FileDataType'
import ModelCompressionPanel from '@etherealengine/editor/src/components/assets/ModelCompressionPanel'
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { addMediaNode } from '@etherealengine/editor/src/functions/addMediaNode'
import { getSpawnPositionAtCenter } from '@etherealengine/editor/src/functions/screenSpaceFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { ContextMenu } from '@etherealengine/ui/src/components/editor/layout/ContextMenu'
import React, { MouseEventHandler, MutableRefObject, useEffect } from 'react'
import { ConnectDragSource, ConnectDropTarget, useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { IoIosArrowForward } from 'react-icons/io'
import { VscBlank } from 'react-icons/vsc'
import { twMerge } from 'tailwind-merge'
import { Vector3 } from 'three'
import Button from '../../../../../primitives/tailwind/Button'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import { FileType } from '../container'
import { FileIcon } from '../icon'
import DeleteFileModal from './DeleteFileModal'
import ImageConvertModal from './ImageConvertModal'
import RenameFileModal from './RenameFileModal'

export const canDropItemOverFolder = (folderName: string) =>
  folderName.endsWith('/assets') ||
  folderName.indexOf('/assets/') !== -1 ||
  folderName.endsWith('/public') ||
  folderName.indexOf('/public/') !== -1

/**
 * if `wrap` is enabled, wraps the `children` inside a `TableBody` with Table Heading and Table Component attached
 */
export const FileTableWrapper = ({ wrap, children }: { wrap: boolean; children: JSX.Element }): JSX.Element => {
  if (!wrap) {
    return children
  }
  const { t } = useTranslation()
  const selectedTableColumns = useHookstate(getMutableState(FilesViewModeSettings).list.selectedTableColumns).value
  return (
    <div className="table-container">
      <table className="w-full">
        <thead>
          <tr className="table-header-row h-8 text-left text-[#E7E7E7]">
            {availableTableColumns
              .filter((header) => selectedTableColumns[header])
              .map((header) => (
                <th key={header} className="table-cell text-xs font-normal dark:text-[#A3A3A3]">
                  {t(`editor:layout.filebrowser.table-list.headers.${header}`)}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export const FileTableListBody = ({
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
}) => {
  const selectedTableColumns = useHookstate(getMutableState(FilesViewModeSettings).list.selectedTableColumns).value
  const fontSize = useHookstate(getMutableState(FilesViewModeSettings).list.fontSize).value
  const dragFn = drag ?? ((input) => input)
  const dropFn = drop ?? ((input) => input)

  const staticResource = useFind(staticResourcePath, { query: { key: file.key, project: projectName.value! } })
  const thumbnailURL = staticResource.data[0]?.thumbnailURL

  const tableColumns = {
    name: (
      <span className="flex max-h-7 flex-row items-center gap-2 text-[#e7e7e7]" style={{ fontSize: `${fontSize}px` }}>
        {file.isFolder ? <IoIosArrowForward /> : <VscBlank />}
        <FileIcon thumbnailURL={thumbnailURL} type={file.type} isFolder={file.isFolder} />
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
      className={`text-[#a3a3a3] hover:bg-theme-surfaceInput`}
      style={{ height: `${fontSize * 3}px` }}
      onContextMenu={onContextMenu}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      ref={(ref) => dragFn(dropFn(ref))}
    >
      {availableTableColumns
        .filter((header) => selectedTableColumns[header])
        .map((header, idx) => (
          <td key={idx} className="text-base" style={{ fontSize: `${fontSize}px` }}>
            {tableColumns[header]}
          </td>
        ))}
    </tr>
  )
}

type FileGridItemProps = {
  item: FileDataType
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
  isSelected: boolean
  projectName: string
}

export const FileGridItem: React.FC<FileGridItemProps> = (props) => {
  const iconSize = useHookstate(getMutableState(FilesViewModeSettings).icons.iconSize).value
  const { projectName } = props
  const staticResource = useFind(staticResourcePath, { query: { key: props.item.key, project: projectName! } })
  const thumbnailURL = staticResource.data[0]?.thumbnailURL
  const { t } = useTranslation()

  return (
    <div
      className={`flex h-32 w-28 cursor-pointer flex-col items-center text-center ${
        props.isSelected ? 'rounded-md bg-blue-700/20' : ''
      }`}
      onDoubleClick={props.item.isFolder ? props.onDoubleClick : undefined}
      onClick={props.onClick}
    >
      <div
        className="mx-4 mt-2"
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

      <Tooltip title={t(props.item.fullName)} direction="bottom">
        <div className="text-secondary line-clamp-1 w-full text-wrap break-all text-sm">{props.item.fullName}</div>
      </Tooltip>
    </div>
  )
}

type FileBrowserItemType = {
  item: FileDataType
  disableDnD?: boolean
  currentContent: MutableRefObject<{ item: FileDataType; isCopy: boolean }>
  setFileProperties: any
  setOpenPropertiesModal: any
  setOpenCompress: any
  isFilesLoading: boolean
  projectName: string
  onClick: (event: React.MouseEvent, currentFile: FileDataType) => void
  dropItemsOnPanel: (data: any, dropOn?: FileDataType) => void
  addFolder: () => void
  isListView: boolean
  staticResourceModifiedDates: Record<string, string>
  isSelected: boolean
  refreshDirectory: () => Promise<void>
}

function fileConsistsOfContentType(file: FileDataType, contentType: string): boolean {
  if (file.isFolder) {
    return contentType.startsWith('image')
  } else {
    const guessedType: string = CommonKnownContentTypes[file.type]
    return guessedType?.startsWith(contentType)
  }
}

export function FileBrowserItem({
  item,
  disableDnD,
  currentContent,
  setOpenPropertiesModal,
  setFileProperties,
  setOpenCompress,
  projectName,
  onClick,
  dropItemsOnPanel,
  isFilesLoading,
  addFolder,
  isListView,
  staticResourceModifiedDates,
  isSelected,
  refreshDirectory
}: FileBrowserItemType) {
  const { t } = useTranslation()
  const [anchorEvent, setAnchorEvent] = React.useState<undefined | React.MouseEvent<HTMLDivElement>>(undefined)

  const fileService = useMutation(fileBrowserPath)
  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setAnchorEvent(event)
  }

  const handleClose = () => {
    setAnchorEvent(undefined)
  }

  const onClickItem = (e: React.MouseEvent) => onClick(e, item)

  const placeObjectAtOrigin = () => {
    addMediaNode(item.url)
    handleClose()
  }

  const placeObject = async () => {
    const vec3 = new Vector3()
    getSpawnPositionAtCenter(vec3)
    addMediaNode(item.url, undefined, undefined, [{ name: TransformComponent.jsonID, props: { position: vec3 } }])
    handleClose()
  }

  const copyURL = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.url)
    }
    handleClose()
  }

  const openURL = () => {
    window.open(item.url)
    handleClose()
  }

  const Copy = () => {
    currentContent.current = { item: item, isCopy: true }
    handleClose()
  }

  const Cut = () => {
    currentContent.current = { item: item, isCopy: false }
    handleClose()
  }

  const pasteContent = async () => {
    handleClose()
    if (isFilesLoading) return

    fileService.update(null, {
      oldProject: projectName,
      newProject: projectName,
      oldName: currentContent.current.item.fullName,
      newName: currentContent.current.item.fullName,
      oldPath: currentContent.current.item.path,
      newPath: item.isFolder ? item.path + item.fullName : item.path,
      isCopy: currentContent.current.isCopy
    })
  }

  const viewAssetProperties = () => {
    setFileProperties(item)

    setOpenPropertiesModal(true)
    handleClose()
  }

  const viewCompress = () => {
    setFileProperties(item)
    setOpenCompress(true)
    handleClose()
  }

  const [_dragProps, drag, preview] = disableDnD
    ? [undefined, undefined, undefined]
    : useDrag(() => ({
        type: item.type,
        item,
        multiple: false
      }))

  const [{ isOver }, drop] = disableDnD
    ? [{ isOver: false }, undefined]
    : useDrop({
        accept: [...SupportedFileTypes],
        drop: (dropItem) => dropItemsOnPanel(dropItem, item),
        canDrop: (dropItem: Record<string, unknown>) =>
          item.isFolder && ('key' in dropItem || canDropItemOverFolder(item.key)),
        collect: (monitor) => ({
          isOver: monitor.canDrop() && monitor.isOver()
        })
      })

  useEffect(() => {
    if (preview) preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <>
      {isListView ? (
        <FileTableListBody
          file={item}
          onContextMenu={handleContextMenu}
          onClick={onClickItem}
          onDoubleClick={onClickItem}
          modifiedDate={staticResourceModifiedDates[item.key]}
          drop={drop}
          isOver={isOver}
          drag={drag}
          projectName={projectName}
        />
      ) : (
        <div ref={drop} className={twMerge('h-min', isOver && 'border-2 border-gray-400')}>
          <div ref={drag}>
            <div onContextMenu={handleContextMenu}>
              <FileGridItem
                item={item}
                onClick={onClickItem}
                onDoubleClick={onClickItem}
                isSelected={isSelected}
                projectName={projectName}
              />
            </div>
          </div>
        </div>
      )}

      <ContextMenu anchorEvent={anchorEvent} panelId={'file-browser-panel'} onClose={handleClose} className="gap-1">
        <Button variant="outline" size="small" fullWidth onClick={addFolder}>
          {t('editor:layout.filebrowser.addNewFolder')}
        </Button>
        {!item.isFolder && (
          <Button variant="outline" size="small" fullWidth onClick={placeObject}>
            {t('editor:layout.assetGrid.placeObject')}
          </Button>
        )}
        {!item.isFolder && (
          <Button variant="outline" size="small" fullWidth onClick={placeObjectAtOrigin}>
            {t('editor:layout.assetGrid.placeObjectAtOrigin')}
          </Button>
        )}
        {!item.isFolder && (
          <Button variant="outline" size="small" fullWidth onClick={openURL}>
            {t('editor:layout.assetGrid.openInNewTab')}
          </Button>
        )}
        <Button variant="outline" size="small" fullWidth onClick={copyURL}>
          {t('editor:layout.assetGrid.copyURL')}
        </Button>
        <Button variant="outline" size="small" fullWidth onClick={Cut}>
          {t('editor:layout.filebrowser.cutAsset')}
        </Button>
        <Button variant="outline" size="small" fullWidth onClick={Copy}>
          {t('editor:layout.filebrowser.copyAsset')}
        </Button>
        <Button variant="outline" size="small" fullWidth disabled={!currentContent.current} onClick={pasteContent}>
          {t('editor:layout.filebrowser.pasteAsset')}
        </Button>
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() => PopoverState.showPopupover(<RenameFileModal projectName={projectName} file={item} />)}
        >
          {t('editor:layout.filebrowser.renameAsset')}
        </Button>
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() => PopoverState.showPopupover(<DeleteFileModal file={item} />)}
        >
          {t('editor:layout.assetGrid.deleteAsset')}
        </Button>
        <Button variant="outline" size="small" fullWidth onClick={viewAssetProperties}>
          {t('editor:layout.filebrowser.viewAssetProperties')}
        </Button>
        <Button
          variant="outline"
          size="small"
          fullWidth
          disabled={!fileConsistsOfContentType(item, 'model')}
          onClick={() => {
            if (fileConsistsOfContentType(item, 'model')) {
              PopoverState.showPopupover(
                <ModelCompressionPanel selectedFile={item as FileType} refreshDirectory={refreshDirectory} />
              )
            }
          }}
        >
          {t('editor:layout.filebrowser.compress')}
        </Button>
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() =>
            PopoverState.showPopupover(<ImageConvertModal file={item} refreshDirectory={refreshDirectory} />)
          }
          disabled={!(['jpg', 'png', 'webp'].includes(item.type) || item.isFolder)}
        >
          {t('editor:layout.filebrowser.convert')}
        </Button>
      </ContextMenu>
    </>
  )
}
