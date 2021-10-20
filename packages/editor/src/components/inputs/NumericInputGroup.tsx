import React from 'react'
import { InputGroupContainer, InputGroupContent, InputGroupInfo } from './InputGroup'
import Scrubber from './Scrubber'
import NumericInput from './NumericInput'

export interface NumericInputGroupProp {
  name?: string
  className?: any
  info?: any
  label?: any
  displayPrecision?: number
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  min?: number
  max?: number
  value?: any
  onChange?: Function
  unit?: string
  convertFrom?: any
  convertTo?: any
  disabled?: boolean
  default?: any
}

/**
 *
 * @author Robert Long
 * @param {any} name
 * @param {any} className
 * @param {any} rest
 * @returns
 */
export function NumericInputGroup({ name, className, info, label, ...rest }: NumericInputGroupProp) {
  const { displayPrecision, ...scrubberProps } = rest
  return (
    <InputGroupContainer>
      <Scrubber {...scrubberProps}>{label}:</Scrubber>
      <InputGroupContent>
        <NumericInput {...rest} />
        {info && <InputGroupInfo info={info} />}
      </InputGroupContent>
    </InputGroupContainer>
  )
}

export default NumericInputGroup
