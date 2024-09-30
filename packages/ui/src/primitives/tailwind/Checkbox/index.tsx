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

import React, { useEffect, useId, useState } from 'react'
import { FaCheck, FaMinus } from 'react-icons/fa6'

import { twMerge } from 'tailwind-merge'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  indeterminate?: boolean
  label?: React.ReactNode
  description?: React.ReactNode
  onChange: (checked: boolean) => void
}

const Checkbox = (
  { label, checked, indeterminate, disabled, onChange, description, ...props }: CheckboxProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const id = useId()

  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  const [isCheckedInternal, setIsCheckedInternal] = useState(checked)
  const [isIndeterminateInternal, setIsIndeterminateInternal] = useState(indeterminate)

  useEffect(() => {
    if (checked) {
      setIsCheckedInternal(true)
      setIsIndeterminateInternal(false)
    } else {
      setIsCheckedInternal(false)
      setIsIndeterminateInternal(indeterminate)
    }
  }, [checked])

  useEffect(() => {
    if (indeterminate) {
      setIsCheckedInternal(false)
      setIsIndeterminateInternal(true)
    } else {
      setIsIndeterminateInternal(false)
      setIsCheckedInternal(checked)
    }
  }, [indeterminate])

  return (
    <div
      className={twMerge(
        'relative flex cursor-pointer items-center justify-center gap-x-2',
        description && 'items-start'
      )}
    >
      <div
        className={twMerge(
          'relative',
          'grid h-4 w-4 place-items-center rounded',
          'border border-[#42454D] bg-[#141619]',
          !isCheckedInternal && !isIndeterminateInternal && !disabled && 'hover:border-[#9CA0AA] hover:bg-[#191B1F]',
          !isCheckedInternal && !disabled && 'focus:border-[#375DAF] focus:bg-[#212226]',
          (isCheckedInternal || isIndeterminateInternal) && 'border-[#375DAF] bg-[#212226]',
          disabled && 'cursor-not-allowed border-[#42454D] bg-[#191B1F]'
        )}
        onClick={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleChange()
          }
        }}
        tabIndex={0}
        ref={ref}
        id={id}
        {...props}
      >
        <FaCheck
          onClick={handleChange}
          className={twMerge(
            'absolute h-3 w-3 transition-transform duration-200 ease-in-out',
            disabled ? 'cursor-not-allowed text-[#42454D]' : 'text-[#5F7DBF]',
            isCheckedInternal ? 'scale-100' : 'scale-0'
          )}
        />

        <FaMinus
          onClick={handleChange}
          className={twMerge(
            'absolute h-3 w-3 transition-transform duration-200 ease-in-out',
            disabled ? 'cursor-not-allowed text-[#42454D]' : 'text-[#5F7DBF]',
            isIndeterminateInternal ? 'scale-100' : 'scale-0'
          )}
        />
      </div>

      {label && (
        <div
          className={twMerge(
            'text-sm',
            disabled ? 'cursor-auto text-[#6B6F78]' : 'cursor-pointer text-[#D3D5D9]',
            description && 'grid gap-y-1 leading-none'
          )}
          onClick={handleChange}
        >
          <p>{label}</p>
          <p className="block max-w-[220px] text-wrap">{description}</p>
        </div>
      )}
    </div>
  )
}
export default React.forwardRef(Checkbox)
