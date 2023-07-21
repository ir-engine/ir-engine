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
import styled from 'styled-components'

import { clamp } from '@etherealengine/engine/src/common/functions/MathLerpFunctions'

import { getStepSize, toPrecision } from '../../functions/utils'

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

const NumericInputContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  background-color: var(--inputBackground);
  border: 1px solid var(--inputOutline);
  border-radius: 4px;
  height: 24px;
  overflow: hidden;

  &:hover {
    border-color: var(--blueHover);
  }

  &:focus,
  &:focus-visible,
  &:focus-within {
    border-color: var(--blue);
  }

  &:disabled {
    background-color: var(--disabled);
    color: var(--disabledText);
  }
`

const StyledNumericInput = styled.input`
  color: var(--textColor);
  background-color: var(--inputBackground);
  border: none;
  font-size: 12px;
  height: 22px;
  box-sizing: border-box;
  outline: none;
  padding: 0 4px;
  flex-grow: 1;
  min-width: 0;

  &:disabled {
    background-color: var(--disabled);
    color: var(--disabledText);
  }
`

const NumericInputUnit = styled.div`
  color: var(--textColor);
  background-color: var(--inputBackground);
  padding-right: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  line-height: 20px;
  height: 100%;
`

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
  onCommit?: (n: any) => void
  smallStep?: number
  largeStep?: number
  min?: number
  max?: number
  convertTo?: any
}

const NumericInput = ({
  className,
  unit,
  prefix,
  displayPrecision,
  value,
  convertFrom,
  precision,
  mediumStep,
  onChange,
  onCommit,
  smallStep,
  largeStep,
  min,
  max,
  convertTo,
  ...rest
}: NumericInputProp) => {
  const [tempValue, setTempValue] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const inputEl = useRef<HTMLInputElement>(null)

  const handleStep = (event, direction, focus = true) => {
    const stepSize = event ? getStepSize(event, smallStep, mediumStep, largeStep) : mediumStep

    const nextValue = parseFloat(inputEl?.current?.value ?? '0') + stepSize * direction
    const clampedValue = min != null && max != null ? clamp(nextValue, min, max) : nextValue
    const roundedValue = precision ? toPrecision(clampedValue, precision) : nextValue
    const finalValue = convertTo(roundedValue)

    if (onCommit) {
      onCommit(finalValue)
    } else {
      onChange?.(finalValue)
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

    if (onCommit) {
      onCommit(value)
    } else {
      onChange?.(value)
    }
  }

  return (
    <NumericInputContainer>
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
