import React from 'react'
import { MathUtils as _Math, Euler, Quaternion } from 'three'

import NumericInput from './NumericInput'
import { UniformButtonContainer, Vector3InputContainer, Vector3Scrubber } from './Vector3Input'

const { RAD2DEG, DEG2RAD } = _Math
const euler = new Euler()

/**
 * Type aliase created EulerInputProps.
 *
 * @type {Object}
 */
type EulerInputProps = {
  quaternion: Quaternion
  onChange?: (euler: Euler) => any
  unit?: string
}

/**
 * FileIEulerInputnput used to show EulerInput.
 *
 * @type {Object}
 */
export const EulerInput = (props: EulerInputProps) => {
  const onChange = (x: number, y: number, z: number) =>
    props.onChange?.(new Euler(x * DEG2RAD, y * DEG2RAD, z * DEG2RAD))
  euler.setFromQuaternion(props.quaternion)

  // creating view for component
  const vx = euler ? Math.round((euler.x || 0) * RAD2DEG) : 0
  const vy = euler ? Math.round((euler.y || 0) * RAD2DEG) : 0
  const vz = euler ? Math.round((euler.z || 0) * RAD2DEG) : 0

  return (
    <Vector3InputContainer>
      <UniformButtonContainer />
      <NumericInput
        value={vx}
        onChange={(x) => onChange(x, vy, vz)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber tag="div" value={vx} onChange={(x) => onChange(x, vy, vz)} axis="x">
            X
          </Vector3Scrubber>
        }
      />
      <NumericInput
        value={vy}
        onChange={(y) => onChange(vx, y, vz)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber tag="div" value={vy} onChange={(y) => onChange(vx, y, vz)} axis="y">
            Y
          </Vector3Scrubber>
        }
      />
      <NumericInput
        value={vz}
        onChange={(z) => onChange(vx, vy, z)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber tag="div" value={vz} onChange={(z) => onChange(vx, vy, z)} axis="z">
            Z
          </Vector3Scrubber>
        }
      />
    </Vector3InputContainer>
  )
}
export default EulerInput
