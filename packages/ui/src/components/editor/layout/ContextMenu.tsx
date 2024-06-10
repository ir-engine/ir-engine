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

import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import ClickAwayListener from './ClickAwayListener'

type ContextMenuProps = {
  open: boolean
  anchorEl: null | HTMLElement
  panelId: string
  anchorPosition: { left: number; top: number }
  onClose: () => void
  className?: string
}

export const ContextMenu = ({
  children,
  open,
  anchorEl,
  panelId,
  anchorPosition,
  onClose,
  className
}: React.PropsWithChildren<ContextMenuProps>) => {
  const panel = document.getElementById(panelId)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Calculate the Y position of the context menu based on the menu height and space to the bottom of the viewport in order to avoid overflow
  const calculatePositionY = () => {
    let positionY = open ? anchorPosition.top - panel?.getBoundingClientRect().top! : 0

    if (open && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight

      // if the panel height is less than the menu height plus the menu pos y offset, we need to move the menu up
      const offset = panel?.getBoundingClientRect().height! - (menuHeight + positionY)
      if (offset < 0) {
        positionY = positionY + offset
      }
    }

    return positionY
  }

  const positionX = open ? anchorPosition.left - panel?.getBoundingClientRect().left! : 0
  const [positionY, setPositionY] = useState(calculatePositionY())

  const [isScrollable, setIsScrollable] = useState(false)
  const parentRect = panel?.getBoundingClientRect()

  useEffect(() => {
    if (open && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight
      const parentHeight = parentRect?.height || 0

      // Make the menu scrollable if it is too tall for the parent component
      setIsScrollable(parentHeight <= menuHeight + 1)

      setPositionY(calculatePositionY())
    }
  }, [open])

  return (
    <ClickAwayListener onClickAway={() => onClose()}>
      <div className={`${open ? 'block' : 'hidden'}`}>
        {open && anchorEl && (
          <div
            ref={menuRef}
            className="absolute z-[200] w-44 rounded-lg bg-neutral-900 shadow-lg"
            style={{
              top: `${positionY}px`,
              left: `${positionX}px`,
              maxHeight: `${panel?.getBoundingClientRect().height}px`,
              overflowY: isScrollable ? 'auto' : 'visible'
            }}
          >
            <div className={twMerge('flex flex-col truncate py-1', className)}>{children}</div>
          </div>
        )}
      </div>
    </ClickAwayListener>
  )
}

export default ContextMenu
