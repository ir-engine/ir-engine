import React from 'react'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { ImageFileTypes, VideoFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { AssetClass } from '@xrengine/engine/src/assets/enum/AssetClass'

import { Stack } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { ImageContainer } from './ImagePreviewInput'
import InputGroup from './InputGroup'

/**
 * VideoInput used to render component view for video inputs.
 *
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function TextureInput({ onChange, ...rest }) {
  return (
    <FileBrowserInput
      acceptFileTypes={[...ImageFileTypes, ...VideoFileTypes]}
      acceptDropItems={[...ItemTypes.Images, ...ItemTypes.Videos]}
      onChange={onChange}
      {...rest}
    />
  )
}

export default function TexturePreviewInput({ value, onChange, ...rest }) {
  const previewStyle = {
    maxWidth: '128px',
    maxHeight: '128px',
    width: 'auto',
    height: 'auto'
  }
  const { preview } = rest
  const src = preview ?? value
  return (
    <ImageContainer>
      <Stack>
        <TextureInput value={src} onChange={onChange} />
        {(preview || AssetLoader.getAssetClass(value) === AssetClass.Image) && (
          <img src={src} style={previewStyle} alt="" crossOrigin="anonymous" />
        )}
        {(preview || AssetLoader.getAssetClass(value) === AssetClass.Video) && <video src={src} style={previewStyle} />}
      </Stack>
    </ImageContainer>
  )
}

export function TexturePreviewInputGroup({ name, label, value, onChange, ...rest }) {
  return (
    <InputGroup name={name} label={label} {...rest}>
      <TexturePreviewInput value={value} onChange={onChange} />
    </InputGroup>
  )
}
