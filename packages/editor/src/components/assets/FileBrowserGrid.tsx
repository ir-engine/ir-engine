import React, { useCallback, useEffect, memo, useState, MouseEventHandler } from 'react'
import { MediaGrid } from '../layout/MediaGrid'
import { unique } from '../../functions/utils'
import { ContextMenuTrigger, ContextMenu, MenuItem } from '../layout/ContextMenu'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { ItemTypes } from '../../constants/AssetTypes'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { FileDataType } from './FileDataType'
import InfiniteScroll from 'react-infinite-scroller'
import { CircularProgress } from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import DescriptionIcon from '@mui/icons-material/Description'
import styles from './styles.module.scss'

type FileListItemProps = {
  label: string
  iconComponent: any
  isRenaming: boolean
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
  onNameChanged: (event: Event) => void
}

export const FileListItem: React.FC<FileListItemProps> = (props) => {
  // const inputref = useRef(null)

  // const inputLabel = (
  //   <MediaGridInputLabel placeholder={label} disabled={!isRenaming} onKeyDown={onNameChanged} ref={inputref} />
  // )

  // useEffect(() => {
  //   if (props.isRenaming) inputref.current.focus()
  // }, [props.isRenaming])

  return (
    <div className={styles.fileListItemContainer} onDoubleClick={props.onDoubleClick} onClick={props.onClick}>
      <div className={styles.fileNameContainer}>
        {props.iconComponent ? <props.iconComponent width={15} /> : <DescriptionIcon width={15} />}
      </div>
      {props.label}
    </div>
  )
}

MediaGrid.defaultProps = {
  minWidth: '100px'
}

type FileBrowserItemType = {
  contextMenuId: string
  item: FileDataType
  currentContent: any
  deleteContent: (contentPath: string, type: string) => Promise<void>
  onClick: (params: FileDataType) => void
  moveContent: (from: string, to: string, isCopy?: boolean, renameTo?: string) => Promise<void>
}

function FileBrowserItem(props: FileBrowserItemType) {
  const { contextMenuId, item, currentContent, deleteContent, onClick, moveContent } = props
  const { t } = useTranslation()
  const [renamingAsset, setRenamingAsset] = useState(false)

  const onClickItem = (_) => onClick(item)

  const placeObject = useCallback((_, trigger) => {
    CommandManager.instance.addMedia({ url: trigger.item.url })
  }, [])

  const placeObjectAtOrigin = useCallback((_, trigger) => {
    CommandManager.instance.addMedia({ url: trigger.item.url }, undefined, undefined, false)
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

  const deleteContentCallback = (_, trigger) => {
    deleteContent(trigger.item.id, trigger.item.type)
  }

  const onNameChanged = (event) => {
    if (event.key !== 'Enter') return

    const fileName = event.currentTarget.value
    setRenamingAsset(false)

    if (item.type !== 'folder') {
      const re = /(?<dir>.*\/)(?:.*)(?<ext>\..*)/
      const matchgroups = item.id.match(re)?.groups

      if (matchgroups) {
        const newName = `${fileName}${matchgroups.ext}`
        moveContent(item.id, matchgroups.dir, false, newName)
      }
    } else {
      const re2 = /(?<dir>.*\/)(.*)\//
      const group = item.id.match(re2)?.groups
      if (group) moveContent(item.id, group.dir, false, fileName)
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
    accept: [...ItemTypes.FileBrowserContent],
    drop: (dropItem) => {
      moveContent((dropItem as any).id, item.id)
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
    <div ref={drop}>
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
              iconComponent={item.iconComponent}
              onClick={onClickItem}
              label={item.label}
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
  deleteContent: (contentPath: string, type: string) => Promise<void>
  currentContent: any
}

export const FileBrowserGrid: React.FC<FileBrowserGridTypes> = (props) => {
  const { items, onSelect, moveContent, deleteContent, currentContent } = props

  const itemsRendered = unique(items, (item) => item.id).map((item, i) => (
    <MemoFileGridItem
      key={item.id}
      contextMenuId={i.toString()}
      item={item}
      onClick={onSelect}
      moveContent={moveContent}
      deleteContent={deleteContent}
      currentContent={currentContent}
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
