import React from 'react'

import Drawer from '@mui/material/Drawer'

import styles from '../styles/admin.module.scss'

interface Props {
  openView: boolean
  handleCloseDrawer: () => void
  children: JSX.Element | JSX.Element[]
}

export default function ViewDrawer({ openView, handleCloseDrawer, children }: Props) {
  return (
    <React.Fragment>
      <Drawer
        anchor="right"
        open={openView}
        onClose={() => handleCloseDrawer()}
        classes={{ paper: styles.paperDrawer }}
      >
        {children}
      </Drawer>
    </React.Fragment>
  )
}
