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

import { t } from 'i18next'
import React from 'react'
import styles from './ArrayInputGroup.module.scss'
import FileBrowserInput from './FileBrowserInput'
import InputGroup from './InputGroup'
import NumericStepperInput from './NumericStepperInput'

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

const ArrayInputGroup = ({
  prefix,
  label,
  values,
  onChange,
  acceptFileTypes,
  acceptDropItems
}: ArrayInputGroupProp) => {
  let count = 0
  if (values && values.length) count = values.length
  return (
    <InputGroup name="label" label={label} labelClasses={styles.sizeLabel}>
      <div className={styles.arrayInputGroupContent}>
        <InputGroup name="size" label={t('editor:properties.media.lbl-size')}>
          <NumericStepperInput
            value={count}
            onChange={(val) => onChangeSize(val, values, onChange)}
            mediumStep={1}
            displayPrecision={0}
          />
        </InputGroup>
        {values &&
          values.map((value, index) => (
            <InputGroup name={`${prefix} ${index + 1}`} label={`${prefix} ${index + 1}`} key={value + '' + index}>
              <FileBrowserInput
                value={value}
                onChange={(value) => onChangeText(value, index, values, onChange)}
                acceptFileTypes={acceptFileTypes}
                acceptDropItems={acceptDropItems}
              />
            </InputGroup>
          ))}
      </div>
    </InputGroup>
  )
}

export default ArrayInputGroup
