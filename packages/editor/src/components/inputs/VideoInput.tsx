import React from 'react'
import { ControlledStringInput } from './StringInput'
import { useDrop } from 'react-dnd'
import { ItemTypes } from '../../constants/AssetTypes'
import useUpload from '../assets/useUpload'
import { VideoFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

const uploadOptions = {
  multiple: false,
  accepts: VideoFileTypes
}

/**
 *
 * @author Robert Long
 * @param {function} onChange
 * @param {any} rest
 * @returns
 */
export function VideoInput({ onChange, ...rest }) {
  const onUpload = useUpload(uploadOptions)
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Video, ItemTypes.File],
    drop(item) {
      if ((item as any).type === ItemTypes.Video) {
        onChange((item as any).value.url, (item as any).value.initialProps || {})
      } else {
        onUpload((item as any).files).then((assets) => {
          if (assets && assets.length > 0) {
            onChange(assets[0].url, {})
          }
        })
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  return (
    <ControlledStringInput
      ref={dropRef}
      onChange={onChange}
      error={isOver && !canDrop}
      canDrop={isOver && canDrop}
      {...rest}
    />
  )
}

export default VideoInput
