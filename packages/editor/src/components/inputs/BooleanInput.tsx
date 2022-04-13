import React, { useState } from 'react'
import styled from 'styled-components'

import CheckIcon from '@mui/icons-material/Check'

import Input from './Input'

let uniqueId = 0

/**
 * StyledBooleanInput used to provide styles to input box element.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const StyledBooleanInput = (styled as any).input`
  display: none;

  :disabled ~ label {
    opacity: 0.8;
    filter: grayscale(0.8);
    cursor: initial
  }
`

/**
 * BooleanInputLabel used to provide styles to label.
 *
 * @author Robert Long
 * @type {styled component}
 */
const BooleanInputLabel = (styled as any)(Input).attrs(() => ({ as: 'label' }))`
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
 * @author Robert Long
 * @type {styled component}
 */
const BooleanCheck = (styled as any)(CheckIcon)`
  width: 100%;
  height: auto;
  color: var(--purpleColor);
`

interface BooleanInputProp {
  id?: string
  value: any
  onChange: Function
  disabled?: boolean
}

/**
 * BooleanInput component used to provide view for checkbox.
 *
 * @author Robert Long
 * @type {functional component}
 */
export const BooleanInput = (props: BooleanInputProp) => {
  //initializing checkboxId for BooleanInput
  const [checkboxId, setCheckboxId] = useState(`boolean-input-${uniqueId++}`)

  // function handling changes in BooleanInput
  const onChange = (e) => {
    if (e.key) {
      if (e.key === 'Enter' || e.key === ' ') props?.onChange(!props.value)
      return
    }

    props?.onChange(e.target.checked)
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
      <BooleanInputLabel htmlFor={checkboxId} tabIndex={0} onKeyPress={onChange}>
        {props.value && <BooleanCheck size={12} />}
      </BooleanInputLabel>
    </div>
  )
}

export default BooleanInput

BooleanInput.defaultProps = {
  value: false,
  onChange: () => {}
}
