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

import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Input from './Input'

const StyledStringInput = (styled as any)(Input)`
  display: flex;
  width: 100%;
`

export interface StringInputProps {
  id?: string
  value?: string
  onChange?: Function
  required?: boolean
  pattern?: string
  title?: string
  error?: boolean
  canDrop?: boolean
  onFocus?: Function
  onBlur?: Function
  onKeyUp?: Function
  type?: string
  placeholder?: string
  disabled?: boolean
}

const StringInput = React.forwardRef<{}, StringInputProps>(({ onChange, ...rest }, ref) => (
  <StyledStringInput onChange={(e) => onChange?.(e.target.value, e)} {...rest} ref={ref} />
))

StringInput.displayName = 'StringInput'
StringInput.defaultProps = {
  value: '',
  onChange: () => {},
  type: 'text',
  required: false,
  placeholder: ''
}

export default StringInput

const DropContainer = (styled as any).div`
  display: flex;
  width: 100%;
`

export const ControlledStringInput = React.forwardRef<{}, StringInputProps>((values, ref) => {
  const { onChange, value, ...rest } = values
  const inputRef = useRef<HTMLInputElement>()

  const [tempValue, setTempValue] = useState(value)

  const onKeyUp = useCallback((e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      ;(inputRef as any).current.blur()
    }
  }, [])

  useEffect(() => {
    setTempValue(value)
  }, [value])

  const onBlur = useCallback(() => {
    onChange?.(tempValue)
  }, [onChange, tempValue])

  const onChangeValue = useCallback(
    (e) => {
      setTempValue(e.target.value)
    },
    [setTempValue]
  )

  const onFocus = useCallback(() => {
    inputRef.current?.select()
    if (rest.onFocus) rest.onFocus()
  }, [rest.onFocus])

  ControlledStringInput.defaultProps = {
    value: '',
    onChange: () => {},
    type: 'text',
    required: false
  }

  return (
    <DropContainer ref={ref}>
      <StyledStringInput
        ref={inputRef}
        onChange={onChangeValue}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        value={tempValue}
        onFocus={onFocus}
        {...rest}
      />
    </DropContainer>
  )
})

ControlledStringInput.displayName = 'ControlledStringInput'
