/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { ImageFileTypes } from '@ir-engine/engine/src/assets/constants/fileTypes'
import { ImageLink, ImageLinkProps } from '@ir-engine/ui/editor'
import React from 'react'
import { useDrop } from 'react-dnd'
import { twMerge } from 'tailwind-merge'
import { ItemTypes } from '../../constants/AssetTypes'
import useUpload from './useUpload'

const acceptDropItems = [...ItemTypes.Images, ItemTypes.File]

export interface DroppableImageInputProps extends Omit<ImageLinkProps, 'onBlur'> {
  onBlur: (value: string) => void
}

/**
 * allows dropping of a file/asset and takes care of uploading it
 */
export default function DroppableImageInput({ onBlur, ...props }: DroppableImageInputProps) {
  const onUpload = useUpload({
    multiple: false,
    accepts: ImageFileTypes
  })

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: acceptDropItems,
    async drop(item: any, monitor) {
      const isDropType = acceptDropItems.find((element) => element === item.type)
      if (isDropType) {
        onBlur(item.url)
      } else {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        onUpload(entries).then((assets) => {
          if (assets) {
            onBlur(assets[0])
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
    <div className={twMerge('rounded-[10px]', canDrop && isOver && 'border border-dotted border-white')} ref={dropRef}>
      <ImageLink onBlur={onBlur} {...props} />
    </div>
  )
}
