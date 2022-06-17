import React from 'react'

import Drawer from '@mui/material/Drawer'

import styles from '../styles/admin.module.scss'

interface Props {
  open: boolean
  children?: React.ReactNode
  onClose: () => void
}

const DrawerView = ({ open, children, onClose }: Props) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} classes={{ paper: styles.paperDrawer }}>
      {children}
    </Drawer>
  )
}

export default DrawerView
