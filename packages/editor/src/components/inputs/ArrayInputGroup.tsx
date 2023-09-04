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

import AddTwoToneIcon from '@mui/icons-material/AddTwoTone'
import RemoveTwoToneIcon from '@mui/icons-material/RemoveTwoTone'
import { IconButton } from '@mui/material'
import React from 'react'
import InputGroup from './InputGroup'
import NumericInput from './NumericInput'
import StringInput from './StringInput'
export interface ArrayInputGroupProp {
  name?: string
  prefix?: string
  isStringInput?: boolean
  label?: any
  values: string[]
  onChange?: (values: string[]) => void
  acceptFileTypes?: any
  itemType?: any
}

export interface ArrayInputGroupState {
  count: number
  values: string[]
}

const groupContainerStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: '#9fa4b5',
  whiteSpace: 'pre-wrap',
  padding: '0 8px 8px'
}

const arrayInputGroupContentStyle: React.CSSProperties = {
  margin: '4px 0px',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column'
}

const labelStyle = {
  maxWidth: '20%'
}

const inputStyle = {
  maxWidth: '80%',
  margin: 0
}

const divStyle = {
  maxWidth: '80%'
}
// + button on first - button on rest
const ArrayInputGroup = ({
  name,
  isStringInput,
  prefix,
  label,
  values,
  onChange,
  acceptFileTypes,
  itemType,
  ...rest
}: ArrayInputGroupProp) => {
  let count = 0
  if (values && values.length) count = values.length
  const onChangeSize = (textSize: string, values: string[], onChange?: any) => {
    // copy the array to prevent https://hookstate.js.org/docs/exceptions/#hookstate-202
    const valuesCopy = [...values] as string[]
    const preCount = valuesCopy.length
    const count = parseInt(textSize)
    if (isNaN(count) || preCount === count) return
    if (preCount > count) {
      valuesCopy.splice(count)
    } else {
      for (let i = 0; i < count - preCount; i++) {
        valuesCopy.push('')
      }
    }
    onChange?.(valuesCopy)
  }

  const onChangeText = (text: string, index: number, values: string[], onChange?: any) => {
    // copy the array to prevent https://hookstate.js.org/docs/exceptions/#hookstate-202
    const valuesCopy = [...values]
    valuesCopy[index] = text
    onChange?.(valuesCopy)
  }

  const onClickAdd = (e) => {
    onChangeSize(String(values.length + 1), values, onChange)
  }

  const onClickRemove = (e, index) => {
    const valuesCopy = [...values] as string[]
    valuesCopy.splice(index, 1)
    onChange?.(valuesCopy)
  }
  return (
    <>
      <InputGroup name={name!} label={label} {...rest}>
        <NumericInput
          prefix="Size:"
          value={count}
          min={1}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          displayPrecision={0}
          onChange={(value) => {
            onChangeSize(value, values, onChange)
          }}
          {...{ style: { paddingLeft: '5px' } }}
        />
        <IconButton sx={{ padding: 0 }} onClick={onClickAdd} children={<AddTwoToneIcon />} />
      </InputGroup>
      {values &&
        values.map(function (value, index) {
          return (
            <InputGroup name="" label={` ${prefix}${index + 1} `} {...rest}>
              {isStringInput ? (
                <StringInput
                  value={value}
                  onChange={(e) => {
                    onChangeText(e.target.value, index, values, onChange)
                  }}
                  {...rest}
                />
              ) : (
                <StringInput
                  value={value}
                  onChange={(e) => {
                    onChangeText(e.target.value, index, values, onChange)
                  }}
                  {...rest}
                />
              )}
              <IconButton
                sx={{ padding: 0 }}
                onClick={(e) => onClickRemove(e, index)}
                children={<RemoveTwoToneIcon />}
              />
            </InputGroup>
          )
        })}
    </>
  )
}

export default ArrayInputGroup
