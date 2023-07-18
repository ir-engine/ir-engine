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
import styled from 'styled-components'

import FileBrowserInput from './FileBrowserInput'
import { InputGroupContent, InputGroupVerticalContainer, InputGroupVerticalContent } from './InputGroup'
import StringInput, { ControlledStringInput } from './StringInput'

export interface ArrayInputGroupProp {
  name?: string
  prefix?: string
  isStringInput?: boolean
  label?: any
  values: string[]
  onChange?: Function
  acceptFileTypes?: any
  itemType?: any
}

export interface ArrayInputGroupState {
  count: number
  values: string[]
}

const onChangeSize = (textSize: string, values: string[], onChange?: Function) => {
  // copy the array to prevent https://hookstate.js.org/docs/exceptions/#hookstate-202
  let valuesCopy = [...values] as string[]
  let preCount = valuesCopy.length
  console.log('onChangeSize', textSize, values, onChange)
  const count = parseInt(textSize)
  if (count == undefined || preCount == count) return
  if (preCount > count) {
    valuesCopy.splice(count)
  } else {
    for (let i = 0; i < count - preCount; i++) {
      valuesCopy.push('')
    }
  }
  onChange?.(valuesCopy)
}

const onChangeText = (text: string, index: number, values: string[], onChange?: Function) => {
  // copy the array to prevent https://hookstate.js.org/docs/exceptions/#hookstate-202
  const valuesCopy = [...values]
  valuesCopy[index] = text
  onChange?.(valuesCopy)
}

const GroupContainer = styled.label`
  background-color: $transparent;
  color: #9fa4b5;
  white-space: pre-wrap;
  padding: 0 8px 8px;
`

const ArrayInputGroupContent = (styled as any)(InputGroupContent)`
  margin: 4px 0px;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  & > label {
    max-width: 33.33333% !important;
  }
  & > input {
    max-width: 66.66666% !important;
  }
  & > div {
    max-width: 66.66666% !important;
  }
`

export function ArrayInputGroup({
  isStringInput,
  prefix,
  label,
  values,
  onChange,
  acceptFileTypes,
  itemType
}: ArrayInputGroupProp) {
  let count = 0
  if (values && values.length) count = values.length
  return (
    <GroupContainer>
      <InputGroupVerticalContainer>
        <label style={{ color: '#9FA4B5' }}>{label}:</label>
        <InputGroupVerticalContent>
          <ArrayInputGroupContent>
            <label> Size: </label>
            <ControlledStringInput
              value={'' + count}
              onChange={(text) => {
                onChangeSize(text, values, onChange)
              }}
            />
          </ArrayInputGroupContent>
          {values &&
            values.map(function (value, index) {
              return (
                <ArrayInputGroupContent key={index} style={{ margin: '4px 0px' }}>
                  <label>
                    {' '}
                    {prefix} {index + 1}:{' '}
                  </label>
                  {isStringInput ? (
                    <StringInput
                      value={value}
                      onChange={(text) => {
                        onChangeText(text, index, values, onChange)
                      }}
                    />
                  ) : (
                    <FileBrowserInput
                      value={value}
                      acceptFileTypes={acceptFileTypes}
                      acceptDropItems={itemType || []}
                      onChange={(text) => {
                        onChangeText(text, index, values, onChange)
                      }}
                    />
                  )}
                </ArrayInputGroupContent>
              )
            })}
        </InputGroupVerticalContent>
      </InputGroupVerticalContainer>
    </GroupContainer>
  )
}

export default ArrayInputGroup
