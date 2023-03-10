import React from 'react'

import { AudioFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { StringInputProps } from './StringInput'

/**
 * AudioInput used to render component view for audio inputs.
 *
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function AudioInput({ onChange, ...rest }: StringInputProps) {
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
