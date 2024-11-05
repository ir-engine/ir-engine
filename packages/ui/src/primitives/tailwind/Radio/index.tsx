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
import { twMerge } from 'tailwind-merge'

export interface RadioProps {
  disabled?: boolean
  label: string
  onClick?: (value: any) => void
  value: any
  checked?: boolean
  description?: string
  variant?: 'sm' | 'md'
}

const outerCircleVariant = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5'
}

const innerCircleSizeVariant = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5'
}

/**individual radio element */
export const Radio = ({ disabled, label, onClick, value, description, checked, variant = 'sm' }: RadioProps) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (disabled) return
    onClick?.(value)
  }
  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (disabled) return
    if (['Enter', ' '].includes(event.key)) {
      onClick?.(value)
    }
  }

  return (
    <div
      className="group flex items-center gap-x-2 outline-none"
      tabIndex={1}
      onClick={handleClick}
      onKeyUp={handleKeyUp}
    >
      <div
        className={twMerge(
          outerCircleVariant[variant],
          'grid cursor-pointer place-items-center rounded-full border',
          !disabled && 'border-[#212226] group-hover:border-[#9CA0AA] group-focus:border-[#375DAF]',
          !disabled && 'bg-[#141619] group-hover:bg-[#191B1F] group-focus:bg-[#212226]',
          disabled && 'cursor-not-allowed border-[#42454D] bg-[#191B1F]'
        )}
      >
        <div
          className={twMerge(
            innerCircleSizeVariant[variant],
            'block rounded-full',
            !checked && 'hidden',
            !disabled && 'bg-[#5F7DBF] group-hover:bg-[#5F7DBF] group-focus:bg-[#5F7DBF]',
            disabled && 'bg-[#42454D]'
          )}
        />
      </div>
      <div
        className={twMerge(
          'flex flex-col',
          !disabled && 'text-start text-[#D3D5D9] group-hover:cursor-pointer',
          disabled && 'text-[#6B6F78]'
        )}
      >
        <span className={twMerge(!disabled && 'group-hover:text-[#F5F5F5] group-focus:text-[#F5F5F5]')}>{label}</span>
        <span>{description}</span>
      </div>
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
  /**className for the root div */
  className?: string
  variant?: RadioProps['variant']
}

type OptionValueType = string | number

/**group of radio elements */
const RadioGroup = <T extends OptionValueType>({
  disabled,
  onChange,
  options,
  horizontal,
  className,
  value,
  variant
}: RadioGroupProps<T>) => {
  return (
    <div className={twMerge('grid gap-6', horizontal && 'grid-flow-col', className)}>
      {options.map(({ label: optionLabel, value: valueOption, description }) => (
        <Radio
          variant={variant}
          key={valueOption}
          disabled={disabled}
          label={optionLabel}
          onClick={(value) => onChange(value)}
          value={valueOption}
          description={description}
          checked={value === valueOption}
        />
      ))}
    </div>
  )
}

export default RadioGroup
