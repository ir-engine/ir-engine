import React, { useCallback, useRef, useEffect, memo, useContext } from 'react'
import PropTypes from 'prop-types'
import { VerticalScrollContainer } from '../layout/Flex'
import { MediaGrid, ImageMediaGridItem, VideoMediaGridItem, IconMediaGridItem } from '../layout/MediaGrid'
import { unique } from '../../functions/utils'
import { ContextMenuTrigger, ContextMenu, MenuItem } from '../layout/ContextMenu'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import AssetTooltip from './AssetTooltip'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'
import { prefabIcons } from '../../functions/PrefabEditors'
import { ItemTypes } from '../../constants/AssetTypes'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { shouldPrefabDeserialize } from '../../functions/shouldDeserialiez'
import { ScenePrefabTypes } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { FileDataType } from './FileDataType'
import { AppContext } from '../Search/context'

const getPrefabs = () => {
  const arr = [] as FileDataType[]

  useWorld().scenePrefabRegistry.forEach((_, prefabType: ScenePrefabTypes) => {
    if (shouldPrefabDeserialize(prefabType)) {
      arr.push({
        id: prefabType,
        iconComponent: prefabIcons[prefabType] || null,
        label: prefabType, // todo
        description: '', // todo
        type: ItemTypes.Element,
        nodeClass: prefabType,
        initialProps: null,
        url: ''
      })
    }
  })

  return arr
}

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

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const TooltipComponent = tooltipComponent

  //creating view for AssetGrid using ContextMenuTrigger and tooltip component
  return (
    <div ref={drag}>
      <ContextMenuTrigger id={contextMenuId} collect={collectMenuProps} holdToDisplay={-1}>
        <Tooltip title={<TooltipComponent item={item} />}>
          <div>{content}</div>
        </Tooltip>
      </ContextMenuTrigger>
    </div>
  )
}

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
  const { searchElement } = useContext(AppContext)

  const items = getPrefabs()
  const res = [] as FileDataType[]
  if (searchElement.length > 0) {
    const condition = new RegExp(searchElement.toLowerCase())
    items.forEach((el) => {
      if (condition.test(el.label.toLowerCase())) res.push(el)
    })
  }

  const renderedItems = res?.length > 0 ? res : items

  // incrementig lastId
  useEffect(() => {
    lastId++
  }, [])

  const placeObject = useCallback((_, trigger) => {
    const node = new EntityTreeNode(createEntity())
    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node, {
      prefabTypes: trigger.item.nodeClass
    })

    const transformComponent = getComponent(node.entity, TransformComponent)
    if (transformComponent) SceneManager.instance.getSpawnPosition(transformComponent.position)
  }, [])

  const placeObjectAtOrigin = useCallback((_, trigger) => {
    const node = new EntityTreeNode(createEntity())
    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node, {
      prefabTypes: trigger.item.nodeClass
    })
  }, [])

  return (
    <>
      <VerticalScrollContainer flex>
        <MediaGrid>
          {unique<any>(renderedItems, (item) => item.id).map((item: any) => (
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
