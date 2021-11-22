import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import React from 'react'
import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'

/**
 * FolderInput used to render component view for folder inputs.
 *
 * @author Hanzla Mateen
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function FolderInput({ onChange, ...rest }) {
  return (
    <FileBrowserInput
      acceptFileTypes={AllFileTypes}
      acceptDropItems={[ItemTypes.Folder]}
      onChange={onChange}
      {...rest}
    />
  )
}

export default FolderInput
