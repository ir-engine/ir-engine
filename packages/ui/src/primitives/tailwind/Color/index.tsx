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
import { ColorResult } from '@uiw/color-convert'
import SketchPicker from '@uiw/react-color-sketch'
import React, { useEffect, useRef, useState } from 'react'
import { Color, ColorRepresentation } from 'three'

import { twMerge } from 'tailwind-merge'
import Text from '../Text'

interface ColorInputProp {
  value: ColorRepresentation
  onChange: (color: Color) => void
  onRelease?: (color: Color) => void
  disabled?: boolean
  isValueAsInteger?: boolean
  className?: string
  textClassName?: string
  sketchPickerClassName?: string
}

export function ColorInput({
  value,
  onChange,
  onRelease,
  disabled,
  className,
  textClassName,
  sketchPickerClassName
}: ColorInputProp) {
  const color = new Color(value)
  const hexColor = '#' + color.getHexString()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)

  const handleTogglePicker = () => {
    if (!isPickerOpen) {
      setIsPickerOpen(true)
    }
    onRelease && onRelease(color)
  }

  const handleChange = (result: ColorResult) => {
    const color = new Color(result.hex)
    onChange(color)
  }

  // Close the picker if clicking outside the input or picker - this method didn't require a new signature
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setIsPickerOpen(false)
        if (onRelease) onRelease(color)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [hexColor, onRelease])

  return (
    <div
      tabIndex={0} // Make the div focusable
      ref={inputRef} // Ref to track focus on the input
      className={twMerge(
        'relative flex h-9 items-center gap-1 rounded-lg border-none bg-[#1A1A1A] px-2 text-xs text-[#8B8B8D]',
        disabled && 'cursor-not-allowed',
        className
      )}
      onClick={handleTogglePicker} //opens the color picker
    >
      <div
        className={`group h-5 w-5 cursor-pointer rounded border border-black focus:border-theme-primary`}
        style={{ backgroundColor: hexColor }}
      >
        {isPickerOpen && ( //state to track open/close of color picker
          <div ref={pickerRef}>
            <SketchPicker
              className={twMerge('absolute right-4 z-10 mt-5 bg-theme-surface-main', sketchPickerClassName)}
              color={hexColor}
              onChange={handleChange}
              disableAlpha={true}
              onPointerLeave={() => {
                onRelease && onRelease(color)
              }}
            />
          </div>
        )}
      </div>
      <Text fontSize="xs" className={textClassName}>
        {hexColor.toUpperCase()}
      </Text>
    </div>
  )
}

ColorInput.defaultProps = {
  value: new Color(),
  onChange: () => {}
}

export default ColorInput
