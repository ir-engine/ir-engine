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
import Popup from 'reactjs-popup'
import { PopupProps } from 'reactjs-popup/dist/types'
import { twMerge } from 'tailwind-merge'
import './tooltip.css'

export type TooltipProps = {
  title?: ReactNode
  titleClassName?: string
  content: ReactNode
  children: React.ReactElement
} & PopupProps

const Tooltip = ({ title, titleClassName, content, children, className, ...rest }: TooltipProps) => {
  return (
    <Popup
      trigger={<div style={{ all: 'unset' }}>{children}</div>}
      on="hover"
      keepTooltipInside
      repositionOnResize
      arrow={false}
      contentStyle={{
        animation: 'expandFromCenter 0.3s cubic-bezier(0.38, 0.1, 0.36, 0.9) forwards',
        transformOrigin: 'center'
      }}
      {...rest}
    >
      <div className="-mt-1 grid text-wrap shadow-lg transition-all">
        {title && (
          <span
            className={twMerge(
              'block rounded-t border-b border-b-[#212226] bg-[#141619] px-3 py-1.5 text-sm text-[#F5F5F5]',
              titleClassName
            )}
          >
            {title}
          </span>
        )}
        <div
          className={twMerge(
            'bg-theme-studio-surface px-3 py-2 text-sm text-[#F5F5F5]',
            title ? 'rounded-b' : 'rounded',
            className
          )}
        >
          {content}
        </div>
      </div>
    </Popup>
  )
}

export default Tooltip
