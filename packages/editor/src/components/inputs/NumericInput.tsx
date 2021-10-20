import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { getStepSize, toPrecision } from '../../functions/utils'
import { clamp } from '@xrengine/engine/src/common/functions/MathLerpFunctions'

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
  value?: any
  convertFrom?: any
  precision?: any
  mediumStep?: number
  onChange?: Function
}

/**
 * @author Robert Long
 */
export class NumericInput extends Component<NumericInputProp, {}> {
  constructor(props) {
    super(props)

    this.state = { tempValue: null, focused: false }
    this.inputEl = createRef()
  }

  inputEl: any

  increment() {
    this.handleStep(null, 1, false)
  }

  decrement() {
    this.handleStep(null, -1, false)
  }

  handleKeyPress = (event) => {
    let direction = 0

    if (event.key === 'ArrowUp') {
      direction = 1
    } else if (event.key === 'ArrowDown') {
      direction = -1
    }

    if (!direction) return

    event.preventDefault()

    this.handleStep(event, direction, true)
  }

  handleStep(event, direction, focus = true) {
    const { smallStep, mediumStep, largeStep, min, max, precision, convertTo, onChange, onCommit } = this.props as any

    const stepSize = event ? getStepSize(event, smallStep, mediumStep, largeStep) : mediumStep

    const nextValue = parseFloat(this.inputEl.current.value) + stepSize * direction
    const clampedValue = clamp(nextValue, min, max)
    const roundedValue = precision ? toPrecision(clampedValue, precision) : nextValue
    const finalValue = convertTo(roundedValue)

    if (onCommit) {
      onCommit(finalValue)
    } else {
      onChange(finalValue)
    }

    this.setState({
      tempValue: roundedValue.toLocaleString('fullwide', {
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: Math.abs(Math.log10(precision)) + 1
      }),
      focused: focus
    })
  }

  handleKeyDown = (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }

  handleChange = (event) => {
    const { min, max, precision, convertTo, onChange } = this.props as any

    const tempValue = event.target.value

    this.setState({ tempValue, focused: true })

    const parsedValue = parseFloat(tempValue)

    if (!Number.isNaN(parsedValue)) {
      const clampedValue = clamp(parsedValue, min, max)
      const roundedValue = precision ? toPrecision(clampedValue, precision) : clampedValue
      const finalValue = convertTo(roundedValue)
      onChange(finalValue)
    }
  }

  handleFocus = () => {
    const { value, convertFrom, precision } = this.props as any
    this.setState(
      {
        tempValue: convertFrom(value).toLocaleString('fullwide', {
          useGrouping: false,
          minimumFractionDigits: 0,
          maximumFractionDigits: Math.abs(Math.log10(precision)) + 1
        }),
        focused: true
      },
      () => {
        this.inputEl.current.select()
      }
    )
  }

  handleBlur = () => {
    const { value, onCommit, onChange } = this.props as any

    this.setState({ tempValue: null, focused: false })

    if (onCommit) {
      onCommit(value)
    } else {
      onChange(value)
    }
  }

  render() {
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
    } = this.props as any

    return (
      <NumericInputContainer>
        <StyledNumericInput
          {...rest}
          unit={unit}
          ref={this.inputEl}
          value={
            (this.state as any).focused
              ? (this.state as any).tempValue
              : toPrecisionString(convertFrom(value), displayPrecision)
          }
          onKeyUp={this.handleKeyPress}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />
        {unit && <NumericInputUnit>{unit}</NumericInputUnit>}
      </NumericInputContainer>
    )
  }
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
