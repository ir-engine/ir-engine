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
