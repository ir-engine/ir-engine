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

import React, { useId } from 'react'
import { twMerge } from 'tailwind-merge'

export interface RadioProps {
  disabled?: boolean
  label: string
  name?: string
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void
  value?: string
  defaultChecked?: boolean
  description?: string
}

const RadioRoot = ({ disabled, label, name, onChange, value, description, defaultChecked }: RadioProps) => {
  const radioId = useId()
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-2">
        <div className="mt-1 grid place-items-center">
          <input
            id={radioId}
            type="radio"
            name={name}
            disabled={disabled}
            className="
            focus:ring-primary-blue
            peer col-start-1
            row-start-1 h-4
            w-4 shrink-0 appearance-none rounded-full border-[1.5px]
            border-blue-500 focus:outline-none focus:ring-[0.5px] focus:ring-offset-0
            disabled:border-gray-400
          "
            onChange={onChange}
            defaultChecked={defaultChecked}
            value={value}
          />
          <div
            className={twMerge(
              'pointer-events-none',
              'col-start-1 row-start-1',
              'h-2 w-2 rounded-full peer-checked:bg-blue-500',
              'peer-checked:peer-disabled:bg-gray-400'
            )}
          />
        </div>
        <label htmlFor={radioId} className={twMerge('text-start hover:cursor-pointer', disabled && 'text-gray-400')}>
          {label}
        </label>
      </div>
      {description && <div className="ml-6 text-sm text-gray-400">{description}</div>}
    </div>
  )
}

type OptionType = {
  value: string
  label: string
  description?: string
}
export interface RadioGroupProps<T> {
  value?: T
  disabled?: boolean
  name?: string
  onChange: (value: T) => void
  options: OptionType[]
  horizontal?: boolean
  className?: string
}

type OptionValueType = string | number

const Radio = <T extends OptionValueType>({
  disabled,
  name,
  onChange,
  options,
  horizontal,
  className,
  value
}: RadioGroupProps<T>) => {
  const handleChange = (event: React.FormEvent<HTMLInputElement>) => onChange(event.currentTarget.value as T)
  const defaultName = 'radio-button-group'
  return (
    <div className={twMerge(`grid gap-6 ${horizontal ? 'grid-flow-col' : ''}`, className)}>
      {options.map(({ label: optionLabel, value: valueOption, description }, index) => (
        <div key={valueOption} className="flex items-center gap-2">
          <RadioRoot
            name={name || defaultName}
            disabled={disabled}
            label={optionLabel}
            onChange={handleChange}
            value={valueOption}
            description={description}
            defaultChecked={value === valueOption}
          />
        </div>
      ))}
    </div>
  )
}

export default Radio
