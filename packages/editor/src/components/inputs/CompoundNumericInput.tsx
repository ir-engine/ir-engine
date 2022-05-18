import React from 'react'
import styled from 'styled-components'

import NumericInput from './NumericInput'
import Slider from './Slider'

/**
 * StyledCompoundNumericInput used to provide styles for CompoundNumericInput.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const StyledCompoundNumericInput = (styled as any).div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`

/**
 * CompoundNumericInput used to render the view of component.
 *
 * @author Robert Long
 * @param       {number} value
 * @param       {function} onChange
 * @param       {any} extras
 * @constructor
 */
export function CompoundNumericInput({ value, onChange, ...extras }) {
  const { min, max, step } = extras
  return (
    <StyledCompoundNumericInput>
      <Slider min={min} max={max} value={value} step={step} onChange={onChange} />
      <NumericInput {...extras} mediumStep={step} value={value} onChange={onChange} />
    </StyledCompoundNumericInput>
  )
}
CompoundNumericInput.defaultProps = {
  value: 0,
  onChange: () => {},
  min: 0,
  max: 1,
  step: 0.01
}

export default CompoundNumericInput
