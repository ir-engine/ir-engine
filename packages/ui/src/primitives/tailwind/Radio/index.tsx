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

import React from 'react'

export const Radio = ({
  name,
  value,
  onChange,
  selected
}: {
  name: string
  value: string | number
  onChange: React.ChangeEventHandler<HTMLInputElement>
  selected: boolean
}) => {
  return (
    <div className="flex items-center">
      <input
        type="radio"
        checked={selected}
        value={value}
        name={name}
        onChange={onChange}
        // className="before:content[''] relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-blue-900 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-900 checked:before:bg-blue-900"
        className="shrink-0 rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800"
      />
      <label htmlFor={name} className="text-theme-primary ml-2 align-bottom text-sm font-medium">
        {name}
      </label>
    </div>
  )
}

const Radios = ({
  currentValue,
  options,
  onChange
}: {
  currentValue: any
  options: { name: string; value: any }[]
  onChange: (value: any) => void
}) => {
  return (
    <div className="grid gap-6">
      {options.map(({ name, value }) => (
        <Radio
          key={name}
          selected={currentValue === value}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ))}
    </div>
  )
}

export default Radios
