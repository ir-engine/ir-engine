import React, { useState } from 'react'
import Input from './Input'
import styled from 'styled-components'
import { Check } from '@styled-icons/fa-solid'

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
    background-color: ${(props) => props.theme.disabled};
    color: ${(props) => props.theme.disabledText};
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
  margin: 4px;
  cursor: pointer;
  display: block;
  position: relative;
`

/**
 * BooleanCheck used to provide styles for check icon.
 *
 * @author Robert Long
 * @type {styled component}
 */
const BooleanCheck = (styled as any)(Check)`
  position: absolute;
  top: 3px;
  left: 2px;
  color: ${(props) => props.theme.blue};
`

interface BooleanInputProp {
  id?: string
  value: any
  onChange: Function
}

/**
 * BooleanInput component used to provide view for checkbox.
 *
 * @author Robert Long
 * @type {functional component}
 */
const BooleanInput = (props: BooleanInputProp) => {
  //initializing checkboxId for BooleanInput
  let [checkboxId, SetCheckboxId] = useState(`boolean-input-${uniqueId++}`)

  // function handling changes in BooleanInput
  const onChange = (e) => {
    props?.onChange(e.target.checked)
  }

  //initializing variables using props of component
  const { value, ...rest } = props

  // returing view for BooleanInput component
  return (
    <div>
      <StyledBooleanInput {...rest} id={checkboxId} type="checkbox" checked={props.value} onChange={onChange} />
      <BooleanInputLabel htmlFor={checkboxId}>{value && <BooleanCheck size={12} />}</BooleanInputLabel>
    </div>
  )
}

export default BooleanInput

BooleanInput.defaultProps = {
  value: false,
  onChange: () => {}
}
