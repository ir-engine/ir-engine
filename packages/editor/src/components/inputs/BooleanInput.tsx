import React, { KeyboardEvent, useState } from 'react'
import styled from 'styled-components'

import { State, useHookstate } from '@xrengine/hyperflux/functions/StateFunctions'

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
