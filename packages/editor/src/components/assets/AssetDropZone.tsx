import React from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import { ItemTypes } from '../../constants/AssetTypes'
import useUpload from './useUpload'

/**
 * DropZoneBackground provides styles for the view port area where we drag and drop objects.
 *
 * @author Robert Long
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
  opacity: ${({ isOver, canDrop }) => (isOver && canDrop ? '1' : '0')};
  pointer-events: ${({ isDragging }) => (isDragging ? 'auto' : 'none')};

  h3 {
    font-size: 1.5em;
    margin-top: 12px;
  }
`

interface AssetDropZoneProp {
  afterUpload?: any
  uploadOptions?: any
}

/**
 * AssetDropZone function used to create view port where we can drag and drop objects.
 *
 * @author Robert Long
 * @param       {any} afterUpload
 * @param       {any} uploadOptions
 * @constructor
 */
export function AssetDropZone({ afterUpload }: AssetDropZoneProp) {
  const { t } = useTranslation()

  const onUpload = useUpload()

  const [{ canDrop, isOver, isDragging }, onDropTarget] = useDrop({
    accept: [ItemTypes.File],
    drop(item: any, monitor) {
      const dndItem: any = monitor.getItem()
      const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

      onUpload(entries).then((assets) => {
        if (assets) {
          if (afterUpload) {
            afterUpload(assets)
          }
        }
      })
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isDragging: monitor.getItem() !== null && monitor.canDrop()
    })
  })

  //returning dropzone view
  return (
    <DropZoneBackground ref={onDropTarget} isDragging={isDragging} canDrop={canDrop} isOver={isOver}>
      <CloudUploadIcon fontSize="large" />
      <h3>{t('editor:asset.dropZone.title')}</h3>
    </DropZoneBackground>
  )
}

export default AssetDropZone
