import React from 'react'

import { AudioFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'

/**
 * AudioInput used to render component view for audio inputs.
 *
 * @author Robert Long
 * @author Hanzla Mateen
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function AudioInput({ onChange, ...rest }) {
  return (
    <FileBrowserInput
      acceptFileTypes={AudioFileTypes}
      acceptDropItems={ItemTypes.Audios}
      onChange={onChange}
      {...rest}
    />
  )
}

export default AudioInput
