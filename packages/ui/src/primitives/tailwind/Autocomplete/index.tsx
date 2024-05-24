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
import React, { useEffect } from 'react'
import Input from '../Input'

export interface AutoCompleteProps {
  className?: string
  options: { name: string }[]
  placeholder?: string
  onSelect: (value: string) => void
  value: string
}

const AutoComplete = ({ options, onSelect, placeholder, className, value }: AutoCompleteProps) => {
  const filteredOptions = useHookstate<typeof options>([])
  const showDropdown = useHookstate(false)
  const inputValue = useHookstate(value)

  useEffect(() => {
    inputValue.set(value)
  }, [value])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.currentTarget.value
    inputValue.set(keyword)

    if (keyword.trim() === '') {
      filteredOptions.set([])
      showDropdown.set(false)
      return
    }

    const filtered = options.filter((option) => option.name.toLowerCase().includes(keyword.toLowerCase()))

    filteredOptions.set(filtered)
    showDropdown.set(true)
  }

  const handleClick = (option) => {
    inputValue.set(option.name)
    showDropdown.set(false)
    onSelect(option.name)
  }

  return (
    <div className={`relative ${className}`}>
      <Input value={inputValue.value} placeholder={placeholder} className="w-full" onChange={onChange} />
      {showDropdown.value && filteredOptions.value.length > 0 && (
        <div className="border-theme-primary bg-theme-surface-main absolute z-10 mt-2 w-full rounded border ">
          <ul className="max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2">
            {filteredOptions.value.map((option, index) => (
              <li
                key={index}
                className="text-theme-secondary cursor-pointer px-4 py-2"
                onClick={() => handleClick(option)}
              >
                {option.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default AutoComplete
