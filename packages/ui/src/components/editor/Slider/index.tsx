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

import React, { useEffect, useId, useRef, useState } from 'react'

export interface SliderProps {
  value: number
  label: string
  min?: number
  max?: number
  /**the size by which the slider should increment each step */
  step?: number
  /**width of the slider in pixels */
  onChange: (value: number) => void
  onRelease: (value: number) => void
}

const Slider = (
  { value, label, min = 0, max = 100, step = 1, onChange, onRelease }: SliderProps,
  ref: React.ForwardedRef<HTMLInputElement>
) => {
  const id = useId()
  const parentRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(event.target.value)
    if (isNaN(newValue)) {
      newValue = min
    } else {
      newValue = Math.min(Math.max(newValue, min), max)
    }
    onChange(newValue)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value)
    onChange(newValue)
  }

  const gradientPercent = Math.round(((value - min) / (max - min)) * 100)

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (parentRef.current) setWidth(parentRef.current?.offsetWidth)
    })
    observer.observe(parentRef.current as Element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={parentRef} className="group flex flex-nowrap items-center gap-2">
      <label className="mr-2 text-sm text-[#B2B5BD] group-hover:text-[#D3D5D9]" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        onBlur={() => onRelease(value)}
        className="h-8 w-14 rounded bg-[#141619] text-center text-sm font-normal leading-[21px] text-[#9CA0AA] group-hover:bg-[#191B1F] group-hover:text-[#F5F5F5]"
      />
      <input
        ref={ref}
        id={'slider' + id}
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        onPointerUp={() => onRelease(value)}
        step={step}
        type="range"
        style={{
          width: width + 'px',
          background: `linear-gradient(to right, #214AA6 ${gradientPercent}%, #191B1F ${gradientPercent}%)`
        }}
        className="h-8 min-w-20 cursor-pointer appearance-none overflow-hidden rounded bg-[#191B1F] focus:outline-none
          disabled:pointer-events-none disabled:opacity-50
          [&::-moz-range-progress]:bg-[#375DAF]
          [&::-moz-range-thumb]:h-full
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:rounded
          [&::-moz-range-thumb]:bg-[#879ECF]
          [&::-moz-range-thumb]:transition-all
          [&::-moz-range-thumb]:duration-150
          [&::-moz-range-thumb]:ease-in-out
          group-hover:[&::-moz-range-thumb]:bg-[#AFBEDF]
          [&::-moz-range-track]:h-full
          [&::-moz-range-track]:w-full
          [&::-moz-range-track]:rounded
          [&::-moz-range-track]:bg-[#191B1F]
          [&::-webkit-slider-runnable-track]:h-full
          [&::-webkit-slider-runnable-track]:w-full
          [&::-webkit-slider-runnable-track]:rounded
          [&::-webkit-slider-thumb]:h-full
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded
          [&::-webkit-slider-thumb]:bg-[#879ECF]
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-150
          [&::-webkit-slider-thumb]:ease-in-out
          group-hover:[&::-webkit-slider-thumb]:bg-[#AFBEDF]
        "
      />
    </div>
  )
}

export default React.forwardRef(Slider)
