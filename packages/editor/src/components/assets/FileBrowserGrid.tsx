import React, { useCallback, useRef, useEffect, memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { MediaGrid } from '../layout/MediaGrid'
import { unique } from '../../functions/utils'
import { ContextMenuTrigger, ContextMenu, MenuItem } from '../layout/ContextMenu'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import AssetTooltip from './AssetTooltip'
import { ItemTypes } from '../../constants/AssetTypes'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'
import { FileDataType } from './FileDataType'
import InfiniteScroll from 'react-infinite-scroller'
import { CircularProgress } from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import DescriptionIcon from '@mui/icons-material/Description'
import styles from './styles.module.scss'

function collectMenuProps({ item }) {
  return { item }
}

/**
 *
 * @author Robert Long
 * @author Abhishek Pathak
 * @param {any} label
 * @param {IconComponent} IconComponent
 * @param {any} rest
 * @returns
 */
export function FileListItem({
  label,
  iconComponent: IconComponent,
  onNameChanged = null,
  isRenaming = false,
  onDoubleClick,
  onClick
}) {
  const inputref = useRef(null)
  // const inputLabel = (
  //   <MediaGridInputLabel placeholder={label} disabled={!isRenaming} onKeyDown={onNameChanged} ref={inputref} />
  // )

  useEffect(() => {
    if (isRenaming) inputref.current.focus()
  }, [isRenaming])
  return (
    <div className={styles.fileListItemContainer} onDoubleClick={onDoubleClick} onClick={onClick}>
      <div className={styles.fileNameContainer}>
        {IconComponent ? <IconComponent width={15} /> : <DescriptionIcon width={20} />}
      </div>
      {label}
    </div>
  )
}

/**
 *
 *  @author Robert Long
 */
export const FileList = (styled as any).div`
 width: 100%;
 padding-bottom: 60px;
`

MediaGrid.defaultProps = {
  minWidth: '100px'
}

type FileBrowserItemType = {
  contextMenuId: string
  item: FileDataType
  currentContent: any
  deleteContent: any
  onClick: any
  moveContent: any
}

/**
 * FileBrowserItem used to create grid item view.
 *
 * @author Abhishek Pathak
 * @param       {any} contextMenuId
 * @param       {any} item
 * @param       {any} onClick
 * @param       {any} rest
 * @constructor
 */

function FileBrowserItem(props: FileBrowserItemType) {
  const { contextMenuId, item, currentContent, deleteContent, onClick, moveContent } = props
  const { t } = useTranslation()

  const onClickItem = (e) => onClick(item)

  const placeObject = useCallback((_, trigger) => {
    const item = trigger.item

    const node = new item.nodeClass()

    if (item.initialProps) {
      Object.assign(node, item.initialProps)
    }

    SceneManager.instance.getSpawnPosition(node.position)

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node)
  }, [])

  const placeObjectAtOrigin = useCallback((_, trigger) => {
    const item = trigger.item

    const node = new item.nodeClass()

    if (item.initialProps) {
      Object.assign(node, item.initialProps)
    }

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node)
  }, [])

  const copyURL = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.url)
    }
  }, [])

  const openURL = useCallback(() => {
    window.open(item.url)
  }, [])

  const Copy = useCallback(() => {
    currentContent.current = { itemid: item.id, isCopy: true }
  }, [])

  const Cut = useCallback(() => {
    currentContent.current = { itemid: item.id, isCopy: false }
  }, [])

  const deleteContentCallback = () => {
    deleteContent({ contentPath: item.id, type: item.type })
  }

  const onNameChanged = (event) => {
    if (event.key !== 'Enter') return

    const fileName = event.currentTarget.value
    setRenamingAsset(false)
    if (item.type !== 'folder') {
      const re = /(?<dir>.*\/)(?:.*)(?<ext>\..*)/
      const matchgroups = (item.id as string).match(re).groups
      const newName = `${fileName}${matchgroups.ext}`
      moveContent(item.id, matchgroups.dir, false, newName)
    } else {
      const re2 = /(?<dir>.*\/)(.*)\//
      const grou = (item.id as string).match(re2).groups
      moveContent(item.id, grou.dir, false, fileName)
    }
  }

  const rename = () => {
    setRenamingAsset(true)
  }

  const [renamingAsset, setRenamingAsset] = useState(false)
  let content: JSX.Element
  if (item.type === 'folder') {
    content = (
      <FileListItem
        iconComponent={FolderIcon}
        onDoubleClick={onClickItem}
        onClick={null}
        label={item.label}
        isRenaming={renamingAsset}
        onNameChanged={onNameChanged}
      />
    )
  } else {
    content = (
      <FileListItem
        iconComponent={item.iconComponent}
        onDoubleClick={null}
        onClick={onClickItem}
        label={item.label}
        isRenaming={renamingAsset}
        onNameChanged={onNameChanged}
      />
    )
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

  //creating view for AssetGrid using ContextMenuTrigger and tooltip component
  return (
    <div ref={drop}>
      <div ref={drag}>
        <ContextMenuTrigger id={contextMenuId} holdToDisplay={-1} collect={collectMenuProps}>
          {content}
        </ContextMenuTrigger>

        <ContextMenu id={contextMenuId} hideOnLeave={true}>
          <>
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
          </>
        </ContextMenu>
      </div>
    </div>
  )
}

// styled component fpr showing loading in AssetGrid container
const LoadingItem = (styled as any).div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  border-radius: 6px;
  background-color: rgba(128, 128, 128, 0.5);
  border: 2px solid transparent;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  user-select: none;
`

//declaring propTypes for AssetGridItem
FileBrowserItem.propTypes = {
  tooltipComponent: PropTypes.func,
  disableTooltip: PropTypes.bool,
  contextMenuId: PropTypes.string,
  onClick: PropTypes.func,
  moveContent: PropTypes.func,
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    videoUrl: PropTypes.string,
    iconComponent: PropTypes.object,
    url: PropTypes.string
  }).isRequired
}

FileBrowserItem.defaultProps = {
  onSelect: () => {},
  items: [],
  selectedItems: [],
  tooltip: AssetTooltip
}

//variable used to create uniqueId
let lastId = 0

const MemoFileGridItem = memo(FileBrowserItem)

type FileBrowserGridTypes = {
  isLoading: boolean
  scrollWindowHeight: number
  items: FileDataType[]
  onSelect: any
  moveContent: any
  deleteContent: any
  currentContent: any
}

/**
 * FileBrowserGrid component used to render FileBrowser.
 *
 * @author Abhishek Pathak
 * @param       {Boolean} isLoading     [used to render loading if true]
 * @param       {any}  selectedItems [ array of items]
 * @param       {FileDataType}  items         [array of items to render AssetGrid]
 * @param       {any}  onSelect
 * @param       {any}  onLoadMore
 * @param       {Boolean} hasMore
 * @param       {any}  tooltip
 * @param       {any}  source
 * @constructor
 */
export const FileBrowserGrid = (props: FileBrowserGridTypes) => {
  const { isLoading, scrollWindowHeight, items, onSelect, moveContent, deleteContent, currentContent } = props
  const uniqueId = useRef(`FileGrid${lastId}`)
  const { t } = useTranslation()

  useEffect(() => {
    lastId++
  }, [])

  // itemHeight = num rows / num cols
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
    <>
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
    </>
  )
}

//creating propTypes for asset grid
FileBrowserGrid.propTypes = {
  tooltip: PropTypes.func,
  isLoading: PropTypes.bool,
  onSelect: PropTypes.func,
  moveContent: PropTypes.func,
  deleteContent: PropTypes.func,
  currentContent: PropTypes.any,
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      label: PropTypes.string,
      thumbnailUrl: PropTypes.string
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      label: PropTypes.string,
      thumbnailUrl: PropTypes.string
    })
  ).isRequired
}

// creating default properties for AssetGrid
FileBrowserGrid.defaultProps = {
  onSelect: () => {},
  addNewFolder: () => {},
  items: [],
  selectedItems: [],
  tooltip: AssetTooltip
}
export default FileBrowserGrid
