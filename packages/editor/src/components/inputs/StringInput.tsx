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

import './Input.css'

const inputStyle = {
  display: 'flex',
  width: '100%',
  margin: 0
}

interface StyledStringInputProps {
  className?: string
  onChange: (e: string) => void
  onRelease?: (e: FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  onKeyUp?: any
  value?: string
  style?: React.CSSProperties
}

const StyledStringInput = React.forwardRef<any, StyledStringInputProps>(
  ({ className = '', onChange, onRelease, ...rest }, ref) => {
    return (
      <input
        className={`StyledNumericInput ${className}`}
        onChange={(ev) => onChange(ev.target.value)}
        style={inputStyle}
        {...rest}
        ref={ref}
      />
    )
  }
)

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
  style?: React.CSSProperties
}

const StringInput = React.forwardRef<any, StringInputProps>(({ onChange, onRelease, ...rest }, ref) => {
  const { error, canDrop, ...other } = rest
  return (
    <input
      className="Input"
      style={inputStyle}
      onBlur={(event) => onRelease?.(event.target.value)}
      onChange={(event) => onChange?.(event.target.value)}
      {...other}
      ref={ref}
    />
  )
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
  const { onChange, onRelease, value, ...rest } = values
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
    <div style={containerStyle} ref={ref}>
      <StyledStringInput
        ref={inputRef}
        className="Input"
        onChange={setTempValue}
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
