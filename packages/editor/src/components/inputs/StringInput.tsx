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

import './Input.css'

const inputStyle = {
  display: 'flex',
  width: '100%',
  margin: 0
}

interface StyledNumericInputProps {
  className?: string
  onChange?: any
  value?: string
}

const StyledNumericInput = React.forwardRef<any, StyledNumericInputProps>(
  ({ className = '', onChange, ...rest }, ref) => {
    if (!onChange) {
      return (
        <input className={`StyledNumericInput ${className}`} readOnly={true} style={inputStyle} {...rest} ref={ref} />
      )
    }
    return (
      <input className={`StyledNumericInput ${className}`} onChange={onChange} style={inputStyle} {...rest} ref={ref} />
    )
  }
)

export interface StringInputProps {
  id?: string
  value?: string
  onChange?: (e: any) => void
  onRelease?: (e: any) => void
  required?: boolean
  pattern?: string
  title?: string
  error?: boolean
  canDrop?: boolean
  onFocus?: any
  onBlur?: any
  onKeyUp?: any
  type?: string
  placeholder?: string
  disabled?: boolean
}

const StringInput = React.forwardRef<any, StringInputProps>(({ onChange, onRelease, ...rest }, ref) => {
  const { error, canDrop, ...other } = rest
  return <input className="Input" style={inputStyle} onBlur={onRelease} onChange={onChange} {...other} ref={ref} />
})

StringInput.displayName = 'StringInput'
StringInput.defaultProps = {
  value: '',
  onChange: () => {},
  type: 'text',
  required: false,
  placeholder: ''
}

export default StringInput

const containerStyle = {
  display: 'flex',
  width: '100%'
}

export const ControlledStringInput = React.forwardRef<any, StringInputProps>((values, ref) => {
  const { onChange, value, ...rest } = values
  const { error, canDrop, ...other } = rest
  const inputRef = useRef<HTMLInputElement>()
  const [tempValue, setTempValue] = useState(value)

  const onKeyUp = useCallback((e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current?.blur()
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

  return (
    <div style={containerStyle} ref={ref}>
      <StyledNumericInput
        ref={inputRef}
        className="Input"
        onChange={onChangeValue}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        value={tempValue || ''}
        onFocus={onFocus}
        {...other}
      />
    </div>
  )
})

ControlledStringInput.displayName = 'ControlledStringInput'

ControlledStringInput.defaultProps = {
  value: '',
  onChange: () => {},
  type: 'text',
  required: false
}
