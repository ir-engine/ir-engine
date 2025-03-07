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

import { ChevronDownSm, ChevronRightSm, Maximize02Sm } from '@ir-engine/ui/src/icons'
import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface EditorDropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  disabled?: boolean
  ItemIcon?: ({ className }: { className: string }) => JSX.Element
  onClick?: () => void
  label: string
  RightIcon1?: ({ className, onClick }: { className: string; onClick?: () => void }) => JSX.Element
  onRightIcon1Click?: () => void
  RightIcon2?: ({ className, onClick }: { className: string; onClick?: () => void }) => JSX.Element
  onRightIcon2Click?: () => void
  collapsed?: boolean
  className?: string
}

export default function EditorDropdownItem({
  selected,
  disabled,
  ItemIcon,
  label,
  onRightIcon1Click,
  RightIcon1,
  onRightIcon2Click,
  RightIcon2,
  onClick,
  className,
  collapsed,
  ...props
}: EditorDropdownItemProps) {
  const chevronArrowClassName = twMerge(
    'text-[#9CA0AA] transition-all ease-out',
    !disabled && 'group-hover/editor-dropdownitem:text-[#F5F5F5] group-focus/editor-dropdownitem:text-[#F5F5F5]',
    disabled && 'text-[#6B6F78]'
  )
  const itemIconClassName = twMerge(
    'h-4 w-4 text-[#9CA0AA]',
    !disabled && 'group-hover/editor-dropdownitem:text-[#F5F5F5] group-focus/editor-dropdownitem:text-[#F5F5F5]',
    disabled && 'text-[#42454D]'
  )
  const rightIconClassName = twMerge(
    'h-4 w-4 text-[#6B6F78]',
    !disabled && 'group-hover/editor-dropdownitem:text-[#9CA0AA]',
    disabled && 'text-[#42454D]'
  )

  console.log('the props style', props.style)

  return (
    <div
      className={twMerge(
        'flex w-full items-center gap-x-2',
        'cursor-pointer rounded px-2 py-1',
        'group/editor-dropdownitem',
        !disabled && 'bg-[#141619] hover:bg-[#141619] focus:bg-[#2C2E33]',
        selected && 'bg-[#2C2E33]',
        disabled && 'cursor-not-allowed bg-[#191B1F]',
        className
      )}
      onClick={() => !disabled && onClick?.()}
      tabIndex={0}
      onKeyUp={(event) => {
        if (!disabled && ['Enter', ' '].includes(event.key)) onClick?.()
      }}
      {...props}
    >
      {collapsed ? (
        <ChevronRightSm className={chevronArrowClassName} />
      ) : (
        <ChevronDownSm className={chevronArrowClassName} />
      )}
      {ItemIcon ? <ItemIcon className={itemIconClassName} /> : <Maximize02Sm className={itemIconClassName} />}
      <span
        className={twMerge(
          'flex-1 text-sm text-[#B2B5BD]',
          !disabled && 'group-hover/editor-dropdownitem:text-[#F5F5F5] group-focus/editor-dropdownitem:text-[#F5F5F5]',
          disabled && 'text-[#42454D]'
        )}
      >
        {label}
      </span>
      {RightIcon1 && <RightIcon1 className={rightIconClassName} onClick={onRightIcon1Click} />}
      {RightIcon2 && <RightIcon2 className={rightIconClassName} onClick={onRightIcon2Click} />}
    </div>
  )
}
