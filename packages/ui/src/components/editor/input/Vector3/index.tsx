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
import { Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import React from 'react'
import { LuLock, LuUnlock } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import { Vector3 } from 'three'
import Scrubber from '../../layout/Scrubber'
import NumericInput from '../Numeric'

interface Vector3ScrubberProps {
  axis?: 'x' | 'y' | 'z' | string
  value: number
  onChange: (v: number) => void
  onRelease?: (v: number) => void
  children?: any
  className?: string
}

export const Vector3Scrubber = ({ axis, onChange, onRelease, value, children, ...props }: Vector3ScrubberProps) => {
  const color = (() => {
    switch (axis) {
      case 'x':
        return 'red-500'
      case 'y':
        return 'green-400'
      case 'z':
        return 'blue-400'
      default:
        return 'inherit'
    }
  })()

  props.className = twMerge(`w-full text-${color}`)
  const content = children ?? `${axis?.toUpperCase()} - `
  return (
    <Scrubber onChange={onChange} onRelease={onRelease} value={value} {...props}>
      {content}
    </Scrubber>
  )
}

export const UniformButtonContainer: React.FC<{ children?: JSX.Element }> = ({ children }) => {
  return (
    <div className="flex w-6 items-center hover:text-[color:var(--blueHover)] [&>*:where(label)]:text-[color:var(--textColor)] [&>*:where(ul)]:w-full">
      {children}
    </div>
  )
}

interface Vector3InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: Vector3
  hideLabels?: boolean
  onChange: (v: Vector3) => void
  onRelease?: (v: Vector3) => void
}

export const Vector3Input = ({
  uniformScaling,
  smallStep,
  mediumStep,
  largeStep,
  value,
  hideLabels,
  onChange,
  onRelease,
  ...rest
}: Vector3InputProp) => {
  const uniformEnabled = useHookstate(false)

  const onToggleUniform = () => {
    uniformEnabled.set((v) => !v)
  }

  const toVec3 = (field: string, fieldValue: number): Vector3 => {
    if (uniformEnabled.value) {
      return new Vector3(fieldValue, fieldValue, fieldValue)
    } else {
      const vec = new Vector3()
      vec.copy(value)
      vec[field] = fieldValue
      return vec
    }
  }

  const onChangeAxis = (axis: string) => (n: number) => {
    onChange(toVec3(axis, n))
  }

  const onReleaseAxis = (axis: string) => (n: number) => {
    onRelease?.(toVec3(axis, n))
  }

  const vx = value.x
  const vy = value.y
  const vz = value.z

  return (
    <div className="flex flex-row flex-wrap justify-end gap-1.5">
      {uniformScaling && (
        <button onClick={onToggleUniform} className="p-0" tabIndex={-1}>
          {uniformEnabled.value ? <LuLock /> : <LuUnlock />}
        </button>
      )}
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
      <NumericInput
        {...rest}
        value={vz}
        onChange={onChangeAxis('z')}
        onRelease={onReleaseAxis('z')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber
              {...rest}
              value={vz}
              onChange={onChangeAxis('z')}
              onRelease={onReleaseAxis('z')}
              axis="z"
            />
          )
        }
      />
    </div>
  )
}

Vector3Input.defaultProps = {
  value: Vector3_Zero,
  hideLabels: false,
  onChange: () => {}
}

export default Vector3Input
