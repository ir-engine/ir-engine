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

import React, { useEffect, useRef, useState } from 'react'
import { MdPauseCircleOutline, MdPlayCircleOutline } from 'react-icons/md'

export interface SeekerProps {
  currentSeconds: number
  totalSeconds: number
  /**the seconds the seeker was seeked into */
  onChange?: (value: number) => void
  /**the seconds the seeker was released on */
  isPaused: boolean
  onPlayButtonClick: () => void
}

function getFormattedTime(seconds: number) {
  let time = ''
  if (seconds / 60 < 10) {
    time += '0'
  }
  time += Math.floor(seconds / 60) + ':'
  if (seconds % 60 < 10) {
    time += '0'
  }
  time += (seconds % 60) + ''
  return time
}

export default function Seeker({ currentSeconds, totalSeconds, onChange, isPaused, onPlayButtonClick }: SeekerProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState(0)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value)
    onChange?.(newValue)
  }

  const gradientPercent = Math.round((currentSeconds / totalSeconds) * 100)

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (parentRef.current && textRef.current)
        setWidth(parentRef.current.offsetWidth - 1.5 * textRef.current.offsetWidth)
    })
    observer.observe(parentRef.current as Element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={parentRef} className="group/editor-seeker flex flex-nowrap items-center gap-x-2 bg-[#141619] px-2 py-1">
      <button className="text-[#42454D] group-hover/editor-seeker:text-[#9CA0AA]" onClick={onPlayButtonClick}>
        {isPaused ? <MdPauseCircleOutline /> : <MdPlayCircleOutline />}
      </button>
      <input
        min={0}
        max={totalSeconds}
        value={currentSeconds}
        onChange={handleChange}
        type="range"
        style={{
          width: width + 'px',
          background: `linear-gradient(to right, #375DAF ${gradientPercent}%, #42454D ${gradientPercent}%)`
        }}
        className="trasition-all h-1 min-w-20 cursor-pointer appearance-none
          overflow-hidden rounded bg-[#42454D] duration-150
          ease-in-out focus:outline-none
          disabled:pointer-events-none disabled:opacity-50 group-hover/editor-seeker:h-2
          [&::-moz-range-progress]:bg-[#375DAF]
          [&::-moz-range-thumb]:h-full
          [&::-moz-range-thumb]:w-2
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:rounded
          [&::-moz-range-thumb]:bg-[#213869]
          group-hover/editor-seeker:[&::-moz-range-thumb]:bg-[#879ECF]
          [&::-moz-range-track]:h-full
          [&::-moz-range-track]:w-full
          [&::-moz-range-track]:rounded
          [&::-moz-range-track]:bg-[#42454D]
          [&::-webkit-slider-runnable-track]:h-full
          [&::-webkit-slider-runnable-track]:w-full
          [&::-webkit-slider-runnable-track]:rounded
          [&::-webkit-slider-thumb]:h-full
          [&::-webkit-slider-thumb]:w-2
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded
          [&::-webkit-slider-thumb]:bg-[#213869]
          group-hover/editor-seeker:[&::-webkit-slider-thumb]:bg-[#879ECF]
        "
      />
      <span ref={textRef} className="whitespace-nowrap text-sm text-[#B2B5BD] group-hover/editor-seeker:text-[#F5F5F5]">
        {getFormattedTime(currentSeconds)} / {getFormattedTime(totalSeconds)}
      </span>
    </div>
  )
}
