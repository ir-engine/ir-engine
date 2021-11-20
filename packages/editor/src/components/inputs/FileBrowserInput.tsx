import React from 'react'
import { ControlledStringInput } from './StringInput'
import { DropTargetMonitor, useDrop } from 'react-dnd'
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
    async drop(item: any, monitor) {
      const isDropType = acceptDropItems.find((element) => element === item.type)
      if (isDropType) {
        onChange(item.url, item.initialProps || {})
      } else {
        // https://github.com/react-dnd/react-dnd/issues/1345#issuecomment-538728576
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        onUpload(entries).then((assets) => {
          for (let index = 0; index < assets.length; index++) {
            onChange(assets[index].url, {})
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
