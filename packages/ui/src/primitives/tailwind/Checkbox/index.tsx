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
import { HiCheck } from 'react-icons/hi'

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

const Checkbox = ({ className, containerClassName, label, value, onChange, disabled }: CheckboxProps) => {
  return (
    <div
      onClick={() => {
        if (!disabled) {
          onChange(!value)
        }
      }}
      className={twMerge('flex cursor-pointer items-end space-x-2', containerClassName)}
    >
      <div
        className={twMerge(
          'grid h-4 w-4 place-items-center rounded border border-theme-primary',
          value ? 'bg-blue-500' : 'bg-theme-surfaceInput',
          disabled ? 'cursor-not-allowed opacity-50' : ''
        )}
      >
        {value && <HiCheck className="h-3 w-3 text-white" />}
      </div>

      {label && <Label className="cursor-pointer self-stretch leading-[1.15]">{label}</Label>}
    </div>
  )
}

export default Checkbox
