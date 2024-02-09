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
import { FaCheckCircle } from 'react-icons/fa'
import { IoIosWarning } from 'react-icons/io'
import { MdDangerous } from 'react-icons/md'
import { PiInfoFill } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'

export interface CalloutTextProps extends React.HTMLAttributes<HTMLElement> {
  variant: 'info' | 'error' | 'success' | 'warning'
  children?: ReactNode
  className?: string
}

const variantMap = {
  info: {
    icon: PiInfoFill,
    lightColor: 'bg-sky-100',
    darkColor: 'bg-sky-300'
  },
  error: {
    icon: MdDangerous,
    lightColor: 'bg-rose-100',
    darkColor: 'bg-rose-300'
  },
  success: {
    icon: FaCheckCircle,
    lightColor: 'bg-emerald-100',
    darkColor: 'bg-emerald-300'
  },
  warning: {
    icon: IoIosWarning,
    lightColor: 'bg-orange-100',
    darkColor: 'bg-orange-300'
  }
}

const CalloutText = ({ variant, children, className, ...props }: CalloutTextProps): JSX.Element => {
  const classes = twMerge(
    'flex items-center justify-start',
    'rounded-lg p-4',
    variantMap[variant].lightColor,
    `dark:${variantMap[variant].darkColor}`,
    'text-primary',
    className
  )
  const Icon = variantMap[variant].icon
  return (
    <div className={classes} {...props}>
      <Icon
        size="1.5rem"
        className={`mr-2 min-h-6	min-w-6 ${variantMap[variant].lightColor.replace('bg', 'text')} dark:${variantMap[
          variant
        ].darkColor.replace('bg', 'text')}]`}
      />
      {children}
    </div>
  )
}

export default CalloutText
