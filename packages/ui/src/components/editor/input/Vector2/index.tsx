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

import { ImmutableObject, useHookstate } from '@ir-engine/hyperflux'
import React from 'react'
import { Vector2 } from 'three'

import { Vector2_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import NumericInput from '../Numeric'
import { Vector3Scrubber } from '../Vector3'

interface Vector2InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: ImmutableObject<Vector2>
  hideLabels?: boolean
  onChange: (v: Vector2) => void
  onRelease?: (v: Vector2) => void
  min?: number
  max?: number
}

export const Vector2Input = ({
  uniformScaling,
  smallStep,
  mediumStep,
  largeStep,
  value,
  hideLabels,
  onChange,
  onRelease,
  min,
  max,
  ...rest
}: Vector2InputProp) => {
  const uniformEnabled = useHookstate(uniformScaling)

  const toVec2 = (field: string, fieldValue: number): Vector2 => {
    if (uniformEnabled.value) {
      return new Vector2(fieldValue, fieldValue)
    } else {
      let clampedValue = fieldValue
      if (min !== undefined) {
        clampedValue = Math.max(min, clampedValue)
      }
      if (max !== undefined) {
        clampedValue = Math.min(max, clampedValue)
      }
      const vec = new Vector2()
      vec.copy(value)
      vec[field] = clampedValue
      return vec
    }
  }

  const onChangeAxis = (axis: string) => (n: number) => {
    onChange(toVec2(axis, n))
  }

  const onReleaseAxis = (axis: string) => (n: number) => {
    onRelease?.(toVec2(axis, n))
  }

  const vx = value.x
  const vy = value.y

  return (
    <div className="flex flex-row justify-end gap-1.5">
      <NumericInput
        {...rest}
        value={vx}
        onChange={onChangeAxis('x')}
        onRelease={onReleaseAxis('x')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber
              {...rest}
              value={vx}
              onChange={onChangeAxis('x')}
              onRelease={onReleaseAxis('x')}
              axis="x"
            />
          )
        }
      />
      <NumericInput
        {...rest}
        value={vy}
        onChange={onChangeAxis('y')}
        onRelease={onReleaseAxis('y')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber
              {...rest}
              value={vy}
              onChange={onChangeAxis('y')}
              onRelease={onReleaseAxis('y')}
              axis="y"
            />
          )
        }
      />
    </div>
  )
}

Vector2Input.defaultProps = {
  value: Vector2_Zero,
  hideLabels: false,
  onChange: () => {}
}

export default Vector2Input
