import React, { useCallback, useRef, useEffect, useContext, memo } from "react";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroller";
import styled from "styled-components";
import { VerticalScrollContainer } from "../layout/Flex";
import { MediaGrid, ImageMediaGridItem, VideoMediaGridItem, IconMediaGridItem } from "../layout/MediaGrid";
import { unique } from "@xr3ngine/engine/src/editor/functions/utils";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "../layout/ContextMenu";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import AssetTooltip from "./AssetTooltip";
import { EditorContext } from "../contexts/EditorContext";
import { ItemTypes } from "../dnd";
import AudioPreview from "./AudioPreview";
import Tooltip, { TooltipContainer } from "../layout/Tooltip";

/**
 * [AssetGridTooltipContainer used to provide styles for tooltip shown if we hover the object]
 * @type {styled component}
 */
const AssetGridTooltipContainer = (styled as any)(TooltipContainer)`
  max-width: initial;
  text-align: left;
`;

/**
 * [collectMenuProps returns menu items]
 */
function collectMenuProps({ item }) {
  return { item };
}

/**
 * [AssetGridItem used to create grid item view]
 * @param       {[type]} contextMenuId
 * @param       {[type]} tooltipComponent
 * @param       {[type]} disableTooltip
 * @param       {[type]} item
 * @param       {[type]} onClick
 * @param       {[type]} rest
 * @constructor
 */
function AssetGridItem({ contextMenuId, tooltipComponent, disableTooltip, item, onClick, ...rest }) {

  // function to handle callback on click of item
  const onClickItem = useCallback(
    e => {
      if (onClick) {
        onClick(item, e);
      }
    },
    [item, onClick]
  );

  // declairing variable for grid item content
  let content;

  if (item.thumbnailUrl) {
    //setting content as ImageMediaGridItem component if item contains thumbnailUrl
    content = <ImageMediaGridItem src={item.thumbnailUrl} onClick={onClickItem} label={item.label} {...rest} />;
  } else if (item.videoUrl) {
    //setting content as VideoMediaGridItem component if item contains videoUrl
    content = <VideoMediaGridItem src={item.videoUrl} onClick={onClickItem} label={item.label} {...rest} />;
  } else if (item.iconComponent) {
    //setting content as IconMediaGridItem component if item contains iconComponent
    content = (
      <IconMediaGridItem iconComponent={item.iconComponent} onClick={onClickItem} label={item.label} {...rest} />
    );
  } else {
    //setting content as ImageMediaGridItem if all above cases are false
    content = <ImageMediaGridItem onClick={onClickItem} label={item.label} {...rest} />;
  }

  if (item.type === ItemTypes.Audio) {
    //setting content as AudioPreview component if item type is audio
    content = <AudioPreview src={item.url}>{content}</AudioPreview>;
  }

  // @ts-ignore
  const [_dragProps, drag, preview] = useDrag({ item: { type: item.type },
    begin() {
      return { type: item.type, multiple: false, value: item };
    }
  });

 /**
  * [renderTooltip  used to render tooltip for AssetGrid]
  * @type {function component}
  */
  const renderTooltip = useCallback(() => {
    const TooltipComponent = tooltipComponent;
    return (
      <AssetGridTooltipContainer>
        <TooltipComponent item={item} />
      </AssetGridTooltipContainer>
    );
  }, [item, tooltipComponent]);

  //showing the object in viewport once it drag and droped
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  //creating view for AssetGrid using ContextMenuTrigger and tooltip component
  return (
    <div ref={drag}>
      { /* @ts-ignore */ }
      <ContextMenuTrigger id={contextMenuId} item={item} collect={collectMenuProps} holdToDisplay={-1}>
      { /* @ts-ignore */ }
        <Tooltip renderContent={renderTooltip} disabled={disableTooltip}>
          {content}
        </Tooltip>
      </ContextMenuTrigger>
    </div>
  );
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
`;

//declairing propTypes for AssetGridItem
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
};

//variable used to create uniqueId
let lastId = 0;

/**
 * [
 * Memo
 * React renders the component and memoizes the result.
 * Before the next render, if the new props are the same,
 * React reuses the memoized result skipping the next rendering
 * ]
 */
const MemoAssetGridItem = memo(AssetGridItem);

/**
 * [AssetGrid component used to render AssetGridItems]
 * @param       {Boolean} isLoading     [used to render loading if true]
 * @param       {[type]}  selectedItems [ array of items]
 * @param       {[type]}  items         [array of items to render AssetGrid]
 * @param       {[type]}  onSelect
 * @param       {[type]}  onLoadMore
 * @param       {Boolean} hasMore
 * @param       {[type]}  tooltip
 * @param       {[type]}  source
 * @constructor
 */
export default function AssetGrid({ isLoading, selectedItems, items, onSelect, onLoadMore, hasMore, tooltip, source }) {
  const editor = useContext(EditorContext);
  const uniqueId = useRef(`AssetGrid${lastId}`);

  // incrementig lastId
  useEffect(() => {
    lastId++;
  }, []);

  // creating callback function used if object get placed on viewport
  const placeObject = useCallback(
    (_, trigger) => {
      const item = trigger.item;

      const node = new item.nodeClass(editor);

      if (item.initialProps) {
        Object.assign(node, item.initialProps);
      }

      editor.getSpawnPosition(node.position);

      editor.addObject(node);
    },
    [editor]
  );
 //creating callback function used when we choose placeObjectAtOrigin option from context menu of AssetGridItem
  const placeObjectAtOrigin = useCallback(
    (_, trigger) => {
      const item = trigger.item;

      const node = new item.nodeClass(editor);

      if (item.initialProps) {
        Object.assign(node, item.initialProps);
      }

      editor.addObject(node);
    },
    [editor]
  );

  const copyURL = useCallback((_, trigger) => {
    // if (navigator.clipboard) {
    //   navigator.clipboard.writeText(trigger.item.url);
    // }
  }, []);

  const openURL = useCallback((_, trigger) => {
    window.open(trigger.item.url);
  }, []);

  const onDelete = useCallback(
    (_, trigger) => {
      source.delete(trigger.item);
    },
    [source]
  );

//returning view of AssetGridItems
  return (
    <>
      <VerticalScrollContainer flex>
        <InfiniteScroll pageStart={0} loadMore={onLoadMore} hasMore={hasMore} threshold={100} useWindow={false}>
          <MediaGrid>
            {unique(items, "id").map(item => (
              <MemoAssetGridItem
                key={item.id}
                tooltipComponent={tooltip}
                disableTooltip={false}
                contextMenuId={uniqueId.current}
                item={item}
                selected={selectedItems.indexOf(item) !== -1}
                onClick={onSelect}
              />
            ))}
            {isLoading && <LoadingItem>Loading...</LoadingItem>}
          </MediaGrid>
        </InfiniteScroll>
      </VerticalScrollContainer>
            { /* @ts-ignore */ }
      <ContextMenu id={uniqueId.current}>
        <MenuItem onClick={placeObject}>Place Object</MenuItem>
        <MenuItem onClick={placeObjectAtOrigin}>Place Object at Origin</MenuItem>
        {!source.disableUrl && <MenuItem onClick={copyURL}>Copy URL</MenuItem>}
        {!source.disableUrl && <MenuItem onClick={openURL}>Open URL in New Tab</MenuItem>}
        {source.delete && <MenuItem onClick={onDelete}>Delete Asset</MenuItem>}
      </ContextMenu>
    </>
  );
}

//creating propTypes for asset grid
AssetGrid.propTypes = {
  source: PropTypes.object,
  tooltip: PropTypes.func,
  isLoading: PropTypes.bool,
  onSelect: PropTypes.func,
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
};

// creating default properties for AssetGrid
AssetGrid.defaultProps = {
  onSelect: () => {},
  items: [],
  selectedItems: [],
  tooltip: AssetTooltip
};
