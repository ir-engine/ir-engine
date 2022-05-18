import React from 'react'

import { VideoFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'

/**
 * VideoInput used to render component view for video inputs.
 *
 * @author Robert Long
 * @author Hanzla Mateen
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function VideoInput({ onChange, ...rest }) {
  return (
    <FileBrowserInput
      acceptFileTypes={VideoFileTypes}
      acceptDropItems={ItemTypes.Videos}
      onChange={onChange}
      {...rest}
    />
  )
}

export default VideoInput
