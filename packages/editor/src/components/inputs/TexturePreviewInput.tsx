/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { Fragment } from 'react'
import { ColorSpace, LinearSRGBColorSpace, SRGBColorSpace, Texture, Vector2 } from 'three'

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { ImageFileTypes, VideoFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { AssetClass } from '@etherealengine/engine/src/assets/enum/AssetClass'
import { useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'

import { Stack } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { ImageContainer } from './ImagePreviewInput'
import InputGroup from './InputGroup'
import SelectInput from './SelectInput'
import { StringInputProps } from './StringInput'
import Vector2Input from './Vector2Input'

/**
 * VideoInput used to render component view for video inputs.
 *
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function TextureInput({ onChange, ...rest }: StringInputProps) {
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
        {texture?.isTexture && (
          <>
            <InputGroup name="Encoding" label="Encoding">
              <SelectInput
                value={texture.colorSpace}
                options={[
                  { label: 'Linear', value: LinearSRGBColorSpace },
                  { label: 'sRGB', value: SRGBColorSpace }
                ]}
                onChange={(value: ColorSpace) => {
                  texture.colorSpace = value
                  texture.needsUpdate = true
                }}
              />
            </InputGroup>
          </>
        )}
        {value && (
          <>
            <div>
              <Button
                onClick={() => {
                  onChange('')
                }}
              >
                Clear
              </Button>
            </div>
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
