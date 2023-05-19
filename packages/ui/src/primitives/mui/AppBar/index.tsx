import React, { ReactNode } from 'react'

import Toolbar from '@etherealengine/ui/src/primitives/mui/Toolbar'

import { AppBarProps, AppBar as MuiAppBar } from '@mui/material'

const AppBar = (props: AppBarProps) => <MuiAppBar {...props} />

AppBar.displayName = 'AppBar'

AppBar.defaultProps = {
  children: (
    <>
      <Toolbar />
    </>
  )
}

export default AppBar
