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

import React, { MouseEventHandler, MutableRefObject, useEffect, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'

import { FileBrowserService } from '@etherealengine/client-core/src/common/services/FileBrowserService'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { StateMethods } from '@etherealengine/hyperflux'

import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import { PopoverPosition } from '@mui/material/Popover'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { ContextMenu } from '../layout/ContextMenu'
import { FileDataType } from './FileDataType'
import styles from './styles.module.scss'

type FileListItemProps = {
  item: FileDataType
  isRenaming: boolean
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
  onNameChanged: (newName: string) => void
}

export const FileListItem: React.FC<FileListItemProps> = (props) => {
  const [newFileName, setNewFileName] = React.useState(props.item.name)

  const handleChange = (e) => {
    setNewFileName(e.target.value)
  }

  return !props.isRenaming ? (
    <div
      className={styles.fileListItemContainer}
      onDoubleClick={props.item.isFolder ? props.onDoubleClick : undefined}
      onClick={props.item.isFolder ? undefined : props.onClick}
    >
      <div className={styles.fileNameContainer}>
        {props.item.isFolder ? (
          <FolderIcon width={15} />
        ) : props.item.Icon ? (
          <props.item.Icon width={15} />
        ) : (
          <DescriptionIcon width={15} />
        )}
      </div>
      {props.item.fullName}
    </div>
  ) : (
    <Paper component="div" className={styles.inputContainer}>
      <InputBase
        className={styles.input}
        name="name"
        autoComplete="off"
        value={newFileName}
        onChange={(e) => handleChange(e)}
        onKeyPress={async (e) => {
          if (e.key == 'Enter') {
            props.onNameChanged(newFileName)
          }
        }}
      />
    </Paper>
  )
}

type FileBrowserItemType = {
  contextMenuId: string
  item: FileDataType
  disableDnD?: boolean
  currentContent: MutableRefObject<{ item: FileDataType; isCopy: boolean }>
  setFileProperties: any
  setOpenPropertiesModal: any
  setOpenCompress: any
  setOpenConvert: any
  isFilesLoading: StateMethods<boolean, {}>
  deleteContent: (contentPath: string, type: string) => void
  onClick: (params: FileDataType) => void
  dropItemsOnPanel: (data: any, dropOn?: FileDataType) => void
  moveContent: (oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean) => Promise<void>
  refreshDirectory: () => Promise<void>
}

export function FileBrowserItem({
  contextMenuId,
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
  refreshDirectory
}: FileBrowserItemType) {
  const { t } = useTranslation()
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [renamingAsset, setRenamingAsset] = useState(false)

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
    setAnchorPosition(undefined)
  }

  const onClickItem = (_) => onClick(item)

  const placeObject = () => {
    addMediaNode(item.url)

    handleClose()
  }

  const placeObjectAtOrigin = async () => {
    const node = await addMediaNode(item.url)
    if (!node) return
    const transformComponent = getComponent(node, TransformComponent)
    if (transformComponent) getSpawnPositionAtCenter(transformComponent.position)

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

    if (isFilesLoading.value) return
    isFilesLoading.set(true)

    await FileBrowserService.moveContent(
      currentContent.current.item.fullName,
      currentContent.current.item.fullName,
      currentContent.current.item.path,
      item.isFolder ? item.path + item.fullName : item.path,
      currentContent.current.isCopy
    )

    await refreshDirectory()
  }

  const viewAssetProperties = () => {
    if (item.isFolder) {
      setFileProperties({
        ...item,
        url: item.url + '/' + item.key
      })
    } else {
      setFileProperties(item)
    }
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
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: !!monitor.canDrop(),
          moni: monitor.getItemType()
        })
      })

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    if (preview) preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div ref={drop} style={{ border: item.isFolder ? (isOver ? '3px solid #ccc' : '') : '' }}>
      <div ref={drag}>
        <div onContextMenu={handleContextMenu}>
          <FileListItem
            item={item}
            onClick={onClickItem}
            onDoubleClick={onClickItem}
            isRenaming={renamingAsset}
            onNameChanged={onNameChanged}
          />
        </div>

        <ContextMenu open={open} anchorEl={anchorEl} anchorPosition={anchorPosition} onClose={handleClose}>
          {item.isFolder && <MenuItem onClick={placeObject}>{t('editor:layout.assetGrid.placeObject')}</MenuItem>}
          {item.isFolder && (
            <MenuItem onClick={placeObjectAtOrigin}>{t('editor:layout.assetGrid.placeObjectAtOrigin')}</MenuItem>
          )}
          {item.isFolder && <MenuItem onClick={openURL}>{t('editor:layout.assetGrid.openInNewTab')}</MenuItem>}
          <MenuItem onClick={copyURL}>{t('editor:layout.assetGrid.copyURL')}</MenuItem>
          <MenuItem onClick={Cut}>{t('editor:layout.filebrowser.cutAsset')}</MenuItem>
          <MenuItem onClick={Copy}>{t('editor:layout.filebrowser.copyAsset')}</MenuItem>
          <MenuItem disabled={!currentContent.current} onClick={pasteContent}>
            {t('editor:layout.filebrowser.pasteAsset')}
          </MenuItem>
          <MenuItem onClick={rename}>{t('editor:layout.filebrowser.renameAsset')}</MenuItem>
          <MenuItem onClick={deleteContentCallback}>{t('editor:layout.assetGrid.deleteAsset')}</MenuItem>
          <MenuItem onClick={viewAssetProperties}>{t('editor:layout.filebrowser.viewAssetProperties')}</MenuItem>
          <MenuItem onClick={viewCompress}>{t('editor:layout.filebrowser.compress')}</MenuItem>
          <MenuItem onClick={viewConvert}>{t('editor:layout.filebrowser.convert')}</MenuItem>
        </ContextMenu>
      </div>
    </div>
  )
}
