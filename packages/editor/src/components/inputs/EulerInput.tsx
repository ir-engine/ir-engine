import { hookstate, useHookstate, useState } from '@hookstate/core'
import React, { useCallback, useEffect } from 'react'
import { MathUtils as _Math, Euler, Quaternion } from 'three'

import { defineState, NO_PROXY } from '@etherealengine/hyperflux'

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
  const euler = useState(new Euler().setFromQuaternion(props.quaternion, 'YXZ'))
  const onSetEuler = useCallback(
    (component: keyof typeof euler) => (value: number) => {
      const radVal = value * DEG2RAD
      euler[component].value !== radVal && (euler[component].set(radVal) || props.onChange?.(euler.value))
    },
    []
  )
  return (
    <Vector3InputContainer>
      <UniformButtonContainer />
      <NumericInput
        value={euler.x.value * RAD2DEG}
        onChange={onSetEuler('x')}
        onCommit={() => props.onRelease?.()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={euler.x.value * RAD2DEG}
            onChange={onSetEuler('x')}
            axis="x"
            onPointerUp={props.onRelease}
          >
            X
          </Vector3Scrubber>
        }
      />
      <NumericInput
        value={euler.y.value * RAD2DEG}
        onChange={onSetEuler('y')}
        onCommit={() => props.onRelease?.()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={euler.y.value * RAD2DEG}
            onChange={onSetEuler('y')}
            axis="y"
            onPointerUp={props.onRelease}
          >
            Y
          </Vector3Scrubber>
        }
      />
      <NumericInput
        value={euler.z.value * RAD2DEG}
        onChange={onSetEuler('z')}
        onCommit={() => props.onRelease?.()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            tag="div"
            value={euler.z.value * RAD2DEG}
            onChange={onSetEuler('z')}
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
