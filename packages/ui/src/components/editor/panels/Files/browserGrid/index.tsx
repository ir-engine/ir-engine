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

import { fileBrowserPath, staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import {
  FilesViewModeSettings,
  availableTableColumns
} from '@etherealengine/editor/src/components/assets/FileBrowser/FileBrowserState'
import { FileDataType } from '@etherealengine/editor/src/components/assets/FileBrowser/FileDataType'
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { addMediaNode } from '@etherealengine/editor/src/functions/addMediaNode'
import { getSpawnPositionAtCenter } from '@etherealengine/editor/src/functions/screenSpaceFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import Paper from '@etherealengine/ui/src/primitives/mui/Paper'
import React, { MouseEventHandler, MutableRefObject, useEffect, useState } from 'react'
import { ConnectDragSource, ConnectDropTarget, useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { IoIosArrowForward } from 'react-icons/io'
import { VscBlank } from 'react-icons/vsc'
import { Vector3 } from 'three'
import Button from '../../../../../primitives/tailwind/Button'
import Input from '../../../../../primitives/tailwind/Input'
import { ContextMenu } from '../../../layout/ContextMenu'
import { FileIcon } from '../icon'

const RenameInput = ({ fileName, onNameChanged }: { fileName: string; onNameChanged: (newName: string) => void }) => {
  const newFileName = useHookstate(fileName)
  //className={styles.inputContainer}
  return (
    <Paper component="div">
      <Input
        autoFocus={true}
        //className={styles.input}
        value={newFileName.value}
        onChange={(event) => newFileName.set(event.target.value)}
        onKeyUp={async (e) => {
          if (e.key == 'Enter') {
            onNameChanged(newFileName.value)
          }
        }}
      />
    </Paper>
  )
}

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
  const fontSize = useHookstate(getMutableState(FilesViewModeSettings).list.fontSize).value
  return (
    <div className="table-container">
      <table className="w-full">
        <thead>
          <tr className="table-header-row h-8 text-left">
            {availableTableColumns
              .filter((header) => selectedTableColumns[header])
              .map((header) => (
                <th key={header} className="table-cell text-xs font-normal ">
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
  isRenaming,
  onNameChanged,
  onClick,
  onDoubleClick,
  modifiedDate,
  drop,
  isOver,
  drag
}: {
  file: FileDataType
  onContextMenu: React.MouseEventHandler
  isRenaming: boolean
  onNameChanged: (newName: string) => void
  onClick?: MouseEventHandler<HTMLDivElement>
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  modifiedDate?: string
  drop?: ConnectDropTarget
  isOver: boolean
  drag?: ConnectDragSource
}) => {
  const selectedTableColumns = useHookstate(getMutableState(FilesViewModeSettings).list.selectedTableColumns).value
  const fontSize = useHookstate(getMutableState(FilesViewModeSettings).list.fontSize).value
  const dragFn = drag ?? ((input) => input)
  const dropFn = drop ?? ((input) => input)

  const staticResource = useFind(staticResourcePath, { query: { key: file.key } })
  const thumbnailURL = staticResource.data[0]?.thumbnailURL

  const tableColumns = {
    name: (
      <span className="flex max-h-7 flex-row items-center gap-2 text-white">
        {file.isFolder ? <IoIosArrowForward className="text-grey" /> : <VscBlank className="text-grey" />}
        <FileIcon thumbnailURL={null} type={file.type} isFolder={file.isFolder} />
        {isRenaming ? <RenameInput fileName={file.name} onNameChanged={onNameChanged} /> : file.fullName}
      </span>
    ),
    type: file.type.toUpperCase(),
    dateModified: modifiedDate || '',
    size: file.size
  }
  return (
    <tr
      key={file.key}
      className={`h-[${fontSize * 3}px] text-[${fontSize}px] hover:bg-gray-900`}
      onContextMenu={onContextMenu}
      onClick={isRenaming ? () => {} : onClick}
      onDoubleClick={isRenaming ? () => {} : onDoubleClick}
      ref={(ref) => dragFn(dropFn(ref))}
    >
      {availableTableColumns
        .filter((header) => selectedTableColumns[header])
        .map((header, idx) => (
          <td key={idx} className={`text-base`}>
            {tableColumns[header]}
          </td>
        ))}
    </tr>
  )
}

type FileGridItemProps = {
  item: FileDataType
  isRenaming: boolean
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
  onNameChanged: (newName: string) => void
}

export const FileGridItem: React.FC<FileGridItemProps> = (props) => {
  const iconSize = useHookstate(getMutableState(FilesViewModeSettings).icons.iconSize).value
  const staticResource = useFind(staticResourcePath, { query: { key: props.item.key } })
  const thumbnailURL = staticResource.data[0]?.thumbnailURL
  return (
    <div
      className="flex w-[112px] cursor-pointer flex-col items-center text-center"
      onDoubleClick={props.item.isFolder ? props.onDoubleClick : undefined}
      onClick={props.onClick}
    >
      <div
        className="mx-[16px] mt-[8px]"
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
      {props.isRenaming ? (
        <></>
      ) : (
        /*<RenameInput fileName={props.item.name} onNameChanged={props.onNameChanged} />*/
        <div className="text-secondary mb-[8px] line-clamp-1 w-full text-wrap break-all text-[14px]">
          {props.item.fullName}
        </div>
      )}
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
  setOpenConvert: any
  isFilesLoading: boolean
  deleteContent: (contentPath: string, type: string) => void
  onClick: (params: FileDataType) => void
  dropItemsOnPanel: (data: any, dropOn?: FileDataType) => void
  moveContent: (oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean) => Promise<void>
  addFolder: () => void
  isListView: boolean
  staticResourceModifiedDates: Record<string, string>
}

export function FileBrowserItem({
  item,
  disableDnD,
  currentContent,
  setOpenPropertiesModal,
  setFileProperties,
  setOpenCompress,
  setOpenConvert,
  deleteContent,
  onClick,
  dropItemsOnPanel,
  moveContent,
  isFilesLoading,
  addFolder,
  isListView,
  staticResourceModifiedDates
}: FileBrowserItemType) {
  const { t } = useTranslation()
  const [anchorPosition, setAnchorPosition] = React.useState<any>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [renamingAsset, setRenamingAsset] = useState(false)

  const fileService = useMutation(fileBrowserPath)

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setAnchorPosition({
      left: event.clientX + 2,
      top: event.clientY - 6
    })
  }

  const handleClose = () => {
    setAnchorEl(null)
    setAnchorPosition({ left: 0, top: 0 })
  }

  const onClickItem = () => onClick(item)

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

  const viewConvert = () => {
    setFileProperties(item)
    setOpenConvert(true)
    handleClose()
  }

  const deleteContentCallback = () => {
    deleteContent(item.key, item.type)
    handleClose()
  }

  const onNameChanged = async (fileName: string): Promise<void> => {
    setRenamingAsset(false)

    await moveContent(item.fullName, item.isFolder ? fileName : `${fileName}.${item.type}`, item.path, item.path, false)
  }

  const rename = () => {
    setRenamingAsset(true)
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
          isRenaming={renamingAsset}
          onNameChanged={onNameChanged}
          modifiedDate={staticResourceModifiedDates[item.key]}
          drop={drop}
          isOver={isOver}
          drag={drag}
        />
      ) : (
        <div ref={drop} style={{ border: isOver ? '3px solid #ccc' : '' }}>
          <div ref={drag}>
            <div onContextMenu={handleContextMenu}>
              {
                <FileGridItem
                  item={item}
                  onClick={onClickItem}
                  onDoubleClick={onClickItem}
                  isRenaming={renamingAsset}
                  onNameChanged={onNameChanged}
                />
              }
            </div>
          </div>
        </div>
      )}

      <ContextMenu
        open={open}
        anchorEl={anchorEl}
        panelId={'file-browser-panel'}
        anchorPosition={anchorPosition}
        onClose={handleClose}
        className="gap-1"
      >
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
        <Button variant="outline" size="small" fullWidth onClick={rename}>
          {t('editor:layout.filebrowser.renameAsset')}
        </Button>
        <Button variant="outline" size="small" fullWidth onClick={deleteContentCallback}>
          {t('editor:layout.assetGrid.deleteAsset')}
        </Button>
        <Button variant="outline" size="small" fullWidth onClick={viewAssetProperties}>
          {t('editor:layout.filebrowser.viewAssetProperties')}
        </Button>
        <Button variant="outline" size="small" fullWidth onClick={viewCompress}>
          {t('editor:layout.filebrowser.compress')}
        </Button>
        <Button variant="outline" size="small" fullWidth onClick={viewConvert}>
          {t('editor:layout.filebrowser.convert')}
        </Button>
      </ContextMenu>
    </>
  )
}
