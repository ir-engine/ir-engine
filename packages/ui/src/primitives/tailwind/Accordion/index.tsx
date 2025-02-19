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

import React, { ReactNode, forwardRef, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ChevronDownLg } from '../../../icons'

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  children?: ReactNode
  open?: boolean
}

const Accordion = forwardRef(
  (
    { title, subtitle, children, className, open, ...props }: AccordionProps,
    ref: React.MutableRefObject<HTMLDivElement>
  ): JSX.Element => {
    const [openState, setOpenState] = useState(false)
    const [maxHeight, setMaxHeight] = useState('0px')
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      setOpenState(!!open)
    }, [open])

    useEffect(() => {
      if (contentRef.current) {
        const content = contentRef.current
        if (openState) {
          const height = content.scrollHeight
          setMaxHeight(`${height}px`)
        } else {
          setMaxHeight('0px')
        }
      }
    }, [openState, children])

    return (
      <div className="w-full" {...props} ref={ref}>
        <div
          className={twMerge(
            'flex w-full cursor-pointer flex-col items-center justify-between gap-y-2 border-[0.5px] border-ui-outline bg-surface-3 p-2',
            openState ? 'rounded-t-md' : ''
          )}
          onClick={() => {
            setOpenState((v) => !v)
          }}
        >
          <div className="flex w-full items-center justify-between p-4">
            <h2 className="text-base font-semibold leading-4 text-text-primary">{title}</h2>
            <ChevronDownLg
              className={twMerge('h-5 w-5 text-text-primary duration-300', openState ? 'rotate-180' : '')}
            />
          </div>

          {subtitle && <p className="w-full text-base text-text-secondary">{subtitle}</p>}
        </div>

        <div
          className={twMerge(
            'w-full origin-top overflow-hidden border-[0.5px] border-ui-outline bg-surface-1 transition-[max-height] duration-300 ease-in-out',
            openState ? 'rounded-b-md' : ''
          )}
          style={{
            maxHeight
          }}
          ref={contentRef}
        >
          <div className="p-2">{children}</div>
        </div>
      </div>
    )
  }
)

export default Accordion
