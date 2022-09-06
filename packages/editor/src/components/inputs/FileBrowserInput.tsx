import React from 'react'
import { useDrop } from 'react-dnd'

import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'

import { ItemTypes } from '../../constants/AssetTypes'
import { AddCorsProxyButton } from '../AddCorsProxyButton'
import useUpload from '../assets/useUpload'
import { ControlledStringInput, StringInputProp } from './StringInput'

/**
 * Function component used for rendering FileBrowserInput.
 *
 * @param {function} onChange
 * @param {any} rest
 * @returns
 */
export function FileBrowserInput({
  onChange,
  acceptFileTypes,
  acceptDropItems,
  ...rest
}: StringInputProp & { acceptFileTypes: string[]; acceptDropItems: string[] }) {
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
        // Below url fix is applied when item is folder
        let url = item.url
        if (!url.endsWith(item.fullName)) {
          url += item.fullName
        }

        onChange?.(url, item)
      } else {
        // https://github.com/react-dnd/react-dnd/issues/1345#issuecomment-538728576
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        onUpload(entries).then((assets) => {
          if (assets) {
            for (let index = 0; index < assets.length; index++) {
              onChange?.(assets[index], item)
            }
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
    <>
      <ControlledStringInput
        ref={dropRef}
        onChange={(value, e) => onChange?.(value, {}, e)}
        error={isOver && !canDrop}
        canDrop={isOver && canDrop}
        {...rest}
      />
      <AddCorsProxyButton value={rest.value || ''} onAddCorsProxy={onChange} />
    </>
  )
}

export default FileBrowserInput
