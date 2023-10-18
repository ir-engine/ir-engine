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

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import AddIcon from '@mui/icons-material/Add'
import IconButton from '@mui/material/IconButton'
import React from 'react'
import styles from './ArrayInputGroup.module.scss'
import FileBrowserInput from './FileBrowserInput'
import InputGroup from './InputGroup'

export interface ArrayInputGroupProp {
  name?: string
  prefix?: string
  label?: any
  values: string[]
  onChange?: (values: string[]) => void
  acceptFileTypes?: any
  acceptDropItems?: any
}

export interface ArrayInputGroupState {
  count: number
  values: string[]
}

const ArrayInputGroup = ({
  prefix,
  label,
  values,
  onChange,
  acceptFileTypes,
  acceptDropItems
}: ArrayInputGroupProp) => {
  const addInput = (count = 1) => {
    const valuesCopy = [...values]
    for (let i = 0; i < count; i++) {
      valuesCopy.push('')
    }
    onChange?.(valuesCopy)
  }

  const deleteInput = (index: number) => {
    const valuesCopy = [...values]
    valuesCopy.splice(index, 1)
    onChange?.(valuesCopy)
  }

  const onChangeText = (text: string, index: number) => {
    // copy the array to prevent https://hookstate.js.org/docs/exceptions/#hookstate-202
    const valuesCopy = [...values]
    valuesCopy[index] = text
    onChange?.(valuesCopy)
  }

  return (
    <InputGroup name="label" label={label} labelClasses={styles.sizeLabel}>
      <div className={styles.arrayInputGroupContent}>
        <InputGroup name={`${prefix} 1`} label={`${prefix} 1`}>
          <FileBrowserInput
            value={values.length > 0 ? values[0] : ''}
            onChange={(value) => {
              if (values.length > 0) {
                onChangeText(value, 0)
              } else {
                addInput()
                onChangeText(value, 0)
              }
            }}
            acceptFileTypes={acceptFileTypes}
            acceptDropItems={acceptDropItems}
          />
          <IconButton
            disableRipple
            onClick={() => {
              if (values.length === 0) {
                addInput(2)
              } else {
                addInput(1)
              }
            }}
            style={{
              padding: 0
            }}
          >
            <AddIcon sx={{ color: 'var(--textColor)' }} />
          </IconButton>
        </InputGroup>
        {values &&
          values.length > 0 &&
          values.slice(1).map((value, index) => (
            <InputGroup name={`${prefix} ${index + 2}`} label={`${prefix} ${index + 2}`} key={value + '' + index}>
              <FileBrowserInput
                value={value}
                onChange={(value) => onChangeText(value, index + 1)}
                acceptFileTypes={acceptFileTypes}
                acceptDropItems={acceptDropItems}
              />
              <IconButton
                disableRipple
                style={{
                  padding: 0
                }}
                onClick={() => deleteInput(index + 1)}
              >
                <Icon type="Delete" style={{ color: 'var(--textColor)' }} />
              </IconButton>
            </InputGroup>
          ))}
      </div>
    </InputGroup>
  )
}

export default ArrayInputGroup
