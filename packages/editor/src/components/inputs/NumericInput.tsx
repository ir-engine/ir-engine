import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { getStepSize, toPrecision } from '../../functions/utils'
import { clamp } from '@xrengine/engine/src/common/functions/MathLerpFunctions'
import { useRef } from 'react'
import { useState } from 'react'

/**
 *
 *
 * @author Robert Long
 * @param value
 * @param precision
 * @returns
 */
function toPrecisionString(value, precision) {
  if (precision && precision <= 1) {
    const numDigits = Math.abs(Math.log10(precision))
    const minimumFractionDigits = Math.min(numDigits, 2)
    const maximumFractionDigits = Math.max(minimumFractionDigits, numDigits)

    return value.toLocaleString('fullwide', {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping: false
    })
  } else {
    return value.toLocaleString('fullwide', { useGrouping: false })
  }
}

/**
 * @author Robert Long
 */
const NumericInputContainer = (styled as any).div`
  position: relative;
  display: flex;
  flex: 1;
  max-width: 100px;
`

/**
 * @author Robert Long
 */
const StyledNumericInput = (styled as any).input`
  display: flex;
  width: 100%;
  color: ${(props) => props.theme.text};
  background-color: ${(props) => props.theme.inputBackground};
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.border};
  padding-left: 6px;
  font-size: 12px;
  height: 24px;
  box-sizing: border-box;
  outline: none;
  padding-right: ${(props) => (props.unit ? props.unit.length * 6 + 10 + 'px' : 0)};

  &:hover {
    border-color: ${(props) => props.theme.blueHover};
  }

  &:focus {
    border-color: ${(props) => props.theme.blue};
  }

  &:disabled {
    background-color: ${(props) => props.theme.disabled};
    color: ${(props) => props.theme.disabledText};
  }
`

/**
 * @author Robert Long
 */
const NumericInputUnit = (styled as any).div`
  position: absolute;
  color: ${(props) => props.theme.text2};
  right: 1px;
  top: 1px;
  bottom: 1px;
  background-color: ${(props) => props.theme.inputBackground};
  padding: 0 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  line-height: 20px;
  height: 22px;
`

interface NumericInputProp {
  className?: any
  unit?: any
  displayPrecision?: any
  value?: any
  convertFrom?: any
  precision?: any
  mediumStep?: number
  onChange?: Function
  onCommit?: Function
  smallStep?: number
  largeStep?: number
  min?: number
  max?: number
  convertTo?: any
}

/**
 * @author Robert Long
 */
const NumericInput = (props: NumericInputProp) => {
  const [tempValue, setTempValue] = useState(null)
  const [focused, setFocused] = useState(false)
  const inputEl = useRef(null)

  const handleStep = (event, direction, focus = true) => {
    const { smallStep, mediumStep, largeStep, min, max, precision, convertTo, onChange, onCommit } = props

    const stepSize = event ? getStepSize(event, smallStep, mediumStep, largeStep) : mediumStep

    const nextValue = parseFloat(inputEl?.current?.value ?? 0) + stepSize * direction
    const clampedValue = clamp(nextValue, min, max)
    const roundedValue = precision ? toPrecision(clampedValue, precision) : nextValue
    const finalValue = convertTo(roundedValue)

    if (onCommit) {
      onCommit(finalValue)
    } else {
      onChange(finalValue)
    }

    setTempValue(
      roundedValue.toLocaleString('fullwide', {
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: Math.abs(Math.log10(precision)) + 1
      })
    )
    setFocused(focus)
  }

  const increment = () => {
    handleStep(null, 1, false)
  }

  const decrement = () => {
    handleStep(null, -1, false)
  }

  const handleKeyPress = (event) => {
    let direction = 0

    if (event.key === 'ArrowUp') {
      direction = 1
    } else if (event.key === 'ArrowDown') {
      direction = -1
    }

    if (!direction) return

    event.preventDefault()

    handleStep(event, direction, true)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }

  const handleChange = (event) => {
    const { min, max, precision, convertTo, onChange } = props

    const tempValue = event.target.value

    setTempValue(tempValue)
    setFocused(true)

    const parsedValue = parseFloat(tempValue)

    if (!Number.isNaN(parsedValue)) {
      const clampedValue = clamp(parsedValue, min, max)
      const roundedValue = precision ? toPrecision(clampedValue, precision) : clampedValue
      const finalValue = convertTo(roundedValue)
      onChange(finalValue)
    }
  }

  const handleFocus = () => {
    const { value, convertFrom, precision } = props

    setTempValue(
      convertFrom(value).toLocaleString('fullwide', {
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: Math.abs(Math.log10(precision)) + 1
      })
    )
    setFocused(true)

    inputEl?.current?.select()
  }

  const handleBlur = () => {
    const { value, onCommit, onChange } = props

    setTempValue(null)
    setFocused(false)

    if (onCommit) {
      onCommit(value)
    } else {
      onChange(value)
    }
  }

  const {
    className,
    unit,
    smallStep,
    mediumStep,
    largeStep,
    min,
    max,
    displayPrecision,
    value,
    convertTo,
    convertFrom,
    onChange,
    onCommit,
    ...rest
  } = props

  return (
    <NumericInputContainer>
      <StyledNumericInput
        {...rest}
        unit={unit}
        innerRef={inputEl}
        value={focused ? tempValue : toPrecisionString(convertFrom(value), displayPrecision)}
        onKeyUp={handleKeyPress}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {unit && <NumericInputUnit>{unit}</NumericInputUnit>}
    </NumericInputContainer>
  )
}

;(NumericInput as any).propTypes = {
  className: PropTypes.string,
  unit: PropTypes.node,
  smallStep: PropTypes.number.isRequired,
  mediumStep: PropTypes.number.isRequired,
  largeStep: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onCommit: PropTypes.func,
  convertTo: PropTypes.func.isRequired,
  convertFrom: PropTypes.func.isRequired,
  precision: PropTypes.number.isRequired,
  displayPrecision: PropTypes.number.isRequired
}
;(NumericInput as any).defaultProps = {
  value: 0,
  smallStep: 0.025,
  mediumStep: 0.1,
  largeStep: 0.25,
  min: -Infinity,
  max: Infinity,
  displayPrecision: 0.001,
  precision: Number.EPSILON,
  convertTo: (value) => value,
  convertFrom: (value) => value
}
;(NumericInput as any).defaultProps = {
  value: 0,
  smallStep: 0.025,
  mediumStep: 0.1,
  largeStep: 0.25,
  min: -Infinity,
  max: Infinity,
  displayPrecision: 0.001,
  precision: Number.EPSILON,
  convertTo: (value) => value,
  convertFrom: (value) => value
}

export default NumericInput
