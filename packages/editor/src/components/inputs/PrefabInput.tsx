import React from 'react'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { StringInputProps } from './StringInput'

/**
 *
 *
 * @param       {Function} onChange
 * @param       {any} rest
 * @constructor
 */
function PrefabInput({ onChange, ...rest }: StringInputProps) {
  return (
    <FileBrowserInput
      acceptFileTypes={['xre.gltf']}
      acceptDropItems={['gltf', 'xre.gltf']}
      onChange={onChange}
      {...rest}
    />
  )
}

export default PrefabInput
