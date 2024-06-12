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
import { Vector3_Zero } from '@etherealengine/spatial/src/common/constants/MathConstants'
import React from 'react'
import { LuLock, LuUnlock } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import { Vector3 } from 'three'
import Button from '../../../../primitives/tailwind/Button'
import Scrubber from '../../layout/Scrubber'
import NumericInput from '../Numeric'

interface Vector3ScrubberProps {
  axis?: 'x' | 'y' | 'z' | string
  value: number
  onChange: any
  onPointerUp?: any
  children?: any
  className?: string
}

export const Vector3Scrubber = ({ axis, onChange, value, children, ...props }: Vector3ScrubberProps) => {
  const color = (() => {
    switch (axis) {
      case 'x':
        return 'red-500'
      case 'y':
        return 'green-400' // must be fushsia-400 , but these colors doesnt show up
      case 'z':
        return 'blue-400' //must be teal-400 , but this color doesnt show up
      default:
        return 'inherit'
    }
  })()

  props.className = twMerge(`text-${color}`)
  const content = children ?? axis?.toUpperCase()
  return (
    <Scrubber onChange={onChange} value={value} {...props}>
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

  const processChange = (field: string, fieldValue: number) => {
    if (uniformEnabled.value) {
      value.set(fieldValue, fieldValue, fieldValue)
    } else {
      value[field] = fieldValue
    }
  }

  const onChangeAxis = (axis: 'x' | 'y' | 'z') => (axisValue: number) => {
    processChange(axis, axisValue)
    onChange(value)
  }

  const onReleaseAxis = (axis: 'x' | 'y' | 'z') => (axisValue: number) => {
    processChange(axis, axisValue)
    onRelease?.(value)
  }

  const vx = value.x
  const vy = value.y
  const vz = value.z

  return (
    <div className="flex flex-row flex-wrap justify-start gap-1.5">
      {uniformScaling && (
        <Button
          variant="transparent"
          startIcon={uniformEnabled.value ? <LuLock /> : <LuUnlock />}
          onClick={onToggleUniform}
          className="p-0"
        />
      )}
      <NumericInput
        {...rest}
        value={vx}
        onChange={onChangeAxis('x')}
        onRelease={onReleaseAxis('x')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vx} onChange={onChangeAxis('x')} onPointerUp={onRelease} axis="x" />
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
            <Vector3Scrubber {...rest} value={vy} onChange={onChangeAxis('y')} onPointerUp={onRelease} axis="y" />
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
            <Vector3Scrubber {...rest} value={vz} onChange={onChangeAxis('z')} onPointerUp={onRelease} axis="z" />
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
