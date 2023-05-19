import React from 'react'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { Toolbar as MuiToolbar, ToolbarProps } from '@mui/material'

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
