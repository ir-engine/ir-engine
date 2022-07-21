import React from 'react'

import { ModelFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'

/**
 * ModelInput used to render component view for script inputs.
 *
 * @param       {Function} onChange
 * @param       {any} rest
 * @constructor
 */
export function ModelInput({ onChange, ...rest }) {
  return (
    <FileBrowserInput
      acceptFileTypes={ModelFileTypes}
      acceptDropItems={ItemTypes.Models}
      onChange={onChange}
      {...rest}
    />
  )
}

export default ModelInput
