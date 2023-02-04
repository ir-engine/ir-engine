import React, { ReactNode } from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import { Toolbar as MuiToolbar, ToolbarProps } from '@mui/material'

import IconButton from '../IconButton'
import Typography from '../Typography'

const Toolbar = (props: ToolbarProps) => <MuiToolbar {...props} />

Toolbar.displayName = 'Toolbar'

Toolbar.defaultProps = {
  children: (
    <>
      <IconButton icon={<MenuIcon />} />
      <Typography variant="h1" component="h2" />
    </>
  )
}

export default Toolbar
