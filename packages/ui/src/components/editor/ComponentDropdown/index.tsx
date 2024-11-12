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

import React, { useState } from 'react'
import { HiCube, HiMiniXMark, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

export interface ComponentDropdownProps {
  name?: string
  description?: string
  /**icon for this component (by default: a cube icon will be shown) */
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**action when the component is removed */
  onClose?: () => void
  children?: React.ReactNode
  minimizedDefault?: boolean
}

export default function ComponentDropdown({
  minimizedDefault,
  Icon = HiCube,
  name,
  description,
  children,
  onClose
}: ComponentDropdownProps) {
  const [isMinimized, setIsMinimized] = useState(minimizedDefault ?? true)

  return (
    <div
      className={twMerge(
        'group/component-dropdown w-full rounded bg-[#212226] p-2 transition-all duration-300 ease-out focus:border focus:border-[#375DAF] focus:outline-0',
        isMinimized && 'h-10'
      )}
      tabIndex={0}
    >
      <div className="flex items-center">
        <button
          className="my-1 text-[#9CA0AA] group-hover/component-dropdown:text-[#F5F5F5] group-focus/component-dropdown:text-[#F5F5F5]"
          title={isMinimized ? 'maximize' : 'minimize'}
          onClick={() => setIsMinimized((prev) => !prev)}
        >
          {isMinimized ? <HiOutlineChevronRight className="h-4 w-4" /> : <HiOutlineChevronDown className="h-4 w-4" />}
        </button>
        <button className="ml-2 text-[#9CA0AA] group-hover/component-dropdown:text-[#F5F5F5] group-focus/component-dropdown:text-[#F5F5F5]">
          <Icon className="h-5 w-5" />
        </button>
        <span className="ml-1 text-sm leading-6 text-[#B2B5BD] group-hover/component-dropdown:text-[#D3D5D9] group-focus/component-dropdown:text-[#F5F5F5]">
          {name}
        </span>
        <button
          className="ml-auto text-[#1A1B1E] group-hover/component-dropdown:text-[#6B6F78] group-focus/component-dropdown:text-[#6B6F78]"
          onClick={onClose}
        >
          <HiMiniXMark className="h-2 w-2 group-hover/component-dropdown:h-4 group-hover/component-dropdown:w-4 group-focus/component-dropdown:h-4 group-focus/component-dropdown:w-4" />
        </button>
      </div>
      {!isMinimized && <div className="text-center text-xs leading-[18px] text-[#D3D5D9]">{description}</div>}
      <div className={twMerge('mt-4', isMinimized && 'hidden')}>{children}</div>
    </div>
  )
}
