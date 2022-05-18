import React, { MouseEventHandler, MutableRefObject, useCallback, useEffect, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { ContextMenu, ContextMenuTrigger, MenuItem } from '../layout/ContextMenu'
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
  currentContent: MutableRefObject<{ item: FileDataType; isCopy: boolean }>
  deleteContent: (contentPath: string, type: string) => void
  onClick: (params: FileDataType) => void
  setFileProperties: any
  setOpenPropertiesModal: any
  dropItemsOnPanel: (data: any, dropOn?: FileDataType) => void
  moveContent: (oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean) => Promise<void>
}

export function FileBrowserItem(props: FileBrowserItemType) {
  const {
    contextMenuId,
    item,
    currentContent,
    deleteContent,
    onClick,
    moveContent,
    setOpenPropertiesModal,
    setFileProperties,
    dropItemsOnPanel
  } = props
  const { t } = useTranslation()
  const [renamingAsset, setRenamingAsset] = useState(false)

  const onClickItem = (_) => onClick(item)

  const placeObject = useCallback((_, trigger) => {
    addMediaNode(trigger.item.url)
  }, [])

  const placeObjectAtOrigin = useCallback(async (_, trigger) => {
    const node = await addMediaNode(trigger.item.url)
    const transformComponent = getComponent(node.entity, TransformComponent)
    if (transformComponent) getSpawnPositionAtCenter(transformComponent.position)
  }, [])

  const copyURL = useCallback((_, trigger) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trigger.item.url)
    }
  }, [])

  const openURL = useCallback((_, trigger) => {
    window.open(trigger.item.url)
  }, [])

  const Copy = useCallback((_, trigger) => {
    currentContent.current = { item: trigger.item, isCopy: true }
  }, [])

  const Cut = useCallback((_, trigger) => {
    currentContent.current = { item: trigger.item, isCopy: false }
  }, [])

  const viewAssetProperties = useCallback((_, trigger) => {
    if (trigger.item.isFolder) {
      setFileProperties({
        ...trigger.item,
        url: trigger.item.url + '/' + trigger.item.key
      })
    } else {
      setFileProperties(trigger.item)
    }
    setOpenPropertiesModal(true)
  }, [])

  const deleteContentCallback = (_, trigger) => {
    deleteContent(trigger.item.key, trigger.item.type)
  }

  const onNameChanged = async (fileName: string): Promise<void> => {
    setRenamingAsset(false)

    await moveContent(item.fullName, item.isFolder ? fileName : `${fileName}.${item.type}`, item.path, item.path, false)
  }

  const rename = () => setRenamingAsset(true)

  const [_dragProps, drag, preview] = useDrag(() => ({
    type: item.type,
    item,
    multiple: false
  }))

  const [{ isOver }, drop] = useDrop({
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
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const collectMenuProps = () => {
    return { item }
  }

  return (
    <div ref={drop} style={{ border: item.isFolder ? (isOver ? '3px solid #ccc' : '') : '' }}>
      <div ref={drag}>
        <ContextMenuTrigger id={contextMenuId} holdToDisplay={-1} collect={collectMenuProps}>
          <FileListItem
            item={item}
            onClick={onClickItem}
            onDoubleClick={onClickItem}
            isRenaming={renamingAsset}
            onNameChanged={onNameChanged}
          />
        </ContextMenuTrigger>

        <ContextMenu id={contextMenuId} hideOnLeave={true}>
          {item.isFolder && (
            <>
              <MenuItem onClick={placeObject}>{t('editor:layout.assetGrid.placeObject')}</MenuItem>
              <MenuItem onClick={placeObjectAtOrigin}>{t('editor:layout.assetGrid.placeObjectAtOrigin')}</MenuItem>
              <MenuItem onClick={openURL}>{t('editor:layout.assetGrid.openInNewTab')}</MenuItem>
            </>
          )}
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
