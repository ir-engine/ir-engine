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
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Vector2 } from 'three'

import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@etherealengine/hyperflux'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { getCursorSpawnPosition } from '../../functions/screenSpaceFunctions'
import { SelectionAction } from '../../services/SelectionServices'
import useUpload from './useUpload'

/**
 * DropZoneBackground provides styles for the view port area where we drag and drop objects.
 *
 * @param {styled component}
 */
const DropZoneBackground = (styled as any).div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
  opacity: ${({ isOver, canDrop, isUploaded }) => (isOver && canDrop && !isUploaded ? '1' : '0')};
  pointer-events: ${({ isDragging }) => (isDragging ? 'auto' : 'none')};

  h3 {
    font-size: 1.5em;
    margin-top: 12px;
  }
`

/**
 * AssetDropZone function used to create view port where we can drag and drop objects.
 *
 * @param       {any} afterUpload
 * @param       {any} uploadOptions
 * @constructor
 */
export function AssetDropZone() {
  const { t } = useTranslation()

  const onUpload = useUpload()

  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    accept: [...SupportedFileTypes],
    async drop(item: any, monitor) {
      const mousePos = monitor.getClientOffset() as Vector2

      if (item.files) {
        // When user drags files from her file system
        const entries = Array.from(item.items).map((item: any) => item.webkitGetAsEntry())

        onUpload(entries).then((assets) => {
          if (!assets) return

          assets.map(async (asset) => {
            const node = await addMediaNode(asset)
            if (!node) return
            const transformComponent = getComponent(node, TransformComponent)
            if (transformComponent) {
              getCursorSpawnPosition(mousePos, transformComponent.position)
              dispatchAction(SelectionAction.changedObject({ objects: [node], propertyName: 'position' }))
            }
          })
        })
      } else {
        // When user drags files from files panel
        const node = await addMediaNode(item.url)
        if (!node) return
        const transformComponent = getComponent(node, TransformComponent)
        if (transformComponent) {
          getCursorSpawnPosition(mousePos, transformComponent.position)
          dispatchAction(SelectionAction.changedObject({ objects: [node], propertyName: 'position' }))
        }
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isUploaded: !monitor.getItem()?.files
    })
  })

  //returning dropzone view
  return (
    <DropZoneBackground
      ref={onDropTarget}
      isDragging={isDragging}
      canDrop={canDrop}
      isOver={isOver}
      isUploaded={isUploaded}
    >
      <CloudUploadIcon fontSize="large" />
      <h3>{t('editor:asset.dropZone.title')}</h3>
    </DropZoneBackground>
  )
}

export default AssetDropZone
