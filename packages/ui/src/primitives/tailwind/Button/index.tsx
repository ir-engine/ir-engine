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

import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const sizes = {
  xs: 'h-6',
  sm: 'h-7',
  l: 'h-8',
  xl: 'h-10'
} as const

const variants = {
  primary: 'bg-[#375DAF] hover:bg-[#214AA6] focus:bg-[#375DAF] disabled:bg-[#5F7DBF] disabled:text-[#AFBEDF]',
  secondary: 'bg-[#162546] hover:bg-[#213869] focus:bg-[#213869] disabled:bg-[#375DAF] disabled:text-white',
  tertiary: 'border border-[#162546] disabled:text-white',
  green: 'bg-[#0D9467] hover:bg-[#10B981] focus:bg-[#10B981] disabled:bg-[#0A6F4D] disabled:text-white',
  red: 'bg-[#F43F5E] hover:bg-[#FB7185] focus:bg-[#F43F5E] disabled:bg-[#C3324B] disabled:text-white'
} as const

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  size?: keyof typeof sizes
  variant?: keyof typeof variants
  fullWidth?: boolean
}

const Button = (
  { children, size = 'l', fullWidth, variant = 'primary', className, ...props }: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  return (
    <button
      ref={ref}
      role="button"
      className={twMerge(
        'flex items-center justify-center gap-1 rounded-md',
        'text-sm font-medium leading-4 text-white',
        'px-4 py-1',
        sizes[size],
        fullWidth ? 'w-full' : 'w-fit',
        'disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default React.forwardRef(Button)
