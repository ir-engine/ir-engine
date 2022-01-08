import React from 'react'
import { useDragLayer } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ItemTypes } from '../../constants/AssetTypes'

/**
 * DragLayerContainer used as wrapper for DragPreviewContainer.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const DragLayerContainer = (styled as any).div`
  position: fixed;
  pointer-events: none;
  z-index: 99999;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

/**
 * DragPreviewContainer used to provide styles to preview object in editor view.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const DragPreviewContainer = (styled as any).div.attrs((props) => ({
  style: {
    transform: `translate(${props.offset.x}px, ${props.offset.y}px)`
  }
}))`
  background-color: ${(props) => props.theme.blue};
  opacity: 0.3;
  color: ${(props) => props.theme.text};
  padding: 4px;
  border-radius: 4px;
  display: inline-block;
`

/**
 * DragLayer component used to provide area in editor where we can drag and drop elements.
 *
 * @author Robert Long
 * @constructor
 */
export default function DragLayer() {
  const { t } = useTranslation()

  //initializing item, itemType, currentOffset, isDragging using monitor properties
  const { item, itemType, currentOffset, isDragging } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging()
  }))

  //check if not isDisabled and not currentOffset then return null
  if (!isDragging || !currentOffset) {
    return null
  }

  // Declaring variable preview
  let preview

  //check if itemType of Node item type
  if (itemType === ItemTypes.Node) {
    // if multiple items then show item length else show name of item
    if (item.multiple) {
      preview = <div>{t('editor:dnd.nodes', { count: item.value.length })}</div>
    } else {
      preview = <div>{item.value.name}</div>
    }
  } else if (itemType === ItemTypes.Model) {
    //check item of Model type
    if (item.multiple) {
      //check if item contains multiple then showing length of selected models
      preview = <div>{t('editor:dnd.models', { count: item.value.length })}</div>
    } else {
      //showing label of the item
      preview = <div>{item.value.label}</div>
    }
  } else if (itemType === ItemTypes.Image) {
    //check for image types
    if (item.multiple) {
      preview = <div>{t('editor:dnd.images', { count: item.value.length })}</div>
    } else {
      preview = <div>{item.value.label}</div>
    }
  } else if (itemType === ItemTypes.Video) {
    //check for video types
    if (item.multiple) {
      preview = <div>{t('editor:dnd.videos', { count: item.value.length })}</div>
    } else {
      preview = <div>{item.value.label}</div>
    }
  } else if (itemType === ItemTypes.Audio) {
    //check for audio types
    if (item.multiple) {
      preview = <div>{t('editor:dnd.audio', { count: item.value.length })}</div>
    } else {
      preview = <div>{item.value.label}</div>
    }
  } else {
    // showing item type
    preview = <div>{item.type}</div>
  }

  // returning DragLayer view
  return (
    <DragLayerContainer>
      <DragPreviewContainer offset={currentOffset}>{preview}</DragPreviewContainer>
    </DragLayerContainer>
  )
}
