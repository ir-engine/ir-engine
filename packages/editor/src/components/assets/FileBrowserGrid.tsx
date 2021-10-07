import React, { useCallback, useRef, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import InfiniteScroll from 'react-infinite-scroller'
import styled from 'styled-components'
import { VerticalScrollContainer } from '../layout/Flex'
import {
  MediaGrid,
  ImageMediaGridItem,
  VideoMediaGridItem,
  IconMediaGridItem,
  FolderGridItem
} from '../layout/MediaGrid'
import { unique } from '../../functions/utils'
import { ContextMenuTrigger, ContextMenu, MenuItem } from '../layout/ContextMenu'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import AssetTooltip from './AssetTooltip'
import { ItemTypes } from '../../constants/AssetTypes'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'
import { ProjectManager } from '../../managers/ProjectManager'
import { Folder } from '@styled-icons/fa-solid/Folder'

/**
 * collectMenuProps returns menu items.
 *
 * @author Robert Long
 */
function collectMenuProps({ item }) {
  return { item }
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
function FileBrowserItem({ contextMenuId, item, onClick, ...rest }) {
  // function to handle callback on click of item
  const onClickItem = useCallback(
    (e) => {
      if (onClick) {
        onClick(item, e)
      }
    },
    [item, onClick]
  )

  // declaring variable for grid item content
  let content

  if (item.type === 'folder') {
    content = <IconMediaGridItem iconComponent={Folder} onDoubleClick={onClickItem} label={item.label} {...rest} />
  } else {
    content = (
      <IconMediaGridItem iconComponent={item.iconComponent} onClick={onClickItem} label={item.label} {...rest} />
    )
  }

  const [_dragProps, drag, preview] = useDrag(() => ({
    type: item.type,
    item,
    multiple: false
  }))

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  //creating view for AssetGrid using ContextMenuTrigger and tooltip component
  return (
    <div ref={drag}>
      <ContextMenuTrigger id={contextMenuId} collect={collectMenuProps} holdToDisplay={-1}>
        {content}
      </ContextMenuTrigger>
    </div>
  )
}

// styled component fpr showing loading in AssetGrid container
const LoadingItem = (styled as any).div`
  display: flex;
  flex-direction: column;
  height: 100px;
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

/**
 * FileBrowserGrid component used to render FileBrowser.
 *
 * @author Abhishek Pathak
 * @param       {Boolean} isLoading     [used to render loading if true]
 * @param       {any}  selectedItems [ array of items]
 * @param       {any}  items         [array of items to render AssetGrid]
 * @param       {any}  onSelect
 * @param       {any}  onLoadMore
 * @param       {Boolean} hasMore
 * @param       {any}  tooltip
 * @param       {any}  source
 * @constructor
 */
export function FileBrowserGrid({
  isLoading,
  selectedItems,
  addNewFolder,
  items,
  onSelect,
  onLoadMore,
  hasMore,
  source
}) {
  const uniqueId = useRef(`FileGrid${lastId}`)
  const { t } = useTranslation()

  // incrementig lastId
  useEffect(() => {
    lastId++
  }, [])

  // creating callback function used if object get placed on viewport
  const placeObject = useCallback((_, trigger) => {
    const item = trigger.item

    const node = new item.nodeClass()

    if (item.initialProps) {
      Object.assign(node, item.initialProps)
    }

    SceneManager.instance.getSpawnPosition(node.position)

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node)

    if (item.projectId && globalThis.currentProjectID !== item.projectId) {
      ProjectManager.instance.currentOwnedFileIds[item.label] = item.fileId
    }
  }, [])
  //creating callback function used when we choose placeObjectAtOrigin option from context menu of AssetGridItem
  const placeObjectAtOrigin = useCallback((_, trigger) => {
    const item = trigger.item

    const node = new item.nodeClass()

    if (item.initialProps) {
      Object.assign(node, item.initialProps)
    }

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node)
    if (item.projectId && globalThis.currentProjectID !== item.projectId)
      ProjectManager.instance.currentOwnedFileIds[item.label] = item.fileId
  }, [])

  const copyURL = useCallback((_, trigger) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trigger.item.url)
    }
  }, [])

  const openURL = useCallback((_, trigger) => {
    window.open(trigger.item.url)
  }, [])

  const onDelete = useCallback(
    (_, trigger) => {
      //source.delete(trigger.item)
    },
    [source]
  )

  const Move = useCallback(() => {
    ;() => {
      //Move the File in Editor.
      //Send File Service.
    }
  }, [])

  const Copy = useCallback(() => {
    ;() => {
      //Copy the File in Editor.
      //Send File Service
    }
  }, [])

  //returning view of AssetGridItems
  return (
    <>
      {console.log('Rendering File Browser GRID')}
      <ContextMenuTrigger id={'uniqueId.current'}>
        <VerticalScrollContainer flex>
          <InfiniteScroll pageStart={0} loadMore={onLoadMore} hasMore={hasMore} threshold={100} useWindow={false}>
            <MediaGrid>
              {unique(items, 'id').map((item) => (
                <MemoFileGridItem
                  key={item.id}
                  contextMenuId={uniqueId.current}
                  item={item}
                  selected={selectedItems.indexOf(item) !== -1}
                  onClick={onSelect}
                />
              ))}
              {isLoading && <LoadingItem>{t('editor:layout.assetGrid.loading')}</LoadingItem>}
            </MediaGrid>
          </InfiniteScroll>
        </VerticalScrollContainer>
        <ContextMenu id={uniqueId.current}>
          <MenuItem onClick={placeObject}>{t('editor:layout.assetGrid.placeObject')}</MenuItem>
          <MenuItem onClick={placeObjectAtOrigin}>{t('editor:layout.assetGrid.placeObjectAtOrigin')}</MenuItem>
          {!source.disableUrl && <MenuItem onClick={copyURL}>{t('editor:layout.assetGrid.copyURL')}</MenuItem>}
          {!source.disableUrl && <MenuItem onClick={openURL}>{t('editor:layout.assetGrid.openInNewTab')}</MenuItem>}
          {source.delete && <MenuItem onClick={onDelete}>{t('editor:layout.assetGrid.deleteAsset')}</MenuItem>}
        </ContextMenu>
      </ContextMenuTrigger>

      <ContextMenu id={'uniqueId.current'} hideOnLeave={true}>
        <MenuItem onClick={addNewFolder}>{t('editor:layout.filebrowser.addnewfolder')}</MenuItem>
      </ContextMenu>
    </>
  )
}

//creating propTypes for asset grid
FileBrowserGrid.propTypes = {
  source: PropTypes.object,
  tooltip: PropTypes.func,
  isLoading: PropTypes.bool,
  onSelect: PropTypes.func,
  addNewFolder: PropTypes.func,
  onLoadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
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
