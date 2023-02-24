import { hookstate, useHookstate, useState } from '@hookstate/core'
import React, { useEffect } from 'react'
import { MathUtils as _Math, Euler, Quaternion } from 'three'

import { defineState, NO_PROXY } from '@xrengine/hyperflux'

import NumericInput from './NumericInput'
import { UniformButtonContainer, Vector3InputContainer, Vector3Scrubber } from './Vector3Input'

const { RAD2DEG, DEG2RAD } = _Math
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

/**
 * FileIEulerInputnput used to show EulerInput.
 *
 * @type {Object}
 */
export const EulerInput = (props: EulerInputProps) => {
  const euler = useState(new Euler().setFromQuaternion(props.quaternion))

  return (
    <Vector3InputContainer>
      <UniformButtonContainer />
      <NumericInput
        value={euler.x.value}
        onChange={(x) => euler.x.set(x)}
        onCommit={() => props.onRelease?.()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={euler.x.value}
            onChange={(x) => euler.x.set(x)}
            axis="x"
            onPointerUp={props.onRelease}
          >
            X
          </Vector3Scrubber>
        }
      />
      <NumericInput
        value={euler.y.value}
        onChange={(y) => euler.y.set(y)}
        onCommit={() => props.onRelease && props.onRelease()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={euler.y.value}
            onChange={(y) => euler.y.set(y)}
            axis="y"
            onPointerUp={props.onRelease}
          >
            Y
          </Vector3Scrubber>
        }
      />
      <NumericInput
        value={euler.z.value}
        onChange={(z) => euler.z.set(z)}
        onCommit={() => props.onRelease && props.onRelease()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={euler.z.value}
            onChange={(z) => euler.z.set(z)}
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
