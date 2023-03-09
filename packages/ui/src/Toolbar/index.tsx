import React from 'react'

import { Toolbar as MuiToolbar, ToolbarProps } from '@mui/material'

import Icon from '../Icon'
import IconButton from '../IconButton'
import Typography from '../Typography'

const Toolbar = (props: ToolbarProps) => <MuiToolbar {...props} />

Toolbar.displayName = 'Toolbar'

Toolbar.defaultProps = {
  children: (
    <>
      <IconButton icon={<Icon type="Menu" />} />
      <Typography variant="h1" component="h2" />
    </>
  )
}

export default Toolbar
