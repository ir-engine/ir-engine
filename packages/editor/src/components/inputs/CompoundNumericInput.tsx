import React from 'react'
import styled from 'styled-components'

import NumericInput, { NumericInputProp } from './NumericInput'
import Slider from './Slider'

/**
 * StyledCompoundNumericInput used to provide styles for CompoundNumericInput.
 *
 * @type {Styled component}
 */
const StyledCompoundNumericInput = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

/**
 * CompoundNumericInput used to render the view of component.
 *
 * @param       {number} value
 * @param       {function} onChange
 * @param       {any} extras
 * @constructor
 */
export function CompoundNumericInput({
  value,
  onChange,
  ...extras
}: NumericInputProp & { step: number; style?: React.CSSProperties }) {
  const { min, max, step, style } = extras
  return (
    <StyledCompoundNumericInput style={style}>
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
