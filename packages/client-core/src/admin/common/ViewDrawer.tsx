import React from 'react'

import Drawer from '@mui/material/Drawer'

import styles from '../styles/admin.module.scss'

interface Props {
  openView: boolean
  handleCloseDrawer: () => void
  children: JSX.Element | JSX.Element[]
}

export default function ViewDrawer(props: Props) {
  const { openView, handleCloseDrawer, children } = props

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
