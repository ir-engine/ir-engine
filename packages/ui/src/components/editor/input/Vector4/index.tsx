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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useHookstate } from '@ir-engine/hyperflux'
import { Vector4_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { Lock01Lg, LockUnlocked01Lg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Vector4 } from 'three'
import Scrubber from '../../layout/Scrubber'
import NumericInput from '../Numeric'

interface Vector4ScrubberProps {
  axis?: 'x' | 'y' | 'z' | 'w' | string
  value: number
  onChange: (v: number) => void
  onRelease?: (v: number) => void
  className?: string
  disabled?: boolean
  axisLabel?: string
}

export const Vector4Scrubber = ({
  axis,
  disabled,
  onChange,
  onRelease,
  axisLabel,
  value,
  ...props
}: Vector4ScrubberProps) => {
  const color = (() => {
    switch (axis) {
      case 'x':
        return 'ui-error'
      case 'y':
        return 'ui-success'
      case 'z':
        return 'ui-primary'
      case 'w':
        return '--text-primary'
      default:
        return 'inherit'
    }
  })()

  props.className = twMerge(`w-fit whitespace-nowrap text-${color}`)
  const label = axisLabel ? axisLabel : axis
  const content = `${label?.toUpperCase()}`

  return (
    <Scrubber onChange={onChange} onRelease={onRelease} value={value} disabled={disabled} {...props}>
      {content}
    </Scrubber>
  )
}

interface Vector4InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: Vector4
  hideLabels?: boolean
  onChange: (v: Vector4) => void
  onRelease?: (v: Vector4) => void
  disabled?: boolean
  onToggleUniformScale?: (updatedValue: boolean) => void
}

export const Vector4Input = ({
  uniformScaling,
  smallStep,
  mediumStep,
  largeStep,
  value,
  hideLabels,
  onChange,
  disabled,
  onRelease,
  onToggleUniformScale,
  ...rest
}: Vector4InputProp) => {
  const uniformEnabled = useHookstate(uniformScaling ?? false)

  const onToggleUniform = () => {
    uniformEnabled.set((v) => !v)
    const updatedValue = uniformEnabled.get()
    if (onToggleUniformScale) {
      onToggleUniformScale(updatedValue)
    }
  }

  const toVec4 = (field: string, fieldValue: number): Vector4 => {
    if (uniformEnabled.value) {
      const vec = new Vector4()
      const change = fieldValue - value[field]
      vec.copy(value).addScalar(change)
      return vec
    } else {
      const vec = new Vector4()
      vec.copy(value)
      vec[field] = fieldValue
      return vec
    }
  }

  const onChangeAxis = (axis: string) => (n: number) => {
    onChange(toVec4(axis, n))
  }

  const onReleaseAxis = (axis: string) => (n: number) => {
    onRelease?.(toVec4(axis, n))
  }

  const vx = value.x
  const vy = value.y
  const vz = value.z
  const vw = value.w

  return (
    <div className="flex w-full items-center gap-x-1.5">
      {uniformScaling !== undefined && (
        <button onClick={onToggleUniform} className="w-fit" tabIndex={-1} disabled={disabled}>
          {uniformEnabled.value ? (
            <Lock01Lg className="text-text-secondary hover:text-text-primary" />
          ) : (
            <LockUnlocked01Lg className="text-text-secondary hover:text-text-primary" />
          )}
        </button>
      )}
      <div className="grid w-full grid-cols-3 gap-x-2">
        <NumericInput
          {...rest}
          value={vx}
          disabled={disabled}
          onChange={onChangeAxis('x')}
          onRelease={onReleaseAxis('x')}
          prefix={
            hideLabels ? null : (
              <Vector4Scrubber
                {...rest}
                disabled={disabled}
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
          disabled={disabled}
          onChange={onChangeAxis('y')}
          onRelease={onReleaseAxis('y')}
          prefix={
            hideLabels ? null : (
              <Vector4Scrubber
                {...rest}
                disabled={disabled}
                value={vy}
                onChange={onChangeAxis('y')}
                onRelease={onReleaseAxis('y')}
                axis="y"
              />
            )
          }
        />
        <NumericInput
          {...rest}
          value={vz}
          disabled={disabled}
          onChange={onChangeAxis('z')}
          onRelease={onReleaseAxis('z')}
          prefix={
            hideLabels ? null : (
              <Vector4Scrubber
                {...rest}
                disabled={disabled}
                value={vz}
                onChange={onChangeAxis('z')}
                onRelease={onReleaseAxis('z')}
                axis="z"
              />
            )
          }
        />
        <NumericInput
          {...rest}
          value={vw}
          disabled={disabled}
          onChange={onChangeAxis('w')}
          onRelease={onReleaseAxis('w')}
          prefix={
            hideLabels ? null : (
              <Vector4Scrubber
                {...rest}
                disabled={disabled}
                value={vw}
                onChange={onChangeAxis('w')}
                onRelease={onReleaseAxis('w')}
                axis="w"
              />
            )
          }
        />
      </div>
    </div>
  )
}

Vector4Input.defaultProps = {
  value: Vector4_Zero,
  hideLabels: false,
  onChange: () => {}
}

export default Vector4Input
