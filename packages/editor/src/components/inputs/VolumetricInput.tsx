import React from 'react'
import { ControlledStringInput } from './StringInput'

/**
 *
 * @param {function} onChange
 * @param {any} rest
 * @returns
 */
export function VolumetricInput({ onChange, ...rest }) {
  return <ControlledStringInput onChange={onChange} {...rest} />
}

export default VolumetricInput
