import React from 'react'
import StringInput from './StringInput'
import { useDrop } from 'react-dnd'
import { ItemTypes } from '../../constants/AssetTypes'
import useUpload from '../assets/useUpload'
import { AudioFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

/**
 * Initializing uploadOptions properties.
 *
 * @author Robert Long
 * @type {Object}
 */
const uploadOptions = {
  multiple: false,
  accepts: AudioFileTypes
}

/**
 * AudioInput used to provide view.
 *
 * @author Robert Long
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function AudioInput({ onChange, ...rest }) {
  const onUpload = useUpload(uploadOptions)
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Audio, ItemTypes.File],
    drop(item) {
      if ((item as any).type === ItemTypes.Audio) {
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

  /**
   * Retuning view for AudioInput.
   *
   * @author Robert Long
   */
  return (
    <StringInput ref={dropRef} onChange={onChange} error={isOver && !canDrop} canDrop={isOver && canDrop} {...rest} />
  )
}

export default AudioInput
