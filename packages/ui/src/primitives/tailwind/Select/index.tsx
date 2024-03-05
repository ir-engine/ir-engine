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

import { useClickOutside } from '@etherealengine/common/src/utils/useClickOutside'
import { useHookstate } from '@etherealengine/hyperflux'
import React, { useEffect, useRef } from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import Input from '../Input'

export interface SelectProps {
  label?: string
  className?: string
  error?: string
  description?: string
  currentValue: any
  options: { name: string; value: any; disabled?: boolean }[]
  onChange: (value: any) => void
  placeholder?: string
  disabled?: boolean
  menuClassname?: string
}

const Select = ({
  className,
  label,
  error,
  description,
  currentValue,
  options,
  onChange,
  placeholder,
  disabled,
  menuClassname
}: SelectProps) => {
  const twClassName = twMerge('bg-theme-primary relative', className)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = useHookstate(currentValue)
  const filteredOptions = useHookstate(options)

  const showOptions = useHookstate(false)

  placeholder = placeholder || 'Select an Option'

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectLabel.set(e.target.value)
    const newOptions: {
      name: string
      value: any
    }[] = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].name.toLowerCase().startsWith(e.target.value.toLowerCase())) {
        newOptions.push(options[i])
      }
    }
    filteredOptions.set(newOptions)
  }

  useEffect(() => {
    filteredOptions.set(options)
  }, [options])

  const selectLabel = useHookstate(options.find((option) => option.value === currentValue)?.name || '')

  useClickOutside(ref, () => showOptions.set(false))

  return (
    <div className={twClassName}>
      <Input
        disabled={disabled}
        label={label}
        description={description}
        error={error}
        className="cursor-pointer"
        placeholder={placeholder}
        value={selectLabel.value}
        onChange={handleOnChange}
        onClick={() => {
          showOptions.set(!showOptions.value)
        }}
      />

      <MdOutlineKeyboardArrowDown
        size="1.5em"
        className={`text-theme-primary absolute right-3 top-8 transition-transform ${
          showOptions.value ? 'rotate-180' : ''
        }`}
      />

      <div
        ref={ref}
        className={`border-theme-primary bg-theme-secondary absolute z-10 mt-2 w-full rounded border ${
          showOptions.value ? 'visible' : 'hidden'
        }`}
      >
        <ul className={twMerge('max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2 [&>li]:text-gray-200', menuClassname)}>
          {filteredOptions.value.map((option) => (
            <li
              key={option.value}
              value={option.value}
              className={twMerge(
                'text-theme-primary cursor-pointer px-4 py-2',
                option.disabled ? 'cursor-not-allowed' : 'hover:text-theme-highlight hover:bg-theme-primary'
              )}
              onClick={() => {
                if (option.disabled) return
                selectedOption.set(option.value)
                showOptions.set(false)
                onChange?.(option.value)
                selectLabel.set(option.name)
              }}
            >
              {option.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Select
