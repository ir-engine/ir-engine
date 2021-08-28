import React from 'react'
import { InputGroupContainer, InputGroupContent, InputGroupInfo } from './InputGroup'
import Scrubber from './Scrubber'
import NumericInput from './NumericInput'

/**
 *
 * @author Robert Long
 * @param {any} name
 * @param {any} className
 * @param {any} rest
 * @returns
 */
export function NumericInputGroup({ name, className, info, label, ...rest }) {
  const { displayPrecision, ...scrubberProps } = rest
  return (
    <InputGroupContainer>
      {/* @ts-ignore */}
      <Scrubber {...scrubberProps}>{label}:</Scrubber>
      <InputGroupContent>
        <NumericInput {...rest} />
        {info && <InputGroupInfo info={info} />}
      </InputGroupContent>
    </InputGroupContainer>
  )
}

export default NumericInputGroup
