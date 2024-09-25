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
import { HiCheck } from 'react-icons/hi'

import { twMerge } from 'tailwind-merge'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: boolean
  label?: React.ReactNode
  description?: React.ReactNode
  onChange: (value: boolean) => void
}

const Checkbox = ({ label, value, onChange, description, ...props }: CheckboxProps) => {
  const id = useId()

  const handleChange = () => {
    if (!props.disabled) {
      onChange(!value)
    }
  }

  return (
    <div
      className={twMerge('relative flex cursor-pointer items-center accent-[#5F7DBF]', description && 'items-start')}
    >
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleChange()
          }
        }}
        className={twMerge(
          'peer relative appearance-none',
          'grid h-4 w-4 place-items-center rounded',
          'border border-[#42454D] bg-[#141619]',
          !value && 'hover:border-[#9CA0AA] hover:bg-[#191B1F]',
          !value && 'focus:border-[#375DAF] focus:bg-[#212226] focus:outline-none',
          value && 'border-[#5F7DBF] bg-[#212226]',
          'disabled:-z-10 disabled:border-[#42454D] disabled:bg-[#191B1F]'
        )}
        {...props}
      />
      <HiCheck
        onClick={handleChange}
        className={twMerge(
          'absolute m-0.5 hidden h-3 w-3 text-[#5F7DBF]  peer-checked:block peer-disabled:text-[#42454D]',
          props.disabled && 'cursor-not-allowed'
        )}
      />
      {label && (
        <label
          htmlFor={id}
          className="ml-2 block cursor-pointer self-stretch text-sm text-[#D3D5D9] peer-disabled:cursor-auto peer-disabled:text-[#6B6F78]"
          onClick={handleChange}
        >
          {label}
          <span className="block max-w-[220px] text-wrap">{description}</span>
        </label>
      )}
    </div>
  )
}
export default Checkbox
