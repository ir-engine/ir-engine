import React from 'react'
import NumericInput from './NumericInput'
import { MathUtils as _Math, Euler } from 'three'
import { Vector3InputContainer, Vector3Scrubber } from './Vector3Input'
const { RAD2DEG, DEG2RAD } = _Math

/**
 * Type aliase created EulerInputProps.
 *
 * @author Robert Long
 * @type {Object}
 */
type EulerInputProps = {
  value?: {
    x?: number
    y?: number
    z?: number
  }
  onChange?: (...args: any[]) => any
  unit?: string
}

/**
 * FileIEulerInputnput used to show EulerInput.
 *
 * @author Robert Long
 * @type {Object}
 */
export const EulerInput = (props: EulerInputProps) => {
  const onChange = (x, y, z) => {
    props.onChange(new Euler(x * DEG2RAD, y * DEG2RAD, z * DEG2RAD))
  }

  // creating view for component
  const { value, ...rest } = props

  const vx = value ? Math.round((value.x || 0) * RAD2DEG) : 0
  const vy = value ? Math.round((value.y || 0) * RAD2DEG) : 0
  const vz = value ? Math.round((value.z || 0) * RAD2DEG) : 0

  return (
    <Vector3InputContainer>
      <Vector3Scrubber {...rest} tag="div" value={vx} onChange={(x) => onChange(x, vy, vz)}>
        X:
      </Vector3Scrubber>
      <NumericInput {...rest} value={vx} onChange={(x) => onChange(x, vy, vz)} />
      <Vector3Scrubber {...rest} tag="div" value={vy} onChange={(y) => onChange(vx, y, vz)}>
        Y:
      </Vector3Scrubber>
      <NumericInput {...rest} value={vy} onChange={(y) => onChange(vx, y, vz)} />
      <Vector3Scrubber {...rest} tag="div" value={vz} onChange={(z) => onChange(vx, vy, z)}>
        Z:
      </Vector3Scrubber>
      <NumericInput {...rest} value={vz} onChange={(z) => onChange(vx, vy, z)} />
    </Vector3InputContainer>
  )
}
export default EulerInput
