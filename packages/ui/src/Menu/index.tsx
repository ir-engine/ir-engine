import React, { ReactNode } from 'react'

import { MenuProps, Menu as MuiMenu } from '@mui/material'

const Menu = (props: MenuProps) => <MuiMenu {...props} />

Menu.displayName = 'Menu'

Menu.defaultProps = {
  open: false
}

export default Menu
