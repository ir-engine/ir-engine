import React, { useCallback, useRef, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { VerticalScrollContainer } from '../layout/Flex'
import { MediaGrid, ImageMediaGridItem, VideoMediaGridItem, IconMediaGridItem } from '../layout/MediaGrid'
import { unique } from '../../functions/utils'
import { ContextMenuTrigger, ContextMenu, MenuItem } from '../layout/ContextMenu'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import AssetTooltip from './AssetTooltip'
import Tooltip, { TooltipContainer } from '../layout/Tooltip'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'
import { NodeManager } from '../../managers/NodeManager'
import { ItemTypes } from '../../constants/AssetTypes'

const getNodes = (params?) => {
  return Array.from<any>(NodeManager.instance.nodeTypes).reduce((acc: any, nodeType: any) => {
    if (nodeType.hideInElementsPanel) {
      return acc
    }
    const nodeEditor = NodeManager.instance.getEditorFromClass(nodeType)
    acc.push({
      id: nodeType.nodeName,
      iconComponent: nodeEditor.WrappedComponent ? nodeEditor.WrappedComponent.iconComponent : nodeEditor.iconComponent,
      label: nodeType.nodeName,
      description: nodeEditor.WrappedComponent ? nodeEditor.WrappedComponent.description : nodeEditor.description,
      type: ItemTypes.Element,
      nodeClass: nodeType,
      initialProps: nodeType.initialElementProps
    })
    return acc
  }, [])
}
/**
 * AssetGridTooltipContainer used to provide styles for tooltip shown if we hover the object.
 *
 * @author Robert Long
 * @type {styled component}
 */
const AssetGridTooltipContainer = (styled as any)(TooltipContainer)`
  max-width: initial;
  text-align: left;
`

/**
 * collectMenuProps returns menu items.
 *
 * @author Robert Long
 */
function collectMenuProps({ item }) {
  return { item }
}

/**
 * AssetGridItem used to create grid item view.
 *
 * @author Robert Long
 * @param       {any} contextMenuId
 * @param       {any} tooltipComponent
 * @param       {any} disableTooltip
 * @param       {any} item
 * @param       {any} onClick
 * @param       {any} rest
 * @constructor
 */
function AssetGridItem({ contextMenuId, tooltipComponent, disableTooltip, item, onClick, ...rest }) {
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

  if (item.thumbnailUrl) {
    //setting content as ImageMediaGridItem component if item contains thumbnailUrl
    content = <ImageMediaGridItem src={item.thumbnailUrl} onClick={onClickItem} label={item.label} {...rest} />
  } else if (item.videoUrl) {
    //setting content as VideoMediaGridItem component if item contains videoUrl
    content = <VideoMediaGridItem src={item.videoUrl} onClick={onClickItem} label={item.label} {...rest} />
  } else if (item.iconComponent) {
    //setting content as IconMediaGridItem component if item contains iconComponent
    content = (
      <IconMediaGridItem iconComponent={item.iconComponent} onClick={onClickItem} label={item.label} {...rest} />
    )
  } else {
    //setting content as ImageMediaGridItem if all above cases are false
    content = <ImageMediaGridItem onClick={onClickItem} label={item.label} {...rest} />
  }

  const [_dragProps, drag, preview] = useDrag(() => ({
    type: item.type,
    item,
    multiple: false
  }))

  /**
   * [renderTooltip  used to render tooltip for AssetGrid]
   * @type {function component}
   */
  const renderTooltip = useCallback(() => {
    const TooltipComponent = tooltipComponent
    return (
      <AssetGridTooltipContainer>
        <TooltipComponent item={item} />
      </AssetGridTooltipContainer>
    )
  }, [item, tooltipComponent])

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  //creating view for AssetGrid using ContextMenuTrigger and tooltip component
  return (
    <div ref={drag}>
      <ContextMenuTrigger id={contextMenuId} collect={collectMenuProps} holdToDisplay={-1}>
        <Tooltip renderContent={renderTooltip} disabled={disableTooltip}>
          {content}
        </Tooltip>
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
AssetGridItem.propTypes = {
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

AssetGrid.defaultProps = {
  onSelect: () => {},
  items: [],
  selectedItems: [],
  tooltip: AssetTooltip
}

//variable used to create uniqueId
let lastId = 0

/**
 *
 * Memo
 * React renders the component and memoizes the result.
 * Before the next render, if the new props are the same,
 * React reuses the memoized result skipping the next rendering
 *
 *
 * @author Robert Long
 */
const MemoAssetGridItem = memo(AssetGridItem)

/**
 * AssetGrid component used to render AssetGridItems.
 *
 * @author Robert Long
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
export function AssetGrid({ onSelect, tooltip }) {
  const uniqueId = useRef(`AssetGrid${lastId}`)
  const { t } = useTranslation()

  const items = getNodes()
  console.log(items)

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
  }, [])

  //creating callback function used when we choose placeObjectAtOrigin option from context menu of AssetGridItem
  const placeObjectAtOrigin = useCallback((_, trigger) => {
    const item = trigger.item

    const node = new item.nodeClass()

    if (item.initialProps) {
      Object.assign(node, item.initialProps)
    }

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node)
  }, [])

  //returning view of AssetGridItems
  return (
    <>
      <VerticalScrollContainer flex>
        <MediaGrid>
          {unique(items, 'id').map((item) => (
            <MemoAssetGridItem
              key={item.id}
              tooltipComponent={tooltip}
              disableTooltip={false}
              contextMenuId={uniqueId.current}
              item={item}
              // selected={selectedItems.indexOf(item) !== -1}
              onClick={onSelect}
            />
          ))}
        </MediaGrid>
      </VerticalScrollContainer>
      <ContextMenu id={uniqueId.current}>
        <MenuItem onClick={placeObject}>{t('editor:layout.assetGrid.placeObject')}</MenuItem>
        <MenuItem onClick={placeObjectAtOrigin}>{t('editor:layout.assetGrid.placeObjectAtOrigin')}</MenuItem>
      </ContextMenu>
    </>
  )
}

// creating default properties for AssetGrid
AssetGrid.defaultProps = {
  onSelect: () => {},
  items: [],
  selectedItems: [],
  tooltip: AssetTooltip
}
export default AssetGrid
