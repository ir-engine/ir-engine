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

interface TooltipProps {
  title: ReactNode
  children: React.ReactElement
}

const Tooltip = ({ title, children, className, ...rest }: TooltipProps & PopupProps) => {
  return (
    <Popup
      trigger={<div style={{ all: 'unset' }}>{children}</div>}
      on="hover"
      keepTooltipInside
      repositionOnResize
      arrow={false}
      {...rest}
    >
      <span
        className={twMerge(
          '-mt-5 text-wrap rounded bg-gray-800 p-1 text-xs text-white shadow-lg transition-all',
          className
        )}
      >
        {title}
      </span>
    </Popup>
  )
}

export default Tooltip
