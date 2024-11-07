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

import { CheckLg, MinusLg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  label?: string
  description?: string
  onChange: (checked: boolean) => void
  /**@default md */
  variantSize?: 'md' | 'lg'
  /**position where `label` and `description` will be placed
   * @default right  */
  variantTextPlacement?: 'left' | 'right'
}

const variantSizes = {
  spacings: {
    md: 'gap-x-2',
    lg: 'gap-x-4'
  },
  checkboxSizes: {
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  },
  iconSizes: {
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5'
  },
  textSizes: {
    md: 'text-sm',
    lg: 'text-base'
  },
  textLineHeight: {
    md: 'leading-5',
    lg: 'leading-6'
  },
  maxDescriptionWidth: {
    md: 'max-w-[220px]',
    lg: 'max-w-[252px]'
  }
}

const Checkbox = (
  {
    checked,
    disabled,
    indeterminate,
    label,
    description,
    onChange,
    variantSize = 'md',
    variantTextPlacement = 'right',
    ...props
  }: CheckboxProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <div
      className={twMerge(
        'relative flex cursor-pointer items-center justify-center',
        'group/checkbox outline-none',
        variantSizes.spacings[variantSize],
        variantTextPlacement === 'left' && 'flex-row-reverse',
        description && 'items-start'
      )}
      onKeyDown={(e) => {
        if (['Enter', ' '].includes(e.key)) handleChange()
      }}
      tabIndex={0}
      {...props}
    >
      <div
        className={twMerge(
          'relative',
          'grid place-items-center rounded',
          variantSizes.checkboxSizes[variantSize],
          'border border-[#42454D] bg-[#141619] outline-none',
          !checked &&
            !indeterminate &&
            !disabled &&
            'group-hover/checkbox:border-[#9CA0AA] group-hover/checkbox:bg-[#191B1F]',
          !checked && !disabled && 'group-focus/checkbox:border-[#375DAF] group-focus/checkbox:bg-[#212226]',
          (checked || indeterminate) && 'border-[#375DAF] bg-[#212226]',
          disabled && 'cursor-not-allowed border-[#42454D] bg-[#191B1F]'
        )}
        onClick={handleChange}
        ref={ref}
      >
        <CheckLg
          onClick={handleChange}
          className={twMerge(
            'absolute transition-transform duration-200 ease-in-out',
            variantSizes.iconSizes[variantSize],
            disabled ? 'cursor-not-allowed text-[#42454D]' : 'text-[#5F7DBF]',
            checked ? 'scale-100' : 'scale-0'
          )}
        />

        <MinusLg
          onClick={handleChange}
          className={twMerge(
            'absolute transition-transform duration-200 ease-in-out',
            variantSizes.iconSizes[variantSize],
            disabled ? 'cursor-not-allowed text-[#42454D]' : 'text-[#5F7DBF]',
            indeterminate ? 'scale-100' : 'scale-0'
          )}
        />
      </div>

      {label && (
        <div
          className={twMerge(
            variantSizes.textSizes[variantSize],
            'cursor-pointer text-[#D3D5D9]',
            variantTextPlacement === 'left' && 'text-right',
            disabled && 'cursor-auto text-[#6B6F78]',
            description && 'grid gap-y-1',
            variantSizes.textLineHeight[variantSize]
          )}
          onClick={handleChange}
        >
          <p
            className={twMerge(!disabled && 'group-hover/checkbox:text-[#F5F5F5] group-focus/checkbox:text-[#F5F5F5]')}
          >
            {label}
          </p>
          <p className={twMerge('block text-wrap', variantSizes.maxDescriptionWidth[variantSize])}>{description}</p>
        </div>
      )}
    </div>
  )
}
export default React.forwardRef(Checkbox)
