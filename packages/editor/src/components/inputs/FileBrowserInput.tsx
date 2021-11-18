import React from 'react'
import { ControlledStringInput } from './StringInput'
import { useDrop } from 'react-dnd'
import useUpload from '../assets/useUpload'
import { ItemTypes } from '../../constants/AssetTypes'

/**
 * Function component used for rendering FileBrowserInput.
 *
 * @author Hanzla Mateen
 * @param {function} onChange
 * @param {any} rest
 * @returns
 */
export function FileBrowserInput({ onChange, acceptFileTypes, acceptDropItems, ...rest }) {
  const uploadOptions = {
    multiple: false,
    accepts: acceptFileTypes
  }
  const onUpload = useUpload(uploadOptions)

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [...acceptDropItems, ItemTypes.File],
    drop(item: any) {
      const isDropType = acceptDropItems.find((element) => element === item.type)
      if (isDropType) {
        onChange(item.url, item.initialProps || {})
      } else {
        onUpload(item.files).then((assets) => {
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
      onChange={(value, e) => onChange(value, {}, e)}
      error={isOver && !canDrop}
      canDrop={isOver && canDrop}
      {...rest}
    />
  )
}

export default FileBrowserInput
