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

import { ItemTypes } from '../../constants/AssetTypes'

const dragLayerContainerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: '99999',
  left: '0',
  right: '0',
  top: '0',
  bottom: '0'
}

const dragPreviewContainerStyles = (offset) => ({
  backgroundColor: 'var(--blue)',
  opacity: '0.3',
  color: 'var(--textColor)',
  padding: '4px',
  borderRadius: '4px',
  display: 'inline-block',
  transform: `translate(${offset.x}px, ${offset.y}px)`
})

export default function DragLayer() {
  const { t } = useTranslation()

  const { item, itemType, currentOffset, isDragging } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging()
  }))

  if (!isDragging || !currentOffset) {
    return null
  }

  let preview

  if (itemType === ItemTypes.Node) {
    if (item.multiple) {
      preview = <div>{t('editor:dnd.nodes', { count: item.value.length })}</div>
    } else {
      preview = <div>{item.value?.name || 'Node'}</div>
    }
  } else {
    preview = <div>{item.prefabType}</div>
  }

  return (
    <div style={dragLayerContainerStyles as React.CSSProperties}>
      <div style={dragPreviewContainerStyles(currentOffset)}>{preview}</div>
    </div>
  )
}
