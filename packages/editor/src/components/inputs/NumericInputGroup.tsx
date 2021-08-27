import React from 'react'
import PropTypes from 'prop-types'
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

/**
 * @author Robert Long
 */
NumericInputGroup.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  info: PropTypes.string
}
export default NumericInputGroup
