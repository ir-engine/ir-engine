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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { CheckMd, ChevronDownMd } from '@ir-engine/ui/src/icons'
import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface DropdownOption {
  label: string
  value: string | number
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  backgroundColor?: 'black' | 'white'
  border?: boolean
}

/**
 * A reusable dropdown component with custom styling
 */
const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  backgroundColor,
  border = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bgColor = backgroundColor === 'black' ? 'black' : 'white'

  const selectedOption = options.find((option) => option.value === value)

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelect = (optionValue: string | number) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={twMerge(
          `
            flex w-full items-center justify-between rounded-lg border-white/20
            px-4 py-3 text-left text-white backdrop-blur-sm
          `,
          disabled ? 'cursor-not-allowed opacity-50' : `cursor-pointer`,
          isOpen ? 'ring-2 ring-white/30' : '',
          border && 'border',
          bgColor === 'black' ? `bg-black/10 hover:bg-black/15` : `bg-white/10 hover:bg-white/15`
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDownMd
          className={`h-5 w-5 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-white/20 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                flex w-full items-center justify-between px-4 py-3 text-left text-gray-900
                hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                ${option.value === value ? 'bg-gray-100' : ''}
              `}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <CheckMd className="h-4 w-4 text-gray-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
