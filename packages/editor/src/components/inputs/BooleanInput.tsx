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

import React, { KeyboardEvent, useState } from 'react'
import styled from 'styled-components'

import CheckIcon from '@mui/icons-material/Check'

import Input from './Input'

let uniqueId = 0

/**
 * StyledBooleanInput used to provide styles to input box element.
 *
 * @type {Styled component}
 */
const StyledBooleanInput = styled.input`
  display: none;

  :disabled ~ label {
    opacity: 0.8;
    filter: grayscale(0.8);
    cursor: initial;
  }
`

/**
 * BooleanInputLabel used to provide styles to label.
 *
 * @type {styled component}
 */
const BooleanInputLabel = styled(Input)`
  width: 18px;
  height: 18px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
`

/**
 * BooleanCheck used to provide styles for check icon.
 *
 * @type {styled component}
 */
const BooleanCheck = styled(CheckIcon)`
  width: 100% !important;
  height: auto;
  color: var(--buttonTextColor);
`

interface BooleanInputProp {
  value: boolean
  onChange: Function
  disabled?: boolean
}

/**
 * BooleanInput component used to provide view for checkbox.
 *
 * @type {functional component}
 */
export const BooleanInput = (props: BooleanInputProp) => {
  const [checkboxId] = useState(() => `boolean-input-${uniqueId++}`)

  const onChange = (e) => {
    props.onChange(e.target.checked)
  }

  const onKeyPress = (e: KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === 'Enter' || e.key === ' ') props.onChange(!props.value)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <StyledBooleanInput
        id={checkboxId}
        type="checkbox"
        checked={props.value}
        onChange={onChange}
        disabled={props.disabled}
      />
      <BooleanInputLabel as="label" htmlFor={checkboxId} tabIndex={0} onKeyPress={onKeyPress}>
        {props.value && <BooleanCheck />}
      </BooleanInputLabel>
    </div>
  )
}

export default BooleanInput
