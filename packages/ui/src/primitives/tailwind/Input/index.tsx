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

import React, { InputHTMLAttributes } from 'react'
import { HiXCircle } from 'react-icons/hi'
import { twMerge } from 'tailwind-merge'
import Label from '../Label'

export interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  value: string | number
  label?: string
  inputClassName?: string
  description?: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange']
  error?: string
  disabled?: boolean
}

const Input = ({
  inputClassName,
  label,
  type = 'text',
  error,
  description,
  value,
  itemType,
  onChange,
  disabled,
  ...props
}: InputProps) => {
  const twInputClassname = twMerge(
    'text-base font-normal tracking-tight',
    'textshadow-sm border-theme-primary flex h-9 w-full rounded-lg border bg-transparent px-3.5 py-5 transition-colors',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
    inputClassName
  )

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {label && <Label className="self-stretch">{label}</Label>}
      <input
        disabled={disabled}
        type={type}
        className={twInputClassname}
        value={value}
        onChange={onChange}
        {...props}
      />
      {description && <p className="text-theme-secondary self-stretch text-xs">{description}</p>}
      {error && (
        <p className="text-[#E11D48 text-sm">
          <HiXCircle className="mr-2.5" /> {error}
        </p>
      )}
    </div>
  )
}

export default Input
