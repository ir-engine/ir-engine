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

import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'

import { clamp } from '@etherealengine/engine/src/common/functions/MathLerpFunctions'

import { getStepSize, toPrecision } from '../../functions/utils'

import './NumericInput.css'

// Import the CSS file

/**
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

const NumericInputContainer = ({ className = '', ...rest }) => {
  return <div className={`NumericInputContainer ${className}`} {...rest} />
}

const NumericInputUnit = ({ className = '', ...rest }) => {
  return <div className={`NumericInputUnit ${className}`} {...rest} />
}

export interface NumericInputProp {
  className?: string
  unit?: any
  prefix?: any
  displayPrecision?: any
  value: number
  convertFrom?: any
  precision?: number
  mediumStep?: number
  onChange?: (n: any) => void
  onRelease?: (n: any) => void
  smallStep?: number
  largeStep?: number
  min?: number
  max?: number
  convertTo?: any
}

export interface styledNumericInputProp {
  className?: string
  value?: number
  onKeyUp?: any
  onKeyDown?: any
  onChange?: any
  onFocus?: any
  onBlur?: any
  unit?: string
}

const StyledNumericInput = React.forwardRef(({ className = '', ...rest }: styledNumericInputProp, ref) => {
  return <input ref={ref as any} className={`StyledNumericInput ${className}`} {...rest} />
})
const NumericInput = React.forwardRef(
  (
    {
      className,
      unit,
      prefix,
      displayPrecision,
      value,
      convertFrom,
      precision,
      mediumStep,
      onChange,
      onRelease,
      smallStep,
      largeStep,
      min,
      max,
      convertTo,
      ...rest
    }: NumericInputProp,
    ref
  ) => {
    const [tempValue, setTempValue] = useState<string | null>(null)
    const [focused, setFocused] = useState(false)
    const inputEl = useRef<HTMLInputElement>(null)

    const handleStep = (event, direction, focus = true) => {
      const stepSize = event ? getStepSize(event, smallStep, mediumStep, largeStep) : mediumStep

      const nextValue = parseFloat(inputEl?.current?.value ?? '0') + stepSize * direction
      const clampedValue = min != null && max != null ? clamp(nextValue, min, max) : nextValue
      const roundedValue = precision ? toPrecision(clampedValue, precision) : nextValue
      const finalValue = convertTo(roundedValue)

      if (onChange) {
        onChange(finalValue)
      }

      setTempValue(
        roundedValue.toLocaleString('fullwide', {
          useGrouping: false,
          minimumFractionDigits: 0,
          maximumFractionDigits: Math.abs(Math.log10(precision || 0)) + 1
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
      if (event.key === 'Escape') {
        handleBlur()
      }

      if (event.key === 'Enter') {
        handleBlur()
      }

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
      const tempValue = event.target.value

      setTempValue(tempValue)
      setFocused(true)

      const parsedValue = parseFloat(tempValue)

      if (!Number.isNaN(parsedValue)) {
        const clampedValue = min != null && max != null ? clamp(parsedValue, min, max) : parsedValue
        const roundedValue = precision ? toPrecision(clampedValue, precision) : clampedValue
        const finalValue = convertTo(roundedValue)
        onChange?.(finalValue)
      }
    }

    const handleFocus = () => {
      setTempValue(
        convertFrom(value).toLocaleString('fullwide', {
          useGrouping: false,
          minimumFractionDigits: 0,
          maximumFractionDigits: Math.abs(Math.log10(precision || 0)) + 1
        })
      )
      setFocused(true)
    }

    useEffect(() => {
      if (focused) inputEl?.current?.select()
    }, [focused])

    const handleBlur = () => {
      setTempValue(null)
      setFocused(false)

      if (onRelease) {
        onRelease(value)
      }
    }

    return (
      <NumericInputContainer className={className}>
        {prefix ? prefix : null}
        <StyledNumericInput
          {...rest}
          // unit={unit} // not a valid property?
          ref={inputEl}
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
)

NumericInput.propTypes = {
  className: PropTypes.string,
  unit: PropTypes.node,
  smallStep: PropTypes.number.isRequired,
  mediumStep: PropTypes.number.isRequired,
  largeStep: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onRelease: PropTypes.func,
  convertTo: PropTypes.func.isRequired,
  convertFrom: PropTypes.func.isRequired,
  precision: PropTypes.number.isRequired,
  displayPrecision: PropTypes.number.isRequired
}

NumericInput.defaultProps = {
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
