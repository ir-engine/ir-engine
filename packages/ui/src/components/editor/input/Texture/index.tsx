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

import React, { Fragment, useEffect } from 'react'
import { ColorSpace, DisplayP3ColorSpace, LinearSRGBColorSpace, SRGBColorSpace, Texture, Vector2 } from 'three'

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { ImageFileTypes, VideoFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { AssetClass } from '@etherealengine/engine/src/assets/enum/AssetClass'
import { useHookstate } from '@etherealengine/hyperflux'

import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import Button from '../../../../primitives/tailwind/Button'
import FileBrowserInput from '../FileBrowser'
import InputGroup from '../Group'
import { ImageContainer } from '../Image/Preview'
import SelectInput from '../Select'
import { StringInputProps } from '../String'
import { Vector2Input } from '../Vector2'

/**
 * VideoInput used to render component view for video inputs.
 */
export function TextureInput({ ...rest }: StringInputProps) {
  return (
    <FileBrowserInput
      acceptFileTypes={[...ImageFileTypes, ...VideoFileTypes]}
      acceptDropItems={[...ItemTypes.Images, ...ItemTypes.Videos]}
      {...rest}
    />
  )
}

export default function TexturePreviewInput({
  value,
  onRelease,
  ...rest
}: {
  value: string | Texture
  onRelease: (value: any) => void
  preview?: string
}) {
  const { preview } = rest
  const validSrcValue =
    typeof value === 'string' && [AssetClass.Image, AssetClass.Video].includes(AssetLoader.getAssetClass(value))

  const srcState = useHookstate(value)
  const texture = srcState.value as Texture
  const src = srcState.value as string
  const showPreview = preview !== undefined || validSrcValue
  const previewSrc = validSrcValue ? value : preview
  const inputSrc = validSrcValue
    ? value
    : texture?.isTexture
    ? texture.source?.data?.src ?? texture?.userData?.src ?? (preview ? 'BLOB' : '')
    : src
  const offset = useHookstate(typeof texture?.offset?.clone === 'function' ? texture.offset.clone() : new Vector2(0, 0))
  const scale = useHookstate(typeof texture?.repeat?.clone === 'function' ? texture.repeat.clone() : new Vector2(1, 1))
  const colorspace = useHookstate(
    texture?.colorSpace ? texture?.colorSpace : (new String(LinearSRGBColorSpace) as ColorSpace)
  )

  useEffect(() => {
    if (texture?.isTexture && !texture.isRenderTargetTexture) {
      offset.set(texture.offset)
      scale.set(texture.repeat)
      colorspace.set(texture.colorSpace)
    }
  }, [srcState])

  return (
    <ImageContainer>
      <div className="flex w-full flex-col items-start justify-start gap-1 rounded bg-neutral-800 p-1">
        {showPreview && (
          <div className="relative h-full max-h-[274px] w-full max-w-[305px]">
            <div className="flex max-h-[274px] max-w-[305px] justify-center rounded bg-zinc-900">
              <div className="h-auto w-auto rounded bg-neutral-900">
                <Fragment>
                  {(typeof preview === 'string' ||
                    (typeof value === 'string' && AssetLoader.getAssetClass(value) === AssetClass.Image)) && (
                    <img
                      src={previewSrc}
                      className="h-full w-full rounded object-contain"
                      alt=""
                      crossOrigin="anonymous"
                    />
                  )}
                  {typeof value === 'string' && AssetLoader.getAssetClass(value) === AssetClass.Video && (
                    <video src={previewSrc} className="h-full w-full rounded object-contain" />
                  )}
                </Fragment>
              </div>
            </div>
          </div>
        )}
        <div className="inline-flex items-end justify-center gap-2.5 self-stretch rounded bg-neutral-900 px-2 py-1">
          <TextureInput value={inputSrc} onRelease={onRelease} />
        </div>
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
                currentValue={colorspace.value}
                options={[
                  { label: 'Linear', value: LinearSRGBColorSpace },
                  { label: 'sRGB', value: SRGBColorSpace },
                  { label: 'displayP3', value: DisplayP3ColorSpace }
                ]}
                onChange={(value: ColorSpace) => {
                  colorspace.set(value)
                  texture.colorSpace = value
                  texture.needsUpdate = true
                  console.log('DEBUG changed space', texture.colorSpace)
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
                  onRelease('')
                }}
              >
                Clear
              </Button>
            </div>
          </>
        )}
      </div>
    </ImageContainer>
  )
}

export function TexturePreviewInputGroup({ name, label, value, onRelease, ...rest }) {
  return (
    <InputGroup name={name} label={label} {...rest}>
      <TexturePreviewInput value={value} onRelease={onRelease} />
    </InputGroup>
  )
}
