import React from 'react'
import styled from 'styled-components'

import { Stack } from '@mui/material'

import ImageInput from './ImageInput'
import InputGroup from './InputGroup'

export const ImageContainer = (styled as any).div`
  display: flex;
  width: 100%;
  border-radius: 4px;
  border: solid;
  border-color: var(--inputOutline);
  margin: 8px;
  padding: 4px;
`

export default function ImagePreviewInput({ value, onChange, ...rest }) {
  return (
    <ImageContainer>
      <Stack>
        <ImageInput value={value} onChange={onChange} />
        <img
          src={value}
          style={{
            maxWidth: '128px',
            maxHeight: '128px',
            width: 'auto',
            height: 'auto'
          }}
        />
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
