import React from 'react'

import Drawer, { DrawerClasses } from '@mui/material/Drawer'

import styles from '../styles/admin.module.scss'

interface Props {
  open: boolean
  classes?: Partial<DrawerClasses> | undefined
  children?: React.ReactNode
  onClose: () => void
}

const DrawerView = ({ open, classes, children, onClose }: Props) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} classes={{ paper: styles.paperDrawer, ...classes }}>
      {children}
    </Drawer>
  )
}

export default DrawerView
