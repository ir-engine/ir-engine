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
import { twMerge } from 'tailwind-merge'

import Label from '../Label'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: boolean
  label?: string
  className?: string
  containerClassName?: string
  onChange: (value: boolean) => void
  disabled?: boolean
}

const Checkbox = ({ className, containerClassName, label, value, onChange, disabled, ...rest }: CheckboxProps) => {
  const twClassName = twMerge(
    'disabled:border-steel-400 disabled:bg-steel-400 peer',
    'relative h-4 w-4 shrink-0 appearance-none rounded-sm',
    'border-2 border-blue-500 bg-white',
    'checked:border-0 checked:bg-blue-800 focus:outline-none focus:ring-2',
    'focus:ring-blue-500 focus:ring-offset-0 dark:focus:ring-blue-600',
    className
  )

  return (
    <div className={twMerge('flex w-full items-center gap-4', containerClassName)}>
      <input type="checkbox" onChange={(e) => onChange(e.target.value as any)} className={twClassName} {...rest} />
      {label && (
        <Label onClick={() => onChange(!value)} className="cursor-pointer self-stretch">
          {label}
        </Label>
      )}
      <svg
        className="pointer-events-none absolute hidden h-4 w-4 scale-75 text-white peer-checked:block"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}

export default Checkbox
