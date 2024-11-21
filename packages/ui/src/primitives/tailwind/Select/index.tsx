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

import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { calculateAndApplyYOffset } from '@ir-engine/common/src/utils/offsets'
import { useClickOutside } from '@ir-engine/common/src/utils/useClickOutside'
import { useHookstate } from '@ir-engine/hyperflux'

import Input, { InputProps } from '../Input'

export type OptionValueType = string | number

export type SelectOptionsType = { label: string; value: any; disabled?: boolean }

export interface SelectProps<T extends OptionValueType> {
  label?: string
  className?: string
  error?: string
  description?: string
  options: SelectOptionsType[]
  currentValue: T
  onChange: (value: T) => void
  placeholder?: string
  disabled?: boolean
  menuClassname?: string
  menuItemClassName?: string
  labelClassName?: string
  inputVariant?: InputProps['variantSize']
  inputClassName?: string
  errorBorder?: boolean
  searchDisabled?: boolean
  inputContainerClassName?: string
  endComponent?: JSX.Element
}

const Select = <T extends OptionValueType>({
  className,
  label,
  error,
  description,
  options,
  currentValue,
  onChange,
  placeholder,
  disabled,
  menuClassname,
  menuItemClassName,
  labelClassName,
  inputVariant,
  inputClassName,
  errorBorder,
  searchDisabled,
  inputContainerClassName,
  endComponent
}: SelectProps<T>) => {
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const showOptions = useHookstate(false)
  const filteredOptions = useHookstate(JSON.parse(JSON.stringify(options)) as SelectOptionsType[])
  const selectLabel = useHookstate('')

  useClickOutside(ref, () => showOptions.set(false))

  useEffect(() => {
    const handleResize = () => {
      calculateAndApplyYOffset(menuRef.current, -50)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const labelName = options.find((option) => option.value === currentValue)?.label
    if (labelName) selectLabel.set(labelName || '')
  }, [currentValue, options])

  useEffect(() => {
    filteredOptions.set(JSON.parse(JSON.stringify(options)))
  }, [options])

  const toggleDropdown = () => {
    if (options.length === 0) return
    showOptions.set((v) => !v)
  }

  // Prevent the input field from receiving focus with Mouse click when it is searchDisabled
  const handleMouseDown = (e: React.MouseEvent) => {
    if (searchDisabled) {
      e.preventDefault()
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchDisabled) {
      return
    }
    const newOptions = options.filter((item) => item.label.toLowerCase().startsWith(e.target.value.toLowerCase()))
    if (newOptions.length > 0) {
      filteredOptions.set(newOptions)
      selectLabel.set(e.target.value)
    }

    const optionFound = options.find((item) => item.label === e.target.value)
    if (optionFound) {
      onChange(newOptions[0].value as T)
    }
  }

  const handleOptionItem = (option: SelectOptionsType) => {
    if (option.disabled) return

    showOptions.set(false)
    onChange(option.value as T)
  }

  return (
    <div className={twMerge('relative w-full', className)} ref={ref} data-testid="select-input-container">
      <Input
        data-testid="select-input"
        disabled={disabled}
        labelProps={{
          text: label || '',
          position: 'top'
        }}
        variantSize={inputVariant}
        placeholder={placeholder || t('common:select.selectOption')}
        value={selectLabel.value}
        onChange={handleSearch}
        onClick={toggleDropdown}
        onMouseDown={handleMouseDown}
        autoComplete="off"
        endComponent={
          endComponent ?? (
            <MdOutlineKeyboardArrowDown
              size="1.5em"
              className={`mr-2 transition-transform ${showOptions.value ? 'rotate-180' : ''} ${
                disabled ? 'opacity-50' : ''
              }`}
              onClick={() => {
                if (!disabled) {
                  toggleDropdown()
                }
              }}
            />
          )
        }
        fullWidth
      />
      <div
        className={`absolute z-30 mt-2 w-full rounded border border-theme-primary bg-theme-surface-main ${
          showOptions.value ? 'visible' : 'hidden'
        }`}
        ref={menuRef}
      >
        <ul
          className={twMerge('max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2', menuClassname)}
          data-testid="select-input-list"
        >
          {filteredOptions.value.map((option, index) => (
            <li
              key={index}
              value={option.value}
              className={twMerge(
                'cursor-pointer px-4 py-2 text-theme-secondary',
                option.disabled ? 'cursor-not-allowed' : 'hover:bg-theme-highlight hover:text-theme-highlight',
                menuItemClassName
              )}
              data-testid="select-input-list-item"
              onClick={() => handleOptionItem(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Select
