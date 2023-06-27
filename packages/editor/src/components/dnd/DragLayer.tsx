/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useDragLayer } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ItemTypes } from '../../constants/AssetTypes'

/**
 * DragLayerContainer used as wrapper for DragPreviewContainer.
 *
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
 * @type {Styled component}
 */
const DragPreviewContainer = (styled as any).div.attrs((props) => ({
  style: {
    transform: `translate(${props.offset.x}px, ${props.offset.y}px)`
  }
}))`
  background-color: var(--blue);
  opacity: 0.3;
  color: var(--textColor);
  padding: 4px;
  border-radius: 4px;
  display: inline-block;
`

/**
 * DragLayer component used to provide area in editor where we can drag and drop elements.
 *
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
      preview = <div>{item.value?.name || 'Node'}</div>
    }
  } else {
    // showing item type
    preview = <div>{item.prefabType}</div>
  }

  // returning DragLayer view
  return (
    <DragLayerContainer>
      <DragPreviewContainer offset={currentOffset}>{preview}</DragPreviewContainer>
    </DragLayerContainer>
  )
}
