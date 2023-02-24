import React, { ReactNode } from 'react'

import { AppBarProps, AppBar as MuiAppBar } from '@mui/material'

import Toolbar from '../Toolbar'

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
