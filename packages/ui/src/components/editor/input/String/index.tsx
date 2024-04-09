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

import React, { FocusEvent, useEffect, useRef, useState } from 'react'
import Input from '../../../../primitives/tailwind/Input'

export interface StringInputProps {
  id?: string
  value?: string
  onChange?: (e: string) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  onRelease?: any
  onFocus?: any
  required?: boolean
  pattern?: string
  title?: string
  error?: boolean
  canDrop?: boolean
  onKeyUp?: any
  type?: string
  placeholder?: string
  disabled?: boolean
}

const StringInput = ({ value, onChange, onRelease, onFocus, disabled, placeholder, type, ...rest }) => {
  const { error, canDrop, ...other } = rest
  return (
    <Input
      containerClassname="w-[178px] h-[30px] bg-zinc-900 rounded-[5px]"
      className="w-full bg-inherit font-['Figtree'] text-xs font-normal text-neutral-400"
      override={true}
      value={value ?? ''}
      onChange={(e) => {
        onChange?.(e.target.value)
      }}
      onRelease={(e) => {
        onRelease?.(e.target.value)
      }}
      onFocus={(e) => {
        onRelease?.(e.target.value)
      }}
      disabled={disabled}
      type={type}
      placeholder={placeholder}
    />
  )
}

StringInput.displayName = 'StringInput'
StringInput.defaultProps = {
  value: '',
  onChange: () => {},
  type: 'text',
  required: false,
  placeholder: ''
}

export default StringInput

// do we really need a controlled string input? we could easily integrate this with string input itself
export const ControlledStringInput = React.forwardRef<any, StringInputProps>((values, ref) => {
  const { onChange, onRelease, value, placeholder, disabled, type, ...rest } = values
  const { error, canDrop, ...other } = rest
  const inputRef = useRef<HTMLInputElement>()
  const [tempValue, setTempValue] = useState(value)

  const onKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    setTempValue(value)
  }, [value])

  const onBlur = () => {
    onRelease?.(tempValue)
  }

  const onChangeValue = (e) => {
    setTempValue(e.target.value)
    onChange?.(e.target.value)
  }

  const onFocus = () => {
    inputRef.current?.select()
    if (rest.onFocus) rest.onFocus()
  }

  return (
    <Input
      ref={ref}
      containerClassname="w-[246px] h-[30px] bg-zinc-900 rounded-[5px]"
      className="w-[220px] bg-inherit font-['Figtree'] text-xs font-normal text-neutral-400"
      override={true}
      value={value ?? ''}
      onChange={(e) => {
        onChangeValue(e.target.value)
      }}
      onRelease={onBlur}
      onFocus={onFocus}
      disabled={disabled}
      type={type}
      placeholder={placeholder}
    />
  )
})

ControlledStringInput.displayName = 'ControlledStringInput'

ControlledStringInput.defaultProps = {
  value: '',
  onChange: () => {},
  type: 'text',
  required: false
}
