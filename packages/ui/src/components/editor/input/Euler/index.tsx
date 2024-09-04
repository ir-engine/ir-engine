/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useHookstate } from '@ir-engine/hyperflux'
import { Q_IDENTITY } from '@ir-engine/spatial/src/common/constants/MathConstants'
import React, { useCallback, useEffect } from 'react'
import { Euler, Quaternion, MathUtils as _Math } from 'three'
import NumericInput from '../Numeric'
import { Vector3Scrubber } from '../Vector3'

const { RAD2DEG, DEG2RAD } = _Math
/**
 * Type aliase created EulerInputProps.
 *
 * @type {Object}
 */
type EulerInputProps = {
  quaternion: Quaternion
  onChange?: (quat: Quaternion) => any
  onRelease?: (euler: Euler) => void
  unit?: string
}

const tempEuler = new Euler()
const tempQuat = new Quaternion()

/**
 * FileIEulerInputnput used to show EulerInput.
 *
 * @type {Object}
 */
export const EulerInput = (props: EulerInputProps) => {
  const quaternion = useHookstate(props.quaternion)
  const euler = useHookstate(temp_Euler.setFromQuaternion(props.quaternion, 'YXZ'))

  useEffect(() => {
    euler.set(temp_Euler.setFromQuaternion(quaternion.value, 'YXZ'))
  }, [props.quaternion])

  const onSetEuler = useCallback(
    (component: keyof typeof euler) => (value: number) => {
      const radVal = value * DEG2RAD
      euler[component].value !== radVal &&
        (euler[component].set(radVal),
        quaternion.set(temp_Quat.setFromEuler(euler.value)),
        props.onChange?.(quaternion.value))
    },
    [euler, quaternion, props.quaternion]
  )

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <NumericInput
        value={euler.value.x * RAD2DEG}
        onChange={onSetEuler('x')}
        onRelease={() => props.onRelease?.(euler.value)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.value.x * RAD2DEG}
            onChange={onSetEuler('x')}
            axis="x"
            onPointerUp={() => props.onRelease?.(euler.value)}
          />
        }
      />
      <NumericInput
        value={euler.value.y * RAD2DEG}
        onChange={onSetEuler('y')}
        onRelease={() => props.onRelease?.(euler.value)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.value.y * RAD2DEG}
            onChange={onSetEuler('y')}
            axis="y"
            onPointerUp={() => props.onRelease?.(euler.value)}
          />
        }
      />
      <NumericInput
        value={euler.value.z * RAD2DEG}
        onChange={onSetEuler('z')}
        onRelease={() => props.onRelease?.(euler.value)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.value.z * RAD2DEG}
            onChange={onSetEuler('z')}
            axis="z"
            onPointerUp={() => props.onRelease?.(euler.value)}
          />
        }
      />
    </div>
  )
}

EulerInput.defaultProps = {
  quaternion: Q_IDENTITY
}
export default EulerInput
