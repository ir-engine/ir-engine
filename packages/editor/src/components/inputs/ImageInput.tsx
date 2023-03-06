import React from 'react'

import { ImageFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { StringInputProps } from './StringInput'

/**
 * ImageInput used to render component view for image inputs.
 *
 * @param       {Function} onChange
 * @param       {any} rest
 * @constructor
 */
export function ImageInput({ onChange, ...rest }: StringInputProps) {
  return (
    <FileBrowserInput
      acceptFileTypes={ImageFileTypes}
      acceptDropItems={ItemTypes.Images}
      onChange={onChange}
      {...rest}
    />
  )
}

export default ImageInput
