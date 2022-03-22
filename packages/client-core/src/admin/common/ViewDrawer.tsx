import React from 'react'

import Drawer from '@mui/material/Drawer'
import Paper from '@mui/material/Paper'

import { useStyles } from '../styles/ui'

interface Props {
  openView: boolean
  handleCloseDrawer: () => void
  children: JSX.Element | JSX.Element[]
}

export default function ViewDrawer(props: Props) {
  const { openView, handleCloseDrawer, children } = props
  const classes = useStyles()
  return (
    <React.Fragment>
      <Drawer
        anchor="right"
        open={openView}
        onClose={() => handleCloseDrawer()}
        classes={{ paper: classes.paperDrawer }}
      >
        {children}
      </Drawer>
    </React.Fragment>
  )
}
