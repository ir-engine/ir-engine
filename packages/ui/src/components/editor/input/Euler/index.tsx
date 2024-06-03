/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useHookstate } from '@etherealengine/hyperflux'
import { Q_IDENTITY } from '@etherealengine/spatial/src/common/constants/MathConstants'
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
  const euler = useHookstate(new Euler().setFromQuaternion(props.quaternion, 'YXZ'))

  useEffect(() => {
    euler.value.setFromQuaternion(props.quaternion, 'YXZ')
  }, [props])

  const onSetEuler = useCallback(
    (component: keyof typeof euler) => (value: number) => {
      const radVal = value * DEG2RAD
      euler[component].value !== radVal && (euler[component].set(radVal) || props.onChange?.(euler.value))
    },
    []
  )

  return (
    <div className="flex flex-row justify-start gap-1.5">
      <NumericInput
        value={euler.x.value * RAD2DEG}
        onChange={onSetEuler('x')}
        onRelease={() => props.onRelease?.()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.x.value * RAD2DEG}
            onChange={onSetEuler('x')}
            axis="x"
            onPointerUp={props.onRelease}
          />
        }
      />
      <NumericInput
        value={euler.y.value * RAD2DEG}
        onChange={onSetEuler('y')}
        onRelease={() => props.onRelease?.()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.y.value * RAD2DEG}
            onChange={onSetEuler('y')}
            axis="y"
            onPointerUp={props.onRelease}
          />
        }
      />
      <NumericInput
        value={euler.z.value * RAD2DEG}
        onChange={onSetEuler('z')}
        onRelease={() => props.onRelease?.()}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.z.value * RAD2DEG}
            onChange={onSetEuler('z')}
            axis="z"
            onPointerUp={props.onRelease}
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
