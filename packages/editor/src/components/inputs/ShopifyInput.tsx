import React from 'react'
import { ControlledStringInput } from './StringInput'
import { useDrop } from 'react-dnd'
import { ItemTypes } from '../../constants/AssetTypes'
import useUpload from '../assets/useUpload'
import { ShopifyFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

const uploadOptions = {
  multiple: false,
  accepts: ShopifyFileTypes
}

/**
 * Function component used for rendering ControlledStringInput.
 *
 * @author Robert Long
 * @param {function} onChange
 * @param {any} rest
 * @returns
 */
export function ShopifyInput({ onChange, ...rest }) {
  const onUpload = useUpload(uploadOptions)
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Shopify, ItemTypes.File],
    drop(item: any) {
      if (item.type === ItemTypes.Shopify) {
        onChange(item.value.url, item.value.initialProps || {})
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

export default ShopifyInput
