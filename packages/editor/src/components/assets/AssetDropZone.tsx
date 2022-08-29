import React from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Vector2 } from 'three'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

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
            const transformComponent = getComponent(node.entity, TransformComponent)
            if (transformComponent) {
              getCursorSpawnPosition(mousePos, transformComponent.position)
              dispatchAction(SelectionAction.changedObject({ objects: [node], propertyName: 'position' }))
            }
          })
        })
      } else {
        // When user drags files from files panel
        const node = await addMediaNode(item.url)
        const transformComponent = getComponent(node.entity, TransformComponent)
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
