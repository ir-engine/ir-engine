import React, { Component } from 'react'
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
export class EulerInput extends Component<EulerInputProps, {}> {
  /**
   * onChange onchange trigger Change method for EulerInput Component.
   *
   * @author Robert Long
   * @param  {Object} e.target.file
   * @return {Object}   e
   */
  onChange = (x, y, z) => {
    this.props.onChange(new Euler(x * DEG2RAD, y * DEG2RAD, z * DEG2RAD))
  }

  // creating view for component
  render() {
    const { value, onChange, ...rest } = this.props as any
    const vx = value ? (value.x || 0) * RAD2DEG : 0
    const vy = value ? (value.y || 0) * RAD2DEG : 0
    const vz = value ? (value.z || 0) * RAD2DEG : 0
    return (
      <Vector3InputContainer>
        <Vector3Scrubber {...rest} tag="div" value={vx} onChange={(x) => this.onChange(x, vy, vz)}>
          X:
        </Vector3Scrubber>
        <NumericInput {...rest} value={vx} onChange={(x) => this.onChange(x, vy, vz)} />
        <Vector3Scrubber {...rest} tag="div" value={vy} onChange={(y) => this.onChange(vx, y, vz)}>
          Y:
        </Vector3Scrubber>
        <NumericInput {...rest} value={vy} onChange={(y) => this.onChange(vx, y, vz)} />
        <Vector3Scrubber {...rest} tag="div" value={vz} onChange={(z) => this.onChange(vx, vy, z)}>
          Z:
        </Vector3Scrubber>
        <NumericInput {...rest} value={vz} onChange={(z) => this.onChange(vx, vy, z)} />
      </Vector3InputContainer>
    )
  }
}
export default EulerInput
