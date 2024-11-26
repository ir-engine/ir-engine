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

import { useClickOutside } from '@ir-engine/common/src/utils/useClickOutside'
import { ChevronDownSm, HelpIconSm } from '@ir-engine/ui/src/icons'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { DropdownItem } from '../Dropdown'
import { InputProps, variantSizes } from '../Input'
import Tooltip from '../Tooltip'

export interface OptionType {
  value: string | number
  label: string
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**text shown on the right end */
  secondaryText?: string
  disabled?: boolean
  selected?: boolean
  className?: string
}

export interface SelectProps<T = string | number> {
  options: OptionType[]
  width?: 'sm' | 'md' | 'lg' | 'full'
  inputSizeVariant?: InputProps['variantSize']
  onChange: (value: T) => void
  value: T
  labelProps?: InputProps['labelProps']
  state?: InputProps['state']
  helperText?: InputProps['helperText']
  required?: boolean
  disabled?: boolean
}

const variantToWidth: Record<NonNullable<SelectProps['width']>, string> = {
  sm: '240px',
  md: '320px',
  lg: '520px',
  full: '100%'
}

const Select = ({
  options,
  width = 'md',
  inputSizeVariant = 'l',
  onChange,
  value,
  labelProps,
  state,
  helperText,
  required,
  disabled
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const [positioning, setPositioning] = useState({
    direction: 'down' as 'down' | 'up',
    maxHeight: '0px'
  })
  const ref = useRef<HTMLDivElement>(null)
  const [selectedLabelContent, setSelectedLabelContent] = useState<React.ReactNode>(null)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(-1)
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const labelRef = useRef<HTMLLabelElement>(null)
  const [helperOffset, setHelperOffset] = useState('')

  useLayoutEffect(() => {
    const updateDirection = () => {
      if (ref.current) {
        const { top, bottom } = ref.current.getBoundingClientRect()
        const windowHeight = window.innerHeight

        const spaceAbove = top
        const spaceBelow = windowHeight - bottom

        const newDirection = spaceBelow >= spaceAbove ? 'down' : 'up'
        const maxHeight = newDirection === 'down' ? 0.8 * spaceBelow : 0.8 * spaceAbove
        setPositioning({
          direction: newDirection,
          maxHeight: `${maxHeight}px`
        })
      }
    }
    updateDirection()
    window.addEventListener('resize', updateDirection)

    return () => {
      window.removeEventListener('resize', updateDirection)
    }
  }, [])

  useLayoutEffect(() => {
    const updateHelperTextPosition = () => {
      if (labelProps?.position === 'left' && labelRef.current) {
        setHelperOffset(`${labelRef.current.offsetWidth + 8}px`)
      } else {
        setHelperOffset('')
      }
    }

    updateHelperTextPosition()

    window.addEventListener('resize', updateHelperTextPosition)
    return () => {
      window.removeEventListener('resize', updateHelperTextPosition)
    }
  }, [labelProps])

  useClickOutside(ref, () => {
    setOpen(false)
  })

  useEffect(() => {
    if (value === '') {
      setSelectedLabelContent(null)
      return
    }

    if (
      0 <= selectedOptionIndex &&
      selectedOptionIndex < options.length &&
      options[selectedOptionIndex].value === value
    ) {
      setSelectedLabelContent(options[selectedOptionIndex].label)
      return
    }

    const index = options.findIndex((option) => option.value === value)

    if (index === -1) {
      console.warn('No corresponding option found. Defaulting to null.')
      setSelectedLabelContent(null)
      return
    }

    setSelectedLabelContent(options[index].label)
  }, [value, options, selectedOptionIndex])

  return (
    <div className={`flex flex-col gap-y-2 ${width === 'full' ? 'w-full' : 'w-fit'}`}>
      <div
        className={twMerge(
          'flex',
          width === 'full' ? 'w-full' : 'w-fit',
          labelProps?.position === 'top' && 'flex-col gap-y-2',
          labelProps?.position === 'left' && 'flex-row items-center gap-x-2'
        )}
      >
        {labelProps?.text && (
          <label className="block text-xs font-medium" ref={labelRef}>
            <div className="flex flex-row items-center gap-x-1.5">
              <div className="flex flex-row items-center gap-x-0.5">
                {required && <span className="text-sm text-[#E11D48]">*</span>}
                <span className="text-xs text-[#D3D5D9]">{labelProps.text}</span>
              </div>

              {labelProps?.infoText && (
                <Tooltip content={labelProps.infoText}>
                  <HelpIconSm className="text-[#9CA0AA]" />
                </Tooltip>
              )}
            </div>
          </label>
        )}

        <div
          ref={ref}
          className="relative"
          style={{
            width: variantToWidth[width]
          }}
        >
          <div
            onClick={() => {
              if (!disabled) {
                setOpen((v) => !v)
              }
            }}
            tabIndex={0}
            className={twMerge(
              `relative flex w-full items-center gap-x-2 rounded-md border-[0.5px] border-[#42454D] bg-[#141619] text-[#9CA0AA] ${
                variantSizes[inputSizeVariant]
              } ${disabled && 'cursor-not-allowed bg-[#191B1F] text-[#6B6F78]'} transition-colors duration-300`,
              'focus:outline-none',
              state === 'success' && 'border-[#10B981]',
              state === 'error' && 'border-[#C3324B]'
            )}
            onKeyUp={(e) => {
              if (disabled || !open) return

              let newIndex = activeIndex

              if (activeIndex === -1) {
                if (e.code === 'ArrowUp') {
                  newIndex = options.length - 1
                } else if (e.code === 'ArrowDown') {
                  newIndex = 0
                }
              } else if (e.code === 'ArrowUp') {
                newIndex = (activeIndex - 1 + options.length) % options.length
              } else if (e.code === 'ArrowDown') {
                newIndex = (activeIndex + 1) % options.length
              }

              setActiveIndex(newIndex)
              if (['Enter', ' '].includes(e.code)) {
                onChange(options[newIndex].value)
                setOpen(false)
                setSelectedOptionIndex(newIndex)
              }
            }}
          >
            <div className="w-full">{selectedLabelContent || '-'}</div>

            <ChevronDownSm className={`${open && 'rotate-180'} duration-300`} />
          </div>

          {open && (
            <div
              className={`absolute flex w-full flex-col overflow-y-auto rounded-lg ${
                positioning.direction === 'down' && 'top-[calc(100%+0.5rem)]'
              } ${positioning.direction === 'up' && 'bottom-[calc(100%+0.5rem)]'}`}
              style={{
                maxHeight: positioning.maxHeight
              }}
            >
              {options.map(({ value: currentValue, ...optionProps }, index) => (
                <DropdownItem
                  key={index}
                  {...optionProps}
                  selected={value === currentValue}
                  active={index === activeIndex}
                  onClick={() => {
                    onChange(currentValue)
                    setOpen(false)
                    setSelectedOptionIndex(index)
                  }}
                  onMouseEnter={() => {
                    setActiveIndex(index)
                  }}
                  onMouseLeave={() => {
                    setActiveIndex(-1)
                  }}
                  onKeyUp={(e) => {
                    if (e.code === 'Enter') {
                      onChange(currentValue)
                      setOpen(false)
                      setSelectedOptionIndex(index)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {helperText && !open && (
        <span
          className={`text-xs ${state === 'success' && 'text-[#0D9467]'} ${state === 'error' && 'text-[#C3324B]'}`}
          style={{
            translate: helperOffset
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  )
}

export default Select
