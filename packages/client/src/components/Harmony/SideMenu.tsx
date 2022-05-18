import React from 'react'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import { useStyle } from './style'
import LeftHarmony from '@xrengine/client-core/src/harmony/components/leftHamony'

const SideMenu = ({ open, handleClose }) => {
  const classex = useStyle()
  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={() => handleClose(false)}
      onOpen={() => handleClose(true)}
      classes={{ paper: classex.paper }}
    >
      <LeftHarmony />
    </SwipeableDrawer>
  )
}

export default SideMenu
