import { hookstate, useHookstate, useState } from '@hookstate/core'
import React from 'react'
import { MathUtils as _Math, Euler, Quaternion } from 'three'

import { defineState } from '@xrengine/hyperflux'

import NumericInput from './NumericInput'
import { UniformButtonContainer, Vector3InputContainer, Vector3Scrubber } from './Vector3Input'

const { RAD2DEG, DEG2RAD } = _Math
const _euler = new Euler()
const _empty = Object.freeze(new Euler())
const _lastQuat = new Quaternion()

/**
 * Type aliase created EulerInputProps.
 *
 * @type {Object}
 */
type EulerInputProps = {
  quaternion: Quaternion
  onChange?: (euler: Euler) => any
  onRelease?: () => void
  unit?: string
}

//To be set by editor control functions
export const eulerInput = hookstate(new Euler())

/**
 * FileIEulerInputnput used to show EulerInput.
 *
 * @type {Object}
 */
export const EulerInput = (props: EulerInputProps) => {
  const newValueEuler = useHookstate(new Euler())
  const e = useState(eulerInput)
  _lastQuat.multiply(props.quaternion.clone().invert())
  const rotationChanged = _lastQuat.x + _lastQuat.y + _lastQuat.z + _lastQuat.z != 0
  console.log(rotationChanged)
  if (e.value.x + e.value.y + e.value.z != 0 && rotationChanged) {
    _euler.copy(e.value)
    console.log(e.value)
  } else {
    _euler.copy(new Euler().setFromQuaternion(props.quaternion))
  }
  e.value.copy(_empty)

  const onChange = (x: number, y: number, z: number) => {
    if (newValueEuler.value) _euler.copy(newValueEuler.value)
    else _euler.setFromQuaternion(props.quaternion)

    newValueEuler.set(new Euler(x * DEG2RAD, y * DEG2RAD, z * DEG2RAD))
    if (typeof props.onChange === 'function') {
      props.onChange(newValueEuler.value)
    }
  }

  // creating view for component
  const vx = props.quaternion ? Math.round((_euler.x || 0) * RAD2DEG) : 0
  const vy = props.quaternion ? Math.round((_euler.y || 0) * RAD2DEG) : 0
  const vz = props.quaternion ? Math.round((_euler.z || 0) * RAD2DEG) : 0

  _lastQuat.copy(props.quaternion)

  return (
    <Vector3InputContainer>
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
