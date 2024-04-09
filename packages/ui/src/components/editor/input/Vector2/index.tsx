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

import { useHookstate } from '@hookstate/core'
import React from 'react'
import { Vector3 } from 'three'

// style inheritance

import { V_000 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import NumericInput from '../Numeric'
import { Vector3Scrubber } from '../Vector3'

let uniqueId = 0

interface Vector2InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: Vector3
  hideLabels?: boolean
  onChange: (v: Vector3) => void
  onRelease?: (v: Vector3) => void
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
  ...rest
}: Vector2InputProp) => {
  const id = uniqueId++
  const uniformEnabled = useHookstate(uniformScaling)

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

  const onChangeX = (x: number) => {
    processChange('x', x)
    onChange(value)
  }

  const onChangeY = (y: number) => {
    processChange('y', y)
    onChange(value)
  }

  const onReleaseX = (x: number) => {
    processChange('x', x)
    onRelease?.(value)
  }

  const onReleaseY = (y: number) => {
    processChange('y', y)
    onRelease?.(value)
  }

  const vx = value.x
  const vy = value.y
  const checkboxId = 'uniform-button-' + id

  return (
    <div className="flex flex-auto flex-row justify-start gap-1.5">
      <NumericInput
        {...rest}
        value={vx}
        onChange={onChangeX}
        onRelease={onReleaseX}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vx} onChange={onChangeX} onPointerUp={onRelease} axis="x" />
          )
        }
      />
      <NumericInput
        {...rest}
        value={vy}
        onChange={onChangeY}
        onRelease={onReleaseY}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vy} onChange={onChangeY} onPointerUp={onRelease} axis="y" />
          )
        }
      />
    </div>
  )
}

Vector2Input.defaultProps = {
  value: V_000,
  hideLabels: false,
  onChange: () => {}
}

export default Vector2Input
