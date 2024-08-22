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

import { LuInfo } from 'react-icons/lu'
import { MdOutlineHelpOutline } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import Label from '../../../../primitives/tailwind/Label'
import Tooltip from '../../../../primitives/tailwind/Tooltip'

/**
 * Used to provide styles for InputGroupContainer div.
 */
export const InputGroupContainer = ({ disabled = false, children, ...rest }) => (
  <div
    className={
      disabled ? 'pointer-events-none opacity-30' : 'flex min-h-[24px] flex-auto flex-row flex-nowrap px-2 py-1'
    }
    {...rest}
  >
    {children}
  </div>
)

/**
 * Used to provide styles for InputGroupContent div.
 */
export const InputGroupContent = ({ extraClassName = '', children }) => (
  <div
    className={twMerge(
      'ml-4 flex justify-between',
      '[&>label]:block [&>label]:w-[35%] [&>label]:pb-0.5 [&>label]:pt-1 [&>label]:text-neutral-400',
      'text-xs font-normal text-neutral-400',
      '[&>*:first-child]:max-w-[calc(100%_-_2px)]',
      extraClassName
    )}
  >
    {children}
  </div>
)

export const InputGroupVerticalContainer = ({ disabled = false, children }) => (
  <div
    className={twMerge(
      disabled ? 'pointer-events-none opacity-30' : '',
      '[&>label]:block [&>label]:w-[35%] [&>label]:pb-0.5 [&>label]:pt-1 [&>label]:text-[color:var(--textColor)]'
    )}
  >
    {children}
  </div>
)

export const InputGroupVerticalContainerWide = ({ disabled = false, children }) => (
  <div
    className={twMerge(
      disabled ? 'pointer-events-none opacity-30' : '',
      '[&>label]:block [&>label]:w-full [&>label]:pb-0.5 [&>label]:pt-1 [&>label]:text-[color:var(--textColor)]'
    )}
  >
    {children}
  </div>
)

export const InputGroupVerticalContent = ({ children }) => <div className="flex flex-1 flex-col pl-2">{children}</div>
/**
 * Used to provide styles for InputGroupInfoIcon div.
 */
// change later
// .info  text-[color:var(--textColor)] h-4 w-auto ml-[5px]
export const InputGroupInfoIcon = ({ onClick = () => {} }) => (
  <MdOutlineHelpOutline
    className="ml-[5px] flex w-[18px] cursor-pointer self-center text-[color:var(--iconButtonColor)]"
    onClick={onClick}
  />
)

export interface InputGroupProps {
  name?: string
  label: string
  info?: string
  disabled?: boolean
  children: React.ReactNode
  containerClassName?: string
  labelClassName?: string
  infoClassName?: string
  className?: string
}

/**
 * InputGroup used to render the view of component.
 */
export function InputGroup({
  children,
  info,
  label,
  containerClassName,
  labelClassName,
  infoClassName,
  className
}: InputGroupProps) {
  return (
    <div className={twMerge('my-1 flex flex-wrap items-center justify-end', containerClassName)}>
      <div className="mr-2 flex">
        <Label className={twMerge('mr-2.5 text-wrap text-end text-xs text-[#A0A1A2]', labelClassName)}>{label}</Label>
        {info && (
          <Tooltip content={info}>
            <LuInfo className={twMerge('h-5 w-5 text-[#A0A1A2]', infoClassName)} />
          </Tooltip>
        )}
      </div>
      <div className={twMerge('w-60', className)}>{children}</div>
    </div>
  )
}

export default InputGroup
