import React, { Component } from 'react'
import { InputGroupVerticalContainer, InputGroupVerticalContent, InputGroupContent, InputGroupInfo } from './InputGroup'
import StringInput from './StringInput'

export interface ArrayInputGroupProp {
  name?: string
  prefix?: string
  label?: any
  values?: any
  onChange?: Function
}

export interface ArrayInputGroupState {
  count: number
  values: any
}

/**
 *
 * @author Ron Oyama
 */

const onChangeSize = (text, values, onChange) => {
  const count = parseInt(text)
  let preCount = 0
  if (!values) {
    values = []
  } else {
    preCount = values.length
  }
  if (count == undefined || preCount == count) return
  if (preCount > count) {
    values.splice(count)
  } else {
    for (let i = 0; i < count - preCount; i++) {
      values.push('')
    }
  }
  preCount = count
  onChange(values)
}

const onChangeText = (text, index, values, onChange) => {
  values[index] = text
  onChange(values)
}

export function ArrayInputGroup({ prefix, label, values, onChange }: ArrayInputGroupProp) {
  let count = 0
  if (values && values.length) count = values.length.toString()
  return (
    <InputGroupVerticalContainer>
      <label>{label}:</label>
      <InputGroupVerticalContent>
        <InputGroupContent style={{ margin: '4px 0px' }}>
          <label style={{ width: '30%' }}>Size:</label>
          <StringInput
            value={count}
            onChange={(text) => {
              onChangeSize(text, values, onChange)
            }}
          />
        </InputGroupContent>
        {values &&
          values.map(function (value, index) {
            return (
              <InputGroupContent key={index} style={{ margin: '4px 0px' }}>
                <label style={{ width: '30%' }}>
                  {prefix} {index}:
                </label>
                <StringInput
                  value={value}
                  onChange={(text) => {
                    onChangeText(text, index, values, onChange)
                  }}
                />
              </InputGroupContent>
            )
          })}
      </InputGroupVerticalContent>
    </InputGroupVerticalContainer>
  )
}

export default ArrayInputGroup
