import React from 'react'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import { useStyle, useStyles } from './style'

const InviteHarmony = ({ open, handleClose }) => {
  const classes = useStyles()
  const classex = useStyle()

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={() => handleClose(false)}
      onOpen={() => handleClose(true)}
      classes={{ paper: classex.paper }}
    >
      <h1>Hello world!</h1>
    </SwipeableDrawer>
  )
}

export default InviteHarmony
