import React from 'react'
import ClickAwayListener from './ClickAwayListener'

type ContextMenuProps = {
  open: boolean
  anchorEl: null | HTMLElement
  anchorPosition: any
  onClose: () => void
}

export const ContextMenu = ({
  children,
  open,
  anchorEl,
  anchorPosition,
  onClose
}: React.PropsWithChildren<ContextMenuProps>) => {
  const positionX = anchorPosition?.left - anchorEl?.getBoundingClientRect().left!
  const positionY = anchorPosition?.top - anchorEl?.parentElement?.parentElement?.getBoundingClientRect().top!

  console.log('DEBUG', positionX, positionY)
  return (
    <ClickAwayListener onClickAway={() => onClose()}>
      <div className={`${open ? 'block' : 'hidden'}`}>
        {open && anchorEl && (
          <div
            className="absolute z-[200] w-40 rounded-lg bg-neutral-900 shadow-lg"
            style={{ top: `${positionY}px`, left: `${positionX}px` }}
          >
            <div className="flex flex-col py-1">{children}</div>
          </div>
        )}
      </div>
    </ClickAwayListener>
  )
}

export default ContextMenu
