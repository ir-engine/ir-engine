import React from 'react'

import { CustomScriptFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { StringInputProps } from './StringInput'

/**
 * ScriptInput used to render component view for script inputs.
 *
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function ScriptInput({ onChange, ...rest }: StringInputProps) {
  return (
    <FileBrowserInput
      acceptFileTypes={CustomScriptFileTypes}
      acceptDropItems={ItemTypes.Scripts}
      onChange={onChange}
      {...rest}
    />
  )
}

export default ScriptInput
