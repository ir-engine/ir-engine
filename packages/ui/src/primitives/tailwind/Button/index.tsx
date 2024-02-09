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

import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Button component
 *
 * @param {ReactNode} startIcon - SVG Icon placed before the children.
 * @param {ReactNode} endIcon - SVG Icon placed after the children.
 * @param {ReactNode} children
 * @param {'small' | 'medium' | 'large'} [size] - The size of the component. small is equivalent to the dense button styling.
 * @param {boolean} [fullWidth] - If true, the button will take up the full width of its container
 */

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  startIcon?: ReactNode
  endIcon?: ReactNode
  children?: ReactNode
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'outline' | 'danger' | 'success'
  disabled?: boolean
  fullWidth?: boolean
  rounded?: boolean
  className?: string
}

const sizes = {
  small: 'text-sm px-3 py-2',
  medium: 'text-base px-4 py-2',
  large: 'text-lg px-7 py-3'
}

const variants = {
  primary: 'bg-blue-800',
  outline: 'border border-solid border-gray-200 text-theme-primary',
  success: 'bg-teal-700',
  danger: 'bg-pink-500'
}

const Button = ({
  startIcon: StartIcon,
  children,
  endIcon: EndIcon,
  size = 'medium',
  fullWidth,
  rounded,
  variant = 'primary',
  disabled = false,
  className,
  ...props
}: ButtonProps): JSX.Element => {
  const twClassName = twMerge(
    'flex items-center justify-between',
    'font-[Inter] font-medium text-white',
    'transition ease-in-out',
    'inline-flex items-center justify-center',
    sizes[size],
    variants[variant],
    fullWidth ? 'w-full' : 'w-fit',
    rounded ? 'rounded-full' : 'rounded-md',
    disabled ? 'bg-neutral-200 text-neutral-400' : '',
    className
  )

  return (
    <button className={twClassName} {...props}>
      {StartIcon && <span className="mx-1">{StartIcon}</span>}
      {children && <span className={twMerge('mx-1', fullWidth ? 'mx-auto' : '')}> {children}</span>}
      {EndIcon && <span className="mx-1">{EndIcon}</span>}
    </button>
  )
}

export default Button
