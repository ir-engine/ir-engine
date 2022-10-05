import React, { Fragment } from 'react'
import { Texture, Vector2 } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { ImageFileTypes, VideoFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { AssetClass } from '@xrengine/engine/src/assets/enum/AssetClass'
import { useHookstate } from '@xrengine/hyperflux'

import { Stack } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { ImageContainer } from './ImagePreviewInput'
import InputGroup from './InputGroup'
import Vector2Input from './Vector2Input'

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

export default function TexturePreviewInput({
  value,
  onChange,
  ...rest
}: {
  value: string | Texture
  onChange: (value: any) => void
  preview?: string
}) {
  const previewStyle = {
    maxWidth: '128px',
    maxHeight: '128px',
    width: 'auto',
    height: 'auto'
  }
  const { preview } = rest
  const validSrcValue =
    typeof value === 'string' && [AssetClass.Image, AssetClass.Video].includes(AssetLoader.getAssetClass(value))
  const texture = value as Texture
  const src = value as string
  const showPreview = preview !== undefined || validSrcValue
  const previewSrc = validSrcValue ? value : preview
  const inputSrc = validSrcValue
    ? value
    : texture?.isTexture
    ? texture.source?.data?.src ?? texture?.userData?.src ?? (preview ? 'BLOB' : '')
    : src
  const offset = useHookstate(typeof texture?.offset?.clone === 'function' ? texture.offset.clone() : new Vector2(0, 0))
  const scale = useHookstate(typeof texture?.repeat?.clone === 'function' ? texture.repeat.clone() : new Vector2(1, 1))
  return (
    <ImageContainer>
      <Stack>
        <TextureInput value={inputSrc} onChange={onChange} />
        {showPreview && (
          <Fragment>
            {(typeof preview === 'string' ||
              (typeof value === 'string' && AssetLoader.getAssetClass(value) === AssetClass.Image)) && (
              <img src={previewSrc} style={previewStyle} alt="" crossOrigin="anonymous" />
            )}
            {typeof value === 'string' && AssetLoader.getAssetClass(value) === AssetClass.Video && (
              <video src={previewSrc} style={previewStyle} />
            )}
          </Fragment>
        )}
        {texture?.isTexture && !texture.isRenderTargetTexture && (
          <>
            <Vector2Input
              value={offset.value}
              onChange={(_offset) => {
                offset.set(_offset)
                texture.offset.copy(_offset)
              }}
              uniformScaling={false}
            />
            <Vector2Input
              value={scale.value}
              onChange={(_scale) => {
                scale.set(_scale)
                texture.repeat.copy(_scale)
              }}
              uniformScaling={false}
            />
          </>
        )}
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
