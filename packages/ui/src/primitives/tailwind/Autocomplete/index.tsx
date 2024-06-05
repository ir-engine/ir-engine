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

import { useHookstate } from '@etherealengine/hyperflux'
import React, { useEffect, useRef } from 'react'
import Input from '../Input'

export interface AutoCompleteProps {
  className?: string
  options: { label: string }[]
  placeholder?: string
  onSelect: (value: string) => void
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const AutoComplete = ({ options, onSelect, placeholder, className, value, onChange }: AutoCompleteProps) => {
  const showDropdown = useHookstate(false)
  const inputValue = useHookstate(value)
  const isSelectingOption = useRef(false)

  useEffect(() => {
    inputValue.set(value)

    if (!value) {
      showDropdown.set(false)
    }
  }, [value])

  const handleClick = (option) => {
    isSelectingOption.current = true
    inputValue.set(option.label)
    onSelect(option.label)
    showDropdown.set(false)
    setTimeout(() => {
      isSelectingOption.current = false
    }, 1)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    inputValue.set(value)
    onChange(event)
    showDropdown.set(value !== '')
  }

  return (
    <div className={`relative ${className}`}>
      <Input value={inputValue.value} placeholder={placeholder} className="w-full" onChange={handleInputChange} />
      {showDropdown.value && options.length > 0 && (
        <div className="fixed left-10 right-0 z-[60] mt-2 w-1/2 rounded border border-theme-primary bg-theme-surface-main">
          <ul className="max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2">
            {options.map((option, index) => (
              <li
                key={index}
                className="cursor-pointer px-4 py-2 text-theme-secondary"
                onClick={() => handleClick(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default AutoComplete
