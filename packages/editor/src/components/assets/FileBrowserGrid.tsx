import React, { MouseEventHandler, MutableRefObject, useEffect, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

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
  deleteContent: (contentPath: string, type: string) => void
  onClick: (params: FileDataType) => void
  dropItemsOnPanel: (data: any, dropOn?: FileDataType) => void
  moveContent: (oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean) => Promise<void>
}

export function FileBrowserItem({
  contextMenuId,
  item,
  disableDnD,
  currentContent,
  setOpenPropertiesModal,
  setFileProperties,
  deleteContent,
  onClick,
  dropItemsOnPanel,
  moveContent
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
    const transformComponent = getComponent(node.entity, TransformComponent)
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
          <MenuItem onClick={rename}>{t('editor:layout.filebrowser.renameAsset')}</MenuItem>
          <MenuItem onClick={deleteContentCallback}>{t('editor:layout.assetGrid.deleteAsset')}</MenuItem>
          <MenuItem onClick={viewAssetProperties}>{t('editor:layout.filebrowser.viewAssetProperties')}</MenuItem>
        </ContextMenu>
      </div>
    </div>
  )
}
