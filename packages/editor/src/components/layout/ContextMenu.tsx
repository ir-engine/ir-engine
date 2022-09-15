import React from 'react'

import { Menu, PopoverPosition } from '@mui/material'

import styles from './styles.module.scss'

type ContextMenuProps = {
  open: boolean
  anchorEl: null | HTMLElement
  anchorPosition: undefined | PopoverPosition
  rootStyle?: React.CSSProperties | undefined
  onClose: () => void
}

export const ContextMenu = ({
  children,
  open,
  anchorEl,
  anchorPosition,
  rootStyle,
  onClose
}: React.PropsWithChildren<ContextMenuProps>) => {
  return (
    <Menu
      className={styles.contextMenu}
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      PaperProps={{
        style: rootStyle
      }}
      onContextMenu={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      {children}
    </Menu>
  )
}
