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
import { HiCheck } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

export interface DropdownItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  /**text shown on the left end */
  label: string
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**text shown on the right end */
  secondaryText?: string
  disabled?: boolean
  selected?: boolean

  /**
   * Whether the item is hovered (or navigated through arrow keys)
   */
  active?: boolean
}

export function DropdownItem({ label, disabled, active, Icon, selected, secondaryText, ...props }: DropdownItemProps) {
  return (
    <div
      tabIndex={0}
      className={twMerge(
        'h-[38px] w-full cursor-pointer bg-[#141619] px-4 py-2.5 text-xs text-[#9CA0AA] outline-none',
        'flex items-center',
        !disabled && active && 'text-[#F5F5F5]',
        !disabled && selected && 'bg-[#191B1F] text-[#375DAF]',
        disabled && 'cursor-not-allowed bg-[#191B1F] text-[#42454D]'
      )}
      {...props}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon className={twMerge('h-3 w-3', selected && 'text-[#F5F5F5]')} />}
        {label}
      </span>
      {secondaryText && <span className="ml-auto">{secondaryText}</span>}
      {!secondaryText && selected && <HiCheck className="ml-auto h-3 w-3 stroke-2" />}
    </div>
  )
}
