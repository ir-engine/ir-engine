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
  anchorEvent: null | React.MouseEvent<HTMLElement>
  panelId: string
  anchorPosition?: undefined | { left: number; top: number }
  onClose: () => void
  className?: string
}

export const ContextMenu = ({
  children,
  anchorEvent,
  panelId,
  anchorPosition: propAnchorPosition,
  onClose,
  className
}: React.PropsWithChildren<ContextMenuProps>) => {
  const [open, setOpen] = React.useState(false)
  const panel = document.getElementById(panelId)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const [isScrollable, setIsScrollable] = useState(false)
  const parentRect = panel?.getBoundingClientRect()

  // Calculate the Y position of the context menu based on the menu height and space to the bottom of the viewport in order to avoid overflow
  const calculatePositionY = () => {
    let positionY = anchorEvent?.currentTarget.getBoundingClientRect().bottom! ?? 0

    if (open && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight

      const viewportHeight = window.innerHeight

      // Adjust Y position to avoid overflow
      if (positionY + menuHeight > viewportHeight) {
        positionY = viewportHeight - menuHeight - 10 // 10px for padding
      }
      if (positionY < 0) {
        positionY = 10 // 10px for padding
      }
    }

    return positionY
  }

  // Calculate the X position of the context menu based on the menu width and space to the right of the panel in order to avoid overflow
  const calculatePositionX = () => {
    let positionX = anchorEvent?.currentTarget.getBoundingClientRect().left! ?? 0

    if (open && menuRef.current) {
      const menuWidth = menuRef.current.offsetWidth
      const viewportWidth = window.innerWidth

      // Adjust X position to avoid overflow
      if (positionX + menuWidth > viewportWidth) {
        positionX = viewportWidth - menuWidth - 10 // 10px for padding
      }
      if (positionX < 0) {
        positionX = 10 // 10px for padding
      }
    }

    return positionX
  }

  const [positionX, setPositionX] = useState(calculatePositionX())
  const [positionY, setPositionY] = useState(calculatePositionY())

  useEffect(() => {
    if (open && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight
      const parentHeight = parentRect?.height || 0

      // Make the menu scrollable if it is too tall for the parent component
      setIsScrollable(parentHeight <= menuHeight + 1)

      setPositionY(calculatePositionY())
      setPositionX(calculatePositionX())
    }
  }, [open])

  useEffect(() => {
    if (anchorEvent) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [anchorEvent])

  return (
    <ClickAwayListener onClickAway={() => onClose()}>
      <div className={`${open ? 'block' : 'hidden'}`}>
        {open && (
          <div
            ref={menuRef}
            className="absolute z-[200] w-fit min-w-44 rounded-lg bg-neutral-900 shadow-lg"
            style={{
              top: `${positionY}px`,
              left: `${positionX}px`,
              maxWidth: `${panel?.getBoundingClientRect().width}px`,
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
