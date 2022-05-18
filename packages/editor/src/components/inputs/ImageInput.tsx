import React from 'react'

import { ImageFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'

/**
 * ImageInput used to render component view for image inputs.
 *
 * @author Robert Long
 * @author Hanzla Mateen
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function ImageInput({ onChange, ...rest }) {
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
