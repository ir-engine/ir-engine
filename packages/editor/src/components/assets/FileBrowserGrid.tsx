import React, { memo, MouseEventHandler, useCallback, useEffect, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroller'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'
import { CircularProgress } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { unique } from '../../functions/utils'
import { ContextMenu, ContextMenuTrigger, MenuItem } from '../layout/ContextMenu'
import { FileDataType } from './FileDataType'
import styles from './styles.module.scss'

type FileListItemProps = {
  label: string
  iconComponent: any
  isRenaming: boolean
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
  onNameChanged: any
}

export const FileListItem: React.FC<FileListItemProps> = (props) => {
  const [newFileName, setNewFileName] = React.useState(props.label)

  const handleChange = (e) => {
    setNewFileName(e.target.value)
  }

  return !props.isRenaming ? (
    <div className={styles.fileListItemContainer} onDoubleClick={props.onDoubleClick} onClick={props.onClick}>
      <div className={styles.fileNameContainer}>
        {props.iconComponent ? <props.iconComponent width={15} /> : <DescriptionIcon width={15} />}
      </div>
      {props.label}
    </div>
  ) : (
    <Paper component="div" className={styles.inputContainer}>
      <InputBase
        className={styles.input}
        name="name"
        style={{ color: '#fff' }}
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
  currentContent: any
  deleteContent: (contentPath: string, type: string) => void
  onClick: (params: FileDataType) => void
  setFileProperties: any
  setOpenPropertiesModal: any
  addNewFolder: any
  moveContent: (from: string, to: string, isCopy?: boolean, renameTo?: string) => Promise<void>
}

function FileBrowserItem(props: FileBrowserItemType) {
  const {
    contextMenuId,
    item,
    currentContent,
    deleteContent,
    onClick,
    moveContent,
    setOpenPropertiesModal,
    setFileProperties,
    addNewFolder
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
    currentContent.current = { itemid: trigger.item.id, isCopy: true }
  }, [])

  const Cut = useCallback((_, trigger) => {
    currentContent.current = { itemid: trigger.item.id, isCopy: false }
  }, [])

  const viewAssetProperties = useCallback((_, trigger) => {
    if (trigger.item.type == 'folder') {
      setFileProperties({
        ...trigger.item,
        url: trigger.item.url + '/' + trigger.item.id
      })
    } else {
      setFileProperties(trigger.item)
    }
    setOpenPropertiesModal(true)
  }, [])

  const deleteContentCallback = (_, trigger) => {
    deleteContent(trigger.item.id, trigger.item.type)
  }

  const onNameChanged = async (fileName) => {
    setRenamingAsset(false)

    if (item.type !== 'folder') {
      const re = /(?<dir>.*\/)(?:.*)(?<ext>\..*)/
      const matchgroups = item.id.match(re)?.groups

      if (matchgroups) {
        const newName = `${fileName}${matchgroups.ext}`
        await moveContent(item.id, matchgroups.dir, false, newName)
      }
    } else {
      const re2 = /(?<dir>.*\/)(.*)\//
      const group = item.id.match(re2)?.groups
      if (group) await moveContent(item.id, group.dir, false, fileName)
    }
  }

  const rename = () => {
    setRenamingAsset(true)
  }

  const [_dragProps, drag, preview] = useDrag(() => ({
    type: item.type,
    item,
    multiple: false
  }))

  const [{ isOver, canDrop, moni }, drop] = useDrop({
    accept: [...SupportedFileTypes],
    drop: (dropItem) => {
      if ((dropItem as any).id) {
        moveContent((dropItem as any).id, item.id)
      } else {
        addNewFolder(dropItem, item)
      }
    },
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
    <div ref={drop} style={{ border: item.type == 'folder' ? (isOver ? '3px solid #ccc' : '') : '' }}>
      <div ref={drag}>
        <ContextMenuTrigger id={contextMenuId} holdToDisplay={-1} collect={collectMenuProps}>
          {item.type === 'folder' ? (
            <FileListItem
              iconComponent={FolderIcon}
              onDoubleClick={onClickItem}
              label={item.label}
              isRenaming={renamingAsset}
              onNameChanged={onNameChanged}
            />
          ) : (
            <FileListItem
              iconComponent={item.Icon}
              onClick={onClickItem}
              label={`${item.label}.${item.type}`}
              isRenaming={renamingAsset}
              onNameChanged={onNameChanged}
            />
          )}
        </ContextMenuTrigger>

        <ContextMenu id={contextMenuId} hideOnLeave={true}>
          {item.type !== 'folder' && (
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

const MemoFileGridItem = memo(FileBrowserItem)

type FileBrowserGridTypes = {
  isLoading: boolean
  items: FileDataType[]
  onSelect: (params: FileDataType) => void
  moveContent: (from: string, to: string, isCopy?: boolean, renameTo?: string) => Promise<void>
  deleteContent: (contentPath: string, type: string) => void
  currentContent: any
  setFileProperties: any
  setOpenPropertiesModal: any
  addNewFolder: any
}

export const FileBrowserGrid: React.FC<FileBrowserGridTypes> = (props) => {
  const {
    items,
    onSelect,
    moveContent,
    deleteContent,
    currentContent,
    setFileProperties,
    setOpenPropertiesModal,
    addNewFolder
  } = props

  const itemsRendered = unique(items, (item) => item.id).map((item, i) => (
    <MemoFileGridItem
      key={item.id}
      contextMenuId={i.toString()}
      item={item}
      onClick={onSelect}
      moveContent={moveContent}
      deleteContent={deleteContent}
      currentContent={currentContent}
      setOpenPropertiesModal={setOpenPropertiesModal}
      setFileProperties={setFileProperties}
      addNewFolder={addNewFolder}
    />
  ))

  return (
    <InfiniteScroll
      pageStart={0}
      hasMore={false}
      loader={<CircularProgress />}
      threshold={100}
      useWindow={false}
      loadMore={() => {}}
    >
      {itemsRendered}
    </InfiniteScroll>
  )
}

export default FileBrowserGrid
