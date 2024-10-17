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

import { isEmpty } from 'lodash'
import React, { forwardRef, ReactNode } from 'react'
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle } from 'react-icons/hi2'
import { PiWarningFill } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'

export enum AlertVariantEnum {
  SUCCESS = 'success',
  DANGER = 'danger',
  INFO = 'info',
  WARNING = 'warning'
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message: string | React.ReactNode
  variant: AlertVariantEnum
}

type AlertVariant = {
  containerClass: string
  iconClass: string
  icon: ReactNode
}

const variantMap: Record<string, AlertVariant> = {
  success: {
    containerClass: 'bg-teal-100',
    iconClass: 'text-teal-500',
    icon: <HiCheckCircle />
  },
  danger: {
    containerClass: 'bg-[#310d13]',
    iconClass: 'text-red-500',
    icon: <PiWarningFill color="#c3324b" />
  },
  info: {
    containerClass: 'bg-blue-100',
    iconClass: 'text-blue-500',
    icon: <HiInformationCircle />
  },
  warning: {
    containerClass: 'bg-[#3A2715]',
    iconClass: 'text-[#EAB308]',
    icon: <HiExclamationCircle />
  }
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(({ title, message, variant, className, children }, ref) => {
  const { containerClass, iconClass, icon } = variantMap[variant]
  const twContainerClass = twMerge('rounded-lg px-4 py-3 shadow-md', containerClass, className)
  const twIconClass = twMerge('mr-4 py-1 text-2xl', iconClass)

  return (
    <div className={twContainerClass} role="alert" ref={ref}>
      <div className="flex">
        <div className={twIconClass}>{icon}</div>
        <div>
          {title && <p className="font-medium">{title}</p>}
          {isEmpty(children) && <p className="text-sm text-gray-400">{message}</p>}
          {!isEmpty(children) && <>{children}</>}
        </div>
      </div>
    </div>
  )
})

export default Alert
