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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'
import { twMerge } from 'tailwind-merge'

const containerStyles = cva(
  `
  absolute right-0 z-40
  
  flex items-center justify-center 

  h-4 w-4

  rounded-full
  text-xs
  text-white
  
  bg-blue-500
`,
  {
    variants: {
      show: {
        true: ``,
        false: `collapse`
      },
      position: {
        bottom: `bottom-0`,
        top: `top-0`
      }
    },
    defaultVariants: {
      show: false,
      position: 'bottom' as 'bottom' | 'top'
    }
  }
)

type Variants = VariantProps<typeof containerStyles>

export type BaseBadgeProps = {
  number?: number
}

interface BadgeProps extends React.ButtonHTMLAttributes<HTMLDivElement>, BaseBadgeProps, Variants {}

export const Badge = ({ number, position, show, className }: BadgeProps) => {
  return (
    <div className={twMerge(containerStyles({ show, position }), className)}>
      <span className={'relative'}>{number}</span>
    </div>
  )
}
