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
import React from 'react'
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
  onChange: (quat: Quaternion) => any
  onRelease?: () => any
  unit?: string
}

const tempEuler = new Euler() // we need the persistance, the hookstate doesnt register the dynamically allocated euler and quat value otherwise, thus we cannot assign new variable to the same
export const EulerInput = (props: EulerInputProps) => {
  tempEuler.setFromQuaternion(props.quaternion, 'YXZ')
  const angle = useHookstate({
    x: tempEuler.x * RAD2DEG,
    y: tempEuler.y * RAD2DEG,
    z: tempEuler.z * RAD2DEG
  })

  const onSetEuler = (angleCoordinate: 'x' | 'y' | 'z') => (angleInDegree: number) => {
    const multiplier = Math.ceil(Math.abs(angleInDegree) / 360)
    angleInDegree += multiplier * 360
    angleInDegree %= 360

    angle[angleCoordinate].set(Math.round(angleInDegree * 1000) / 1000)

    const euler = new Euler(angle.x.value * DEG2RAD, angle.y.value * DEG2RAD, angle.z.value * DEG2RAD, 'YXZ')
    const quaternion = new Quaternion().setFromEuler(euler)
    props.onChange?.(quaternion)
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <NumericInput
        value={angle.x.value}
        onChange={onSetEuler('x')}
        onRelease={props.onRelease}
        unit={props.unit}
        prefix={<Vector3Scrubber value={angle.x.value} onChange={onSetEuler('x')} axis="x" />}
      />
      <NumericInput
        value={angle.y.value}
        onChange={onSetEuler('y')}
        onRelease={props.onRelease}
        unit={props.unit}
        prefix={<Vector3Scrubber value={angle.y.value} onChange={onSetEuler('y')} axis="y" />}
      />
      <NumericInput
        value={angle.z.value}
        onChange={onSetEuler('z')}
        onRelease={props.onRelease}
        unit={props.unit}
        prefix={<Vector3Scrubber value={angle.z.value} onChange={onSetEuler('z')} axis="z" />}
      />
    </div>
  )
}

EulerInput.defaultProps = {
  quaternion: Q_IDENTITY
}
export default EulerInput
