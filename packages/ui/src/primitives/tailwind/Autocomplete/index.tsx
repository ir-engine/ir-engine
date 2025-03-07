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

import React from 'react'
import Input from '../Input'

export type AutoCompleteOptionsType = { label: string; value: any }

export interface AutoCompleteProps {
  value: string
  options: AutoCompleteOptionsType[]
  className?: string
  placeholder?: string
  onSelect: (value: any) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const AutoComplete = ({ options, onSelect, placeholder, className, value, onChange }: AutoCompleteProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      <Input value={value} placeholder={placeholder} onChange={onChange} />
      {options.length > 0 && (
        <div className="sticky left-0 z-[60] mt-2 w-full rounded border border-theme-primary bg-theme-surface-main">
          <ul className="max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2">
            {options.map((option, index) => (
              <li
                key={index}
                className="cursor-pointer px-4 py-2 text-theme-secondary"
                onClick={() => onSelect(option.value)}
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
