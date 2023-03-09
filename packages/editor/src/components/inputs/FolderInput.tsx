import React from 'react'

import { AllFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { StringInputProps } from './StringInput'

/**
 * FolderInput used to render component view for folder inputs.
 *
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function FolderInput({ onChange, ...rest }: StringInputProps) {
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
