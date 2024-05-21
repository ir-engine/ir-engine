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

import React from 'react'
import { twMerge } from 'tailwind-merge'
import ClickAwayListener from './ClickAwayListener'

type ContextMenuProps = {
  className?: string
  open: boolean
  anchorEl: null | HTMLElement
  panelId: string
  anchorPosition: any
  onClose: () => void
}

export const PopOver = ({
  children,
  open,
  anchorEl,
  panelId,
  anchorPosition,
  className,
  onClose
}: React.PropsWithChildren<ContextMenuProps>) => {
  const panel = document.getElementById(panelId)
  const positionX = anchorPosition?.left - panel?.getBoundingClientRect().left!
  const positionY = anchorPosition?.top - panel?.getBoundingClientRect().top!
  return (
    <ClickAwayListener onClickAway={() => onClose()}>
      <div className={`${open ? 'block' : 'hidden'}`}>
        {open && anchorEl && (
          <div
            className={twMerge('absolute z-[200] w-40 rounded-lg bg-neutral-900 shadow-lg', className)}
            style={{ top: `${positionY}px`, left: `${positionX}px` }}
          >
            {children}
          </div>
        )}
      </div>
    </ClickAwayListener>
  )
}

export default PopOver
