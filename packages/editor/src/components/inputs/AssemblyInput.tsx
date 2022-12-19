import React from 'react'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'

/**
 *
 *
 * @param       {Function} onChange
 * @param       {any} rest
 * @constructor
 */
function AssemblyInput({ onChange, ...rest }) {
  return (
    <FileBrowserInput acceptFileTypes={['.xre.gltf']} acceptDropItems={ItemTypes.ECS} onChange={onChange} {...rest} />
  )
}

export default AssemblyInput
