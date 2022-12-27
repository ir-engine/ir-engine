import { useHookstate } from '@hookstate/core'
import React from 'react'
import { MathUtils as _Math, Euler, Quaternion } from 'three'

import NumericInput from './NumericInput'
import { UniformButtonContainer, Vector3InputContainer, Vector3Scrubber } from './Vector3Input'

const { RAD2DEG, DEG2RAD } = _Math
const _euler = new Euler()

/**
 * Type aliase created EulerInputProps.
 *
 * @type {Object}
 */
type EulerInputProps = {
  quaternion: Quaternion
  onChange?: (euler: Euler) => any
  onRelease?: () => void
  style?: React.CSSProperties
  unit?: string
}

/**
 * FileIEulerInputnput used to show EulerInput.
 *
 * @type {Object}
 */
export const EulerInput = (props: EulerInputProps) => {
  const newValue = useHookstate(new Euler())
  _euler.setFromQuaternion(props.quaternion)

  const onChange = (x: number, y: number, z: number) => {
    const e = new Euler(x * DEG2RAD, y * DEG2RAD, z * DEG2RAD)
    newValue.set(e)
    if (typeof props.onChange === 'function') {
      props.onChange(newValue.value)
    }
  }

  // creating view for component
  const vx = props.quaternion ? Math.round((_euler.x || 0) * RAD2DEG) : 0
  const vy = props.quaternion ? Math.round((_euler.y || 0) * RAD2DEG) : 0
  const vz = props.quaternion ? Math.round((_euler.z || 0) * RAD2DEG) : 0

  return (
    <Vector3InputContainer style={props.style}>
      <UniformButtonContainer />
      <NumericInput
        value={vx}
        onChange={(x) => onChange(x, vy, vz)}
        onCommit={() => props.onRelease && props.onRelease()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={vx}
            onChange={(x) => onChange(x, vy, vz)}
            axis="x"
            onPointerUp={props.onRelease}
          >
            X
          </Vector3Scrubber>
        }
      />
      <NumericInput
        value={vy}
        onChange={(y) => onChange(vx, y, vz)}
        onCommit={() => props.onRelease && props.onRelease()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={vy}
            onChange={(y) => onChange(vx, y, vz)}
            axis="y"
            onPointerUp={props.onRelease}
          >
            Y
          </Vector3Scrubber>
        }
      />
      <NumericInput
        value={vz}
        onChange={(z) => onChange(vx, vy, z)}
        onCommit={() => props.onRelease && props.onRelease()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={vz}
            onChange={(z) => onChange(vx, vy, z)}
            axis="z"
            onPointerUp={props.onRelease}
          >
            Z
          </Vector3Scrubber>
        }
      />
    </Vector3InputContainer>
  )
}
export default EulerInput
