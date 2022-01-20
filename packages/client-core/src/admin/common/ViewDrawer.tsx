import React from 'react'
import Drawer from '@mui/material/Drawer'
import Paper from '@mui/material/Paper'
import { useStyles } from '../styles/ui'

interface Props {
  openView: boolean
  handleCloseDrawe: () => void
  children: any
}

export default function ViewDrawer(props: Props) {
  const { openView, handleCloseDrawe, children } = props
  const classes = useStyles()
  console.log(openView)
  return (
    <React.Fragment>
      <Drawer
        anchor="right"
        open={openView}
        onClose={() => handleCloseDrawe()}
        classes={{ paper: classes.paperDrawer }}
      >
        {children}
      </Drawer>
    </React.Fragment>
  )
}
