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

import { useHookstate } from '@etherealengine/hyperflux'
import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Text from '../Text'

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  expandIcon: ReactNode
  shrinkIcon: ReactNode
  children?: ReactNode
  className?: string
}

const Accordion = ({
  title,
  subtitle,
  expandIcon,
  shrinkIcon,
  children,
  className,
  ...props
}: AccordionProps): JSX.Element => {
  const twClassName = twMerge('bg-theme-primary w-full rounded-2xl p-6 ', className)
  const open = useHookstate(false)

  return (
    <div className={twClassName} {...props}>
      <div
        className="flex w-full cursor-pointer justify-between"
        onClick={() => {
          open.set((v) => !v)
        }}
      >
        <Text component="h2" fontSize="lg" fontWeight="semibold">
          {title}
        </Text>

        {open.value ? shrinkIcon : expandIcon}
      </div>

      {!open.value && (
        <Text component="h3" fontSize="base" fontWeight="light" className="mt-2 w-full dark:text-[#A3A3A3]">
          {subtitle}
        </Text>
      )}

      {open.value && children}
    </div>
  )
}

export default Accordion
