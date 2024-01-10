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

import React from 'react'

import { Stack } from '@mui/material'

import ImageInput from './ImageInput'
import InputGroup from './InputGroup'
import { StringInputProps } from './StringInput'

const imageContainerStyle = {
  width: '100%',
  borderRadius: '4px',
  border: 'solid',
  borderColor: 'var(--inputOutline)',
  margin: '8px',
  padding: '4px'
}

const imgStyle = {
  maxWidth: '128px',
  maxHeight: '128px',
  width: 'auto',
  height: 'auto'
}

export const ImageContainer = ({ children }) => {
  return <div style={imageContainerStyle}>{children}</div>
}

export default function ImagePreviewInput({ value, onChange, ...rest }: StringInputProps) {
  return (
    <ImageContainer>
      <Stack>
        <ImageInput value={value} onChange={onChange} />
        <img src={value} crossOrigin="anonymous" style={imgStyle} />
      </Stack>
    </ImageContainer>
  )
}

export function ImagePreviewInputGroup({ name, label, value, onChange, ...rest }) {
  return (
    <InputGroup name={name} label={label} {...rest}>
      <ImagePreviewInput value={value} onChange={onChange} />
    </InputGroup>
  )
}
