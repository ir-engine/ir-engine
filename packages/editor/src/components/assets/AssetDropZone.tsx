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
import { Vector2, Vector3 } from 'three'

import { LocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { getCursorSpawnPosition } from '../../functions/screenSpaceFunctions'
import useUpload from './useUpload'

const dropZoneBackgroundStyle = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  justifyContent: 'center',
  alignItems: 'center'
}

const h3Style = {
  fontSize: '1.5em',
  marginTop: '12px',
  fontWeight: 'normal'
}

export function AssetDropZone() {
  const { t } = useTranslation()

  const onUpload = useUpload()

  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    accept: [...SupportedFileTypes],
    drop(item: any, monitor) {
      const mousePos = monitor.getClientOffset() as Vector2

      if (item.files) {
        // When user drags files from her file system
        const entries = Array.from(item.items).map((item: any) => item.webkitGetAsEntry())

        onUpload(entries).then((assets) => {
          if (!assets) return

          assets.map((asset) => {
            const vec3 = new Vector3()
            getCursorSpawnPosition(mousePos, vec3)
            addMediaNode(asset, undefined, undefined, [
              { name: LocalTransformComponent.jsonID, props: { position: vec3 } }
            ])
          })
        })
      } else {
        // When user drags files from files panel
        const vec3 = new Vector3()
        getCursorSpawnPosition(mousePos, vec3)
        addMediaNode(item.url, undefined, undefined, [
          { name: LocalTransformComponent.jsonID, props: { position: vec3 } }
        ])
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
    <div
      ref={onDropTarget}
      style={{
        ...(dropZoneBackgroundStyle as React.CSSProperties),
        opacity: isOver && canDrop && !isUploaded ? '1' : '0',
        pointerEvents: isDragging ? 'auto' : 'none'
      }}
    >
      <CloudUploadIcon fontSize="large" />
      <h3 style={h3Style}>{t('editor:asset.dropZone.title')}</h3>
    </div>
  )
}

export default AssetDropZone
