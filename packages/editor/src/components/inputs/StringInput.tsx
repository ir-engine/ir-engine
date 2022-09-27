import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Input from './Input'

const StyledStringInput = (styled as any)(Input)`
  display: flex;
  width: 100%;
`

export interface StringInputProp {
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

const StringInput = React.forwardRef<{}, StringInputProp>(({ onChange, ...rest }, ref) => (
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

export const ControlledStringInput = React.forwardRef<{}, StringInputProp>((values, ref) => {
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
