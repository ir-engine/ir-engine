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
import React, { useId, useRef } from 'react'
import { LuInfo } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import Label from '../../../primitives/tailwind/Label'
import Tooltip from '../../../primitives/tailwind/Tooltip'

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number
  label?: string
  info?: string
  description?: string
  min?: number
  max?: number
  /**the size by which the slider should increment each step */
  step?: number
  onChange?: (value: number) => void
  onRelease?: (value: number) => void
}

/**
 * Slider compoennt for the editor
 * `...props` are forwarded to the parent HTML Div
 */
const Slider = ({
  value,
  label,
  info,
  description,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onRelease,
  ...props
}: SliderProps) => {
  const id = useId()
  const parentRef = useRef<HTMLDivElement>(null)

  const localValue = useHookstate(value)

  const handleInputChange = (value: string) => {
    const fractionLength = step.toString().split('.')[1]?.length || 0
    let newValue = parseFloat(value)
    if (isNaN(newValue)) {
      newValue = min
    } else {
      newValue = Math.min(Math.max(newValue, min), max)
    }
    const setLocalValueNewValue = +newValue.toFixed(fractionLength)
    localValue.set(setLocalValueNewValue)
    onChange?.(setLocalValueNewValue)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value)
    localValue.set(newValue)
    onChange?.(newValue)
  }

  const gradientPercent = Math.round(((localValue.value - min) / (max - min)) * 100)

  return (
    <div ref={parentRef} className="group/editor-slider grid w-full grid-cols-1 gap-y-2" {...props}>
      {(label || info) && (
        <div className="flex w-full justify-between">
          {label && <Label>{label}</Label>}
          {info && (
            <Tooltip content={info}>
              <LuInfo className={twMerge('h-5 w-5 text-text-inactive hover:text-text-primary')} />
            </Tooltip>
          )}
        </div>
      )}
      <div className="flex w-full items-center justify-between gap-x-2">
        <input
          id={id}
          min={min}
          max={max}
          value={value}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowUp') {
              handleInputChange(value + step + '')
            } else if (event.key === 'ArrowDown') {
              handleInputChange(value - step + '')
            }
          }}
          onBlur={() => onRelease?.(value)}
          className="m-0 h-8 w-14 rounded bg-ui-background text-center text-sm font-normal text-text-secondary outline-none group-hover/editor-slider:bg-ui-hover-background group-hover/editor-slider:text-text-primary group-focus/editor-slider:bg-ui-select-background group-focus/editor-slider:text-text-primary"
          data-testid="slider-text-value-input"
        />

        <input
          id={'slider' + id}
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onPointerUp={() => onRelease?.(value)}
          step={step}
          type="range"
          style={{
            background: `linear-gradient(to right, var(--ui-inactive-secondary) ${gradientPercent}%, var(--ui-background) ${gradientPercent}%)`
          }}
          className="h-8 w-full min-w-20 cursor-pointer appearance-none overflow-hidden rounded bg-ui-background outline-none
          disabled:pointer-events-none disabled:bg-ui-inactive-background
          [&::-moz-range-progress]:bg-ui-primary

          [&::-moz-range-thumb]:h-full
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:rounded
          [&::-moz-range-thumb]:bg-ui-primary
          [&::-moz-range-thumb]:transition-all
          [&::-moz-range-thumb]:duration-150
          [&::-moz-range-thumb]:ease-in-out
          group-hover/editor-slider:[&::-moz-range-thumb]:bg-ui-hover-primary
          [&::-moz-range-track]:h-full
          [&::-moz-range-track]:w-full
          [&::-moz-range-track]:rounded
          [&::-moz-range-track]:bg-ui-background
          [&::-webkit-slider-runnable-track]:h-full
          [&::-webkit-slider-runnable-track]:w-full
          [&::-webkit-slider-runnable-track]:rounded
          [&::-webkit-slider-thumb]:h-full
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded
          [&::-webkit-slider-thumb]:bg-ui-primary
          [&::-webkit-slider-thumb]:transition-colors
          [&::-webkit-slider-thumb]:duration-150
          [&::-webkit-slider-thumb]:ease-in-out
          group-hover/editor-slider:[&::-webkit-slider-thumb]:bg-ui-hover-primary
        "
          data-testid="slider-draggable-value-input"
        />
      </div>
    </div>
  )
}

export default Slider
