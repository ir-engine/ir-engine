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

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export const buttonStyles = cva(
  [
    'flex items-center justify-center gap-1',
    'text-sm font-medium leading-4',
    'px-4 py-1',
    'disabled:cursor-not-allowed'
  ],
  {
    variants: {
      color: {
        primary:
          'bg-ui-primary text-text-primary-button hover:bg-ui-hover-primary focus:bg-ui-select-primary disabled:bg-ui-inactive-primary disabled:text-text-inactive',
        secondary:
          'bg-ui-secondary text-text-primary-button hover:bg-ui-hover-secondary focus:bg-ui-select-secondary disabled:bg-ui-inactive-secondary disabled:text-text-inactive',
        tertiary:
          'text-text-primary border border-ui-secondary hover:border-ui-hover-secondary focus:border-ui-select-secondary disabled:border-ui-inactive-secondary disabled:text-text-inactive',
        green:
          'bg-ui-success text-text-primary-button hover:bg-ui-hover-success focus:bg-ui-select-success disabled:bg-ui-inactive-success disabled:text-text-inactive',
        red: 'bg-ui-error text-text-primary-button hover:bg-ui-hover-error focus:bg-ui-select-error disabled:bg-ui-inactive-error disabled:text-text-inactive'
      },
      size: {
        xs: 'h-6',
        sm: 'h-7',
        l: 'h-8',
        xl: 'h-10'
      },
      radius: {
        primary: 'rounded-[0.625rem]',
        secondary: 'rounded-[0.625rem]',
        tertiary: 'rounded-[0.625rem]',
        green: 'rounded-lg',
        red: 'rounded-lg'
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-fit'
      }
    },
    defaultVariants: {
      color: 'primary',
      radius: 'primary',
      size: 'l',
      fullWidth: false
    }
  }
)

export type ButtonVariants = VariantProps<typeof buttonStyles>

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  size?: ButtonVariants['size']
  variant?: ButtonVariants['color']
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
        buttonStyles({
          radius: variant,
          color: variant,
          fullWidth,
          size
        }),
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default React.forwardRef(Button)
