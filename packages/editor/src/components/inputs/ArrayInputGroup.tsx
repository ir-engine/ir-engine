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

const onChangeSize = (textSize: string, values: string[], onChange?: any) => {
  // copy the array to prevent https://hookstate.js.org/docs/exceptions/#hookstate-202
  let valuesCopy = [...values] as string[]
  let preCount = valuesCopy.length
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
  flexDirection: 'row'
}

const labelStyle = {
  maxWidth: '20%'
}

const inputStyle = {
  maxWidth: '80%'
}

const divStyle = {
  maxWidth: '80%'
}

const ArrayInputGroup = ({
  isStringInput,
  prefix,
  label,
  values,
  onChange,
  acceptFileTypes,
  itemType
}: ArrayInputGroupProp) => {
  let count = 0
  if (values && values.length) count = values.length

  return (
    <div style={groupContainerStyle}>
      <div style={arrayInputGroupContentStyle}>
        <label style={{ ...labelStyle, color: '#9FA4B5' }}>{label}:</label>
        <div style={divStyle}>
          <label> Size: </label>
          <input
            style={inputStyle}
            value={'' + count}
            onChange={(e) => {
              onChangeSize(e.target.value, values, onChange)
            }}
          />
        </div>
        {values &&
          values.map(function (value, index) {
            return (
              <div key={index} style={{ ...arrayInputGroupContentStyle, margin: '4px 0px' }}>
                <label>
                  {' '}
                  {prefix} {index + 1}:{' '}
                </label>
                {isStringInput ? (
                  <input
                    style={inputStyle}
                    value={value}
                    onChange={(e) => {
                      onChangeText(e.target.value, index, values, onChange)
                    }}
                  />
                ) : (
                  <input
                    style={inputStyle}
                    value={value}
                    onChange={(e) => {
                      onChangeText(e.target.value, index, values, onChange)
                    }}
                  />
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default ArrayInputGroup
