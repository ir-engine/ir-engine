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

import { ColorResult } from '@uiw/color-convert'
import SketchPicker from '@uiw/react-color-sketch'
import React from 'react'
import { Color } from 'three'

import { twMerge } from 'tailwind-merge'
import Text from '../Text'

interface ColorInputProp {
  value: Color
  onChange: (color: Color) => void
  disabled?: boolean
  isValueAsInteger?: boolean
  className?: string
  textClassName?: string
  sketchPickerClassName?: string
}

export function ColorInput({
  value,
  onChange,
  disabled,
  className,
  textClassName,
  sketchPickerClassName
}: ColorInputProp) {
  const hexColor = typeof value.getHexString === 'function' ? '#' + value.getHexString() : '#000'

  const handleChange = (result: ColorResult) => {
    const color = new Color(result.hex)
    onChange(color)
  }

  return (
    <div
      className={twMerge(
        'flex h-8 w-[200px] items-center gap-1 rounded bg-theme-primary px-1',
        disabled && 'cursor-not-allowed',
        className
      )}
    >
      <div
        tabIndex={0}
        className={`group h-5 w-5 rounded border border-black focus:border-theme-primary bg-[${hexColor}]`}
      >
        <SketchPicker
          className={twMerge(
            'absolute z-10 mt-5 scale-0 group-hover:scale-100 group-focus:scale-100',
            sketchPickerClassName
          )}
          color={hexColor}
          onChange={handleChange}
          disableAlpha={true}
        />
      </div>
      <Text fontFamily="Figtree" fontSize="xs" className={textClassName}>
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
