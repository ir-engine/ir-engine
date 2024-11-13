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

import React, { useEffect, useState } from 'react'
import Input, { InputProps } from '../../../../primitives/tailwind/Input'

export interface StringInputProps extends Omit<InputProps, 'onChange'> {
  value: string
  onChange?: (value: string) => void
  onRelease?: (value: string) => void
  inputRef?: React.Ref<any>
}

const StringInput = ({ value, onChange, onRelease, inputRef, ...rest }: StringInputProps) => {
  return (
    <Input
      value={value}
      onChange={(e) => {
        onChange?.(e.target.value)
      }}
      onBlur={(e) => {
        onRelease?.(e.target.value)
      }}
      onFocus={(e) => {
        onRelease?.(e.target.value)
      }}
      ref={inputRef}
      {...rest}
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
  const [tempValue, setTempValue] = useState(value)

  useEffect(() => {
    setTempValue(value)
  }, [value])

  const onBlur = () => {
    onRelease?.(tempValue)
  }

  const onChangeValue = (value: string) => {
    setTempValue(value)
    onChange?.(value)
  }

  return (
    <Input
      ref={ref}
      value={tempValue ?? ''}
      onChange={(e) => {
        onChangeValue(e.target.value)
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      type="text"
    />
  )
})

ControlledStringInput.displayName = 'ControlledStringInput'

ControlledStringInput.defaultProps = {
  value: '',
  onChange: () => {},
  type: 'text'
}
