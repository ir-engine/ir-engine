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

import React, { useEffect } from 'react'
//import "./slider.css"

export interface SliderProps {
  className?: string
  override?: boolean
  value: number
  min?: number
  max?: number
  step?: number
  initialValue?: number
  onChange: (value: number) => void
}

const Slider = ({ value, min = 0, max = 100, step = 1, onChange }) => {
  useEffect(() => {
    // no external css file, we cannot target ::-webkit-slider-thumb other wise
    const style = document.createElement('style')
    style.innerHTML = `
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 1rem;
        height: 2rem;
        background-color: #849ED6;
        border-radius: 4px;
        box-shadow: -2px 0 2px rgba(0, 0, 0, 0.2);
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handleInputChange = (event) => {
    let newValue = parseInt(event.target.value, 10)
    if (isNaN(newValue)) {
      newValue = min
    } else {
      newValue = Math.min(Math.max(newValue, min), max)
    }
    onChange(newValue)
  }

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value, 10)
    onChange(newValue)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        className="h-8 w-14 rounded bg-neutral-900 text-center font-['Figtree'] text-sm font-normal leading-[21px] text-neutral-400"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        step={step}
        className="h-8 w-[200px] appearance-none rounded bg-neutral-900 accent-slate-400"
        style={{
          background: `linear-gradient(to right, #2563eb ${
            ((value - min) / (max - min)) * 100 + (0.5 - (value - min) / (max - min)) * 10
          }%, #111113  ${((value - min) / (max - min)) * 100}%, #111113  100%)`
        }}
      />
      <span className="ml-2">{value}</span>
    </div>
  )
}

Slider.defaultProps = {
  min: 0,
  max: 100,
  step: 1
}

export default Slider
