import React from 'react'
import { ItemTypes } from '../../constants/AssetTypes'
import { CustomScriptFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import FileBrowserInput from './FileBrowserInput'

/**
 * ScriptInput used to render component view for script inputs.
 *
 * @author Hanzla Mateen
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function ScriptInput({ onChange, ...rest }) {
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
