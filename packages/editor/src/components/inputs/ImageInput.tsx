import React from 'react'

import { ImageFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { StringInputProp } from './StringInput'

/**
 * ImageInput used to render component view for image inputs.
 *
 * @param       {Function} onChange
 * @param       {any} rest
 * @constructor
 */
export function ImageInput({ onChange, ...rest }: StringInputProp) {
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
